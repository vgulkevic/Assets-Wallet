// In-memory stand-in for the API when VITE_STAGE=local, so the app runs without AWS.
import {data} from "../data";

const db = structuredClone(data);
const delay = () => new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 250));
const newId = () => crypto.randomUUID();

function rates(source) {
    // data.gbpRates holds GBP-based rates; derive the others from them
    const gbp = {GBP: 1, ...db.gbpRates};
    const quotes = Object.fromEntries(Object.keys(gbp)
        .filter((currency) => currency !== source)
        .map((currency) => [source + currency, gbp[currency] / gbp[source]]));
    return {success: true, source, date: db.ratesDate, quotes};
}

const findCategory = (id) => db.categories.find((category) => category.id === id);

const routes = {
    "GET categories": () => db.categories,
    "POST create-category": ({name, categoryType}) => {
        const category = {id: newId(), name, categoryType, assets: []};
        db.categories.push(category);
        return category;
    },
    "POST update-category": ({id, name}) => Object.assign(findCategory(id), {name}),
    "DELETE delete-category": (id) => {
        db.categories = db.categories.filter((category) => category.id !== id);
        return id;
    },
    "POST create-asset": ({categoryId, asset}) => {
        const created = {...asset, id: newId()};
        findCategory(categoryId).assets.push(created);
        return {categoryId, asset: created};
    },
    "POST update-asset": ({categoryId, asset}) => {
        const category = findCategory(categoryId);
        category.assets = category.assets.map((existing) => existing.id === asset.id ? {...asset} : existing);
        return {categoryId, asset};
    },
    "DELETE delete-asset": ({categoryId, assetId}) => {
        const category = findCategory(categoryId);
        category.assets = category.assets.filter((asset) => asset.id !== assetId);
        return {categoryId, deletedAssetId: assetId};
    },
    "GET user-profile": () => db.selectedCurrencies,
    "POST create-user-profile": (profile) => (db.selectedCurrencies = profile),
    "POST currency-rates": ({baseCurrency}) => rates(baseCurrency)
};

export default async function mockBaseQuery(args) {
    const {url, method = "GET", body} = typeof args === "string" ? {url: args} : args;
    await delay();

    const route = routes[`${method} ${url}`];
    if (!route) {
        return {error: {status: 404, data: `No mock for ${method} ${url}`}};
    }
    return {data: structuredClone(route(body))};
}
