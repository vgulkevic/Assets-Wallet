'use strict';

const {DynamoDbClient} = require('custom_common_lib');
const categoriesDb = DynamoDbClient.of(process.env.CUSTOM_CATEGORIES_TABLE);
const historyDb = DynamoDbClient.of(process.env.NET_WORTH_TABLE);

const CURRENCIES = ['GBP', 'USD', 'EUR'];

// One item per user and day: UserId (PK) + SnapshotDate (SK, YYYY-MM-DD), with the total in every supported currency.
// Source is "snapshot" (nightly job) or "import" (history entered by hand); imported entries are never overwritten.
// Snapshots also break the total down by category (ByCategory, keyed by CategoryUid, with the name it had that day)
// and by the currency the assets are held in (ByCurrency, with the amount held in that currency); imports have neither.
class NetWorthOperations {

  static async getHistory(userId) {
    const items = [];
    let ExclusiveStartKey;
    do {
      const res = await historyDb.query({
        KeyConditionExpression: 'UserId = :userId',
        ExpressionAttributeValues: {':userId': userId},
        ExclusiveStartKey
      });
      items.push(...res.Items);
      ExclusiveStartKey = res.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return items.map(item => ({
      date: item.SnapshotDate,
      totals: item.Totals,
      source: item.Source,
      byCategory: item.ByCategory && Object.entries(item.ByCategory)
        .map(([id, category]) => ({id, name: category.Name, totals: category.Totals})),
      byCurrency: item.ByCurrency && Object.entries(item.ByCurrency)
        .map(([currency, holding]) => ({currency, amount: holding.Amount, totals: holding.Totals}))
    }));
  }

  // Saves today's net worth of every user that has categories.
  static async snapshotAll(today = new Date().toISOString().slice(0, 10)) {
    const eurRates = await fetchEurRates();
    const categoriesByUser = await scanCategoriesByUser();
    const now = new Date().toISOString();

    const results = await Promise.allSettled(Object.entries(categoriesByUser).map(([userId, categories]) => {
      const assets = categories.flatMap(category => Object.values(category.Assets || {}));
      return historyDb.put({
        Item: {
          UserId: userId,
          SnapshotDate: today,
          Totals: totalsInAllCurrencies(assets, eurRates),
          ByCategory: byCategory(categories, eurRates),
          ByCurrency: byCurrency(assets, eurRates),
          AssetCount: assets.length,
          Source: 'snapshot',
          CreatedAt: now
        },
        // re-running the job on the same day replaces its own snapshot, but never an imported entry
        ConditionExpression: 'attribute_not_exists(SnapshotDate) or #source = :snapshot',
        ExpressionAttributeNames: {'#source': 'Source'},
        ExpressionAttributeValues: {':snapshot': 'snapshot'}
      });
    }));

    const skipped = results.filter(r => r.status === 'rejected' && r.reason?.name === 'ConditionalCheckFailedException').length;
    const failed = results.filter(r => r.status === 'rejected' && r.reason?.name !== 'ConditionalCheckFailedException');
    failed.forEach(r => console.log('snapshot failed', r.reason));

    return {date: today, users: results.length, saved: results.length - skipped - failed.length, skipped, failed: failed.length};
  }
}

async function fetchEurRates() {
  // all ECB currencies, so assets in any of them can be valued
  const res = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR');
  if (!res.ok) {
    throw new Error(`Frankfurter responded with ${res.status}`);
  }
  const {rates} = await res.json();
  return {EUR: 1, ...rates};
}

async function scanCategoriesByUser() {
  const byUser = {};
  let ExclusiveStartKey;
  do {
    const res = await categoriesDb.scan({TableName: process.env.CUSTOM_CATEGORIES_TABLE, ExclusiveStartKey});
    res.Items.forEach(item => (byUser[item.UserId] ??= []).push(item));
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return byUser;
}

// eurRates: units of each currency per 1 EUR
function totalsInAllCurrencies(assets, eurRates) {
  const totalInEur = assets.reduce((sum, asset) => {
    const rate = eurRates[asset.AssetCurrency];
    if (!rate) {
      console.log(`no rate for ${asset.AssetCurrency}, asset ${asset.AssetUid} left out of the snapshot`);
      return sum;
    }
    return sum + parseFloat(asset.AssetAmount) / rate;
  }, 0);

  return Object.fromEntries(CURRENCIES.map(c => [c, Math.round(totalInEur * eurRates[c] * 100) / 100]));
}

function byCategory(categories, eurRates) {
  return Object.fromEntries(categories.map(category => [category.CategoryUid, {
    Name: category.CategoryName,
    Totals: totalsInAllCurrencies(Object.values(category.Assets || {}), eurRates)
  }]));
}

function byCurrency(assets, eurRates) {
  const held = Object.groupBy(assets, asset => asset.AssetCurrency);
  return Object.fromEntries(Object.entries(held).map(([currency, inCurrency]) => [currency, {
    Amount: Math.round(inCurrency.reduce((sum, asset) => sum + parseFloat(asset.AssetAmount), 0) * 100) / 100,
    Totals: totalsInAllCurrencies(inCurrency, eurRates)
  }]));
}

module.exports = {NetWorthOperations, totalsInAllCurrencies};
