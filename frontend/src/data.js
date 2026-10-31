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

// monthly net worth for 3.5 years, rising with some noise; "import" entries like the real migrated history
const netWorthHistory = Array.from({length: 43}, (_, i) => {
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

const data = {
    categories,
    assetHistory: [...baselines, ...spendingHistory],
    netWorthHistory,

    // 1 GBP in other currencies
    gbpRates: {
        EUR: 1.1993,
        USD: 1.3399
    },
    ratesDate: "2026-10-30",

    selectedCurrencies: {
        main: "GBP",
        secondary: "USD"
    }
};

export {data};
