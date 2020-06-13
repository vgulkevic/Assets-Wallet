const data = {
    baseCurrency: "GBP",

    customCategories: [
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
        // {
        //     id: "4",
        //     name: "Starling Bank",
        //     categoryType: "STARLING_BANK_CATEGORY",
        //     assets: [
        //         {
        //             id: "5",
        //             name: "Savings",
        //             amount: "1040",
        //             currency: "GBP"
        //         },
        //         {
        //             id: "6",
        //             name: "Spending",
        //             amount: "1150",
        //             currency: "GBP"
        //         },
        //         {
        //             id: "7",
        //             name: "Travel",
        //             amount: "320",
        //             currency: "GBP"
        //         },
        //         {
        //             id: "8",
        //             name: "Crypto",
        //             amount: "200",
        //             currency: "GBP"
        //         },
        //         {
        //             id: "9",
        //             name: "Securities",
        //             amount: "400",
        //             currency: "GBP"
        //         }
        //     ]
        // }
    ],


    cachedRates: {"rates": {"CAD": 1.69611935, "HKD": 9.584739366, "ISK": 167.3918834917, "PHP": 62.4178580943, "DKK": 8.274353965, "HUF": 387.0992807033, "CZK": 29.8830032857, "GBP": 1.0, "RON": 5.3828478821, "SEK": 11.6408400675, "IDR": 18059.7859870349, "INR": 93.3559408578, "BRL": 6.6217476245, "RUB": 87.0721960749, "HRK": 8.421765385, "JPY": 132.4149720274, "THB": 39.32155226, "CHF": 1.1899476068, "EUR": 1.1100257526, "MYR": 5.3740786786, "BGN": 2.1709883669, "TRY": 8.4474069798, "CNY": 8.8198206198, "NOK": 11.974957819, "NZD": 1.9828390019, "ZAR": 21.5610292159, "USD": 1.2361246781, "MXN": 27.2733327413, "SGD": 1.7440724625, "AUD": 1.8516339579, "ILS": 4.3363156025, "KRW": 1527.6285409822, "PLN": 4.9390595862}, "base": "GBP", "date": "2020-05-29"},

    selectedCurrencies: {
        main: "GBP",
        secondary: "USD"
    }

};

export {data};