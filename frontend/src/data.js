// Mock data served by src/api/mockBaseQuery.js when VITE_STAGE=local (see .env.example)
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const categories = [
    {
        id: "1",
        name: "Cash and spending",
        categoryType: "CUSTOM_CATEGORY",
        assets: [
            {id: "3", name: "Cash", amount: "470", currency: "GBP", updatedAt: daysAgo(130)},
            {id: "2", name: "Spending", amount: "1500", currency: "EUR", updatedAt: daysAgo(2)}
        ]
    },
    {
        id: "4",
        name: "Savings",
        categoryType: "CUSTOM_CATEGORY",
        assets: [
            {id: "6", name: "Dollar account", amount: "800.50", currency: "USD", updatedAt: daysAgo(20)},
            // never edited since history tracking started
            {id: "5", name: "Savings account", amount: "2500", currency: "GBP"}
        ]
    }
];

// a few months of changes for "Spending", one of them excluded as a typo
const spendingHistory = [
    [200, "CREATED", "1100", undefined],
    [150, "UPDATED", "1250", "1100"],
    [100, "UPDATED", "12500", "1250"],
    [99, "UPDATED", "1300", "12500"],
    [40, "UPDATED", "1420", "1300"],
    [2, "UPDATED", "1500", "1420"]
].map(([age, type, amount, previousAmount], i) => ({
    id: `2#${daysAgo(age)}#${i}`, assetId: "2", categoryId: "1", type, changedAt: daysAgo(age),
    name: "Spending", amount, currency: "EUR", previousName: previousAmount && "Spending", previousAmount,
    previousCurrency: previousAmount && "EUR", excluded: amount === "12500"
}));

const baselines = categories.flatMap((category) => category.assets
    .filter((asset) => asset.id !== "2")
    .map((asset) => ({
        id: `${asset.id}#baseline`, assetId: asset.id, categoryId: category.id, type: "BASELINE", changedAt: daysAgo(210),
        name: asset.name, amount: asset.amount, currency: asset.currency, excluded: false
    })));

// 1 GBP in other currencies
const gbpRates = {
    EUR: 1.1993,
    USD: 1.3399
};
const inAllCurrencies = (amount, currency) => {
    const gbp = amount / ({GBP: 1, ...gbpRates})[currency];
    return {GBP: Math.round(gbp * 100) / 100, EUR: Math.round(gbp * gbpRates.EUR * 100) / 100, USD: Math.round(gbp * gbpRates.USD * 100) / 100};
};
const addTotals = (a, b) => Object.fromEntries(Object.keys(b).map((currency) => [currency, Math.round(((a?.[currency] ?? 0) + b[currency]) * 100) / 100]));

// monthly net worth for 3.5 years up to two months ago, rising with some noise; "import" entries like the real migrated history
const imported = Array.from({length: 41}, (_, i) => {
    const month = new Date();
    month.setUTCDate(1);
    month.setUTCMonth(month.getUTCMonth() - 42 + i + 1);
    month.setUTCDate(0);
    const eur = Math.round(1200 + i * 95 + Math.sin(i) * 120);
    return {
        date: month.toISOString().slice(0, 10),
        totals: {EUR: eur, GBP: Math.round(eur * 0.85), USD: Math.round(eur * 1.1)},
        source: "import"
    };
});

// then nightly snapshots for the last 45 days, with the category and currency breakdowns the snapshot job saves;
// every asset grows towards today's amount at its own pace
const snapshots = Array.from({length: 45}, (_, i) => {
    const age = 45 - i;
    const byCategory = [];
    const byCurrency = new Map();
    categories.forEach((category, c) => {
        let categoryTotals = {GBP: 0, EUR: 0, USD: 0};
        category.assets.forEach((asset, a) => {
            const amount = Math.round(parseFloat(asset.amount) * (1 - age * (0.001 + 0.002 * ((c + a) % 3)) + Math.sin(age + a) * 0.01));
            const totals = inAllCurrencies(amount, asset.currency);
            categoryTotals = addTotals(categoryTotals, totals);
            const held = byCurrency.get(asset.currency);
            byCurrency.set(asset.currency, {currency: asset.currency, amount: (held?.amount ?? 0) + amount, totals: addTotals(held?.totals, totals)});
        });
        byCategory.push({id: category.id, name: category.name, totals: categoryTotals});
    });
    return {
        date: daysAgo(age).slice(0, 10),
        totals: byCategory.reduce((sum, category) => addTotals(sum, category.totals), {GBP: 0, EUR: 0, USD: 0}),
        source: "snapshot",
        byCategory,
        byCurrency: [...byCurrency.values()]
    };
});

const data = {
    categories,
    assetHistory: [...baselines, ...spendingHistory],
    netWorthHistory: [...imported, ...snapshots],

    gbpRates,
    ratesDate: "2026-10-30",

    selectedCurrencies: {
        main: "GBP",
        secondary: "USD"
    }
};

export {data};
