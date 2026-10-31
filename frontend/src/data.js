// Mock data served by src/api/mockBaseQuery.js when VITE_STAGE=local (see .env.example)
const data = {
    categories: [
        {
            id: "1",
            name: "Cash and spending",
            categoryType: "CUSTOM_CATEGORY",
            assets: [
                {
                    id: "2",
                    name: "Spending",
                    amount: "1500",
                    currency: "EUR"
                },
                {
                    id: "3",
                    name: "Cash",
                    amount: "470",
                    currency: "GBP"
                }
            ]
        },
        {
            id: "4",
            name: "Savings",
            categoryType: "CUSTOM_CATEGORY",
            assets: [
                {
                    id: "5",
                    name: "Savings account",
                    amount: "2500",
                    currency: "GBP"
                },
                {
                    id: "6",
                    name: "Dollar account",
                    amount: "800.50",
                    currency: "USD"
                }
            ]
        }
    ],

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
