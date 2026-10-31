// In-memory stand-in for the API when VITE_STAGE=local, so the app runs without AWS.
import {data} from "../data";

const db = structuredClone(data);
const delay = () => new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 250));
const newId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function rates(source) {
    // data.gbpRates holds GBP-based rates; derive the others from them
    const gbp = {GBP: 1, ...db.gbpRates};
    const quotes = Object.fromEntries(Object.keys(gbp)
        .filter((currency) => currency !== source)
        .map((currency) => [source + currency, gbp[currency] / gbp[source]]));
    return {success: true, source, date: db.ratesDate, quotes};
}

const findCategory = (id) => db.categories.find((category) => category.id === id);

// same shape as an AssetHistory item returned by the API
function recordChange(type, categoryId, asset, previous) {
    const changedAt = now();
    db.assetHistory.push({
        id: `${asset.id}#${changedAt}#${newId().slice(0, 8)}`,
        assetId: asset.id,
        categoryId,
        type,
        changedAt,
        name: asset.name,
        amount: asset.amount,
        currency: asset.currency,
        previousName: previous?.name,
        previousAmount: previous?.amount,
        previousCurrency: previous?.currency,
        excluded: false
    });
}

function moveToOrder(items, ids) {
    const position = new Map(ids.map((id, i) => [id, i]));
    return [...items].sort((a, b) => (position.get(a.id) ?? Infinity) - (position.get(b.id) ?? Infinity));
}

const routes = {
    "GET categories": () => db.categories,
    "POST create-category": ({name, categoryType}) => {
        const category = {id: newId(), name, categoryType, assets: []};
        db.categories.push(category);
        return category;
    },
    "POST update-category": ({id, name}) => Object.assign(findCategory(id), {name}),
    "DELETE delete-category": (id) => {
        findCategory(id).assets.forEach((asset) => recordChange("DELETED", id, asset, asset));
        db.categories = db.categories.filter((category) => category.id !== id);
        return id;
    },
    "POST reorder-categories": ({categoryIds}) => {
        db.categories = moveToOrder(db.categories, categoryIds);
        return categoryIds;
    },
    "POST create-asset": ({categoryId, asset}) => {
        const created = {...asset, id: newId(), updatedAt: now()};
        findCategory(categoryId).assets.push(created);
        recordChange("CREATED", categoryId, created);
        return {categoryId, asset: created};
    },
    "POST update-asset": ({categoryId, asset}) => {
        const category = findCategory(categoryId);
        const previous = category.assets.find((existing) => existing.id === asset.id);
        const updated = {...asset, updatedAt: now()};
        category.assets = category.assets.map((existing) => existing.id === asset.id ? updated : existing);
        recordChange("UPDATED", categoryId, updated, previous);
        return {categoryId, asset: updated};
    },
    "DELETE delete-asset": ({categoryId, assetId}) => {
        const category = findCategory(categoryId);
        const deleted = category.assets.find((asset) => asset.id === assetId);
        category.assets = category.assets.filter((asset) => asset.id !== assetId);
        recordChange("DELETED", categoryId, deleted, deleted);
        return {categoryId, deletedAssetId: assetId};
    },
    "POST reorder-assets": ({categoryId, assetIds}) => {
        const category = findCategory(categoryId);
        category.assets = moveToOrder(category.assets, assetIds);
        return {categoryId, assetIds};
    },
    "GET asset-history": (body, params) => db.assetHistory.filter((change) => change.assetId === params.get("assetId")),
    "POST set-asset-change-excluded": ({changeId, excluded}) => {
        const change = db.assetHistory.find((c) => c.id === changeId);
        change.excluded = excluded;
        return change;
    },
    "GET net-worth-history": () => db.netWorthHistory,
    "GET user-profile": () => db.selectedCurrencies,
    "POST create-user-profile": (profile) => (db.selectedCurrencies = profile),
    "POST currency-rates": ({baseCurrency}) => rates(baseCurrency)
};

export default async function mockBaseQuery(args) {
    const {url, method = "GET", body} = typeof args === "string" ? {url: args} : args;
    const [path, query] = url.split("?");
    await delay();

    const route = routes[`${method} ${path}`];
    if (!route) {
        return {error: {status: 404, data: `No mock for ${method} ${path}`}};
    }
    return {data: structuredClone(route(body, new URLSearchParams(query)))};
}
