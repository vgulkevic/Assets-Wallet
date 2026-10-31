#!/usr/bin/env node
// One-time import of history that existed before the app recorded it. Safe to re-run: nothing is overwritten.
//
//   node import-history.mjs --stage prod --user-id <cognito sub> [--net-worth <file> --currency EUR] [--baseline] [--dry-run]
//
// --net-worth <file>  lines like "10.2026 - 387700" (month.year - total). Each becomes an "import" entry on the last
//                     day of that month, converted to GBP/USD/EUR with the ECB rate of that day (Frankfurter).
// --baseline          records every current asset's value as its "starting value" in the asset history,
//                     for assets that have no history yet.
//
// Run from backend/ with the layer's dependencies:  NODE_PATH=js-common/nodejs/node_modules AWS_PROFILE=... node scripts/import-history.mjs ...
import {readFileSync} from "node:fs";
import {parseArgs} from "node:util";
import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {DynamoDBDocument} = require("@aws-sdk/lib-dynamodb");

const CURRENCIES = ["GBP", "USD", "EUR"];

const {values: args} = parseArgs({
    options: {
        stage: {type: "string"},
        "user-id": {type: "string"},
        "net-worth": {type: "string"},
        currency: {type: "string", default: "EUR"},
        baseline: {type: "boolean", default: false},
        "dry-run": {type: "boolean", default: false}
    }
});

if (!args.stage || !args["user-id"] || (!args["net-worth"] && !args.baseline)) {
    console.error("usage: import-history.mjs --stage <stage> --user-id <sub> [--net-worth <file> --currency EUR] [--baseline] [--dry-run]");
    process.exit(1);
}

const db = DynamoDBDocument.from(new DynamoDBClient({}));
const userId = args["user-id"];
const dryRun = args["dry-run"];
const tables = {
    categories: `CustomCategory-${args.stage}`,
    assetHistory: `AssetHistory-${args.stage}`,
    netWorth: `NetWorthHistory-${args.stage}`
};

// put that never replaces an existing item; returns false if one was already there
async function putIfAbsent(TableName, Item, keyAttribute) {
    if (dryRun) {
        return true;
    }
    try {
        await db.put({TableName, Item, ConditionExpression: `attribute_not_exists(${keyAttribute})`});
        return true;
    } catch (e) {
        if (e.name === "ConditionalCheckFailedException") {
            return false;
        }
        throw e;
    }
}

async function importNetWorth(file, currency) {
    const entries = readFileSync(file, "utf8").split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
        const match = line.match(/^(\d{1,2})\.(\d{4})\s*-\s*([\d.,\s]+)$/);
        if (!match) {
            throw new Error(`can't read line "${line}"`);
        }
        const [, month, year, amount] = match;
        const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).toISOString().slice(0, 10);
        return {date: lastDay, amount: Number(amount.replace(/[,\s]/g, ""))};
    });

    let imported = 0;
    let existing = 0;
    for (const {date, amount} of entries.sort((a, b) => a.date.localeCompare(b.date))) {
        const res = await fetch(`https://api.frankfurter.dev/v1/${date}?base=${currency}`);
        if (!res.ok) {
            throw new Error(`no ECB rates for ${date}: ${res.status}`);
        }
        const {rates, date: rateDate} = await res.json();
        const totals = Object.fromEntries(CURRENCIES.map((c) => [c, c === currency ? amount : Math.round(amount * rates[c] * 100) / 100]));

        const saved = await putIfAbsent(tables.netWorth, {
            UserId: userId,
            SnapshotDate: date,
            Totals: totals,
            Source: "import",
            ImportedCurrency: currency,
            RateDate: rateDate,
            CreatedAt: new Date().toISOString()
        }, "SnapshotDate");
        saved ? imported++ : existing++;
        console.log(`${date}  ${CURRENCIES.map((c) => `${c} ${totals[c].toLocaleString("en-GB")}`).join("  ")}  (rates of ${rateDate})${saved ? "" : "  already there, skipped"}`);
    }
    console.log(`net worth: ${imported} imported, ${existing} skipped${dryRun ? " (dry run, nothing written)" : ""}`);
}

async function importBaseline() {
    const {Items: categories} = await db.query({
        TableName: tables.categories,
        KeyConditionExpression: "UserId = :u",
        ExpressionAttributeValues: {":u": userId}
    });

    const now = new Date().toISOString();
    let recorded = 0;
    let withHistory = 0;
    for (const category of categories) {
        for (const [assetUid, asset] of Object.entries(category.Assets || {})) {
            const {Count} = await db.query({
                TableName: tables.assetHistory,
                KeyConditionExpression: "UserId = :u and begins_with(ChangeId, :p)",
                ExpressionAttributeValues: {":u": userId, ":p": `${assetUid}#`},
                Select: "COUNT"
            });
            if (Count > 0) {
                withHistory++;
                continue;
            }

            await putIfAbsent(tables.assetHistory, {
                UserId: userId,
                ChangeId: `${assetUid}#${now}#baseline`,
                AssetUid: assetUid,
                CategoryUid: category.CategoryUid,
                ChangeType: "BASELINE",
                ChangedAt: now,
                Name: asset.AssetName,
                Amount: asset.AssetAmount,
                Currency: asset.AssetCurrency,
                Excluded: false
            }, "ChangeId");
            recorded++;
        }
    }
    console.log(`asset baseline: ${recorded} starting values recorded, ${withHistory} assets already had history${dryRun ? " (dry run, nothing written)" : ""}`);
}

if (args["net-worth"]) {
    await importNetWorth(args["net-worth"], args.currency);
}
if (args.baseline) {
    await importBaseline();
}
