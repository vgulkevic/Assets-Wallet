// category type
const CUSTOM_CATEGORY = "CUSTOM_CATEGORY"
const API_CATEGORY = "API_CATEGORY";

const AVAILABLE_CATEGORY_TYPES = [
    {
        id: CUSTOM_CATEGORY,
        name: "Custom category"
    },
    {
        id: API_CATEGORY,
        name: "Service integration"
    }
];

// Api category type integration services
const STARLING_BANK_API_INTEGRATION = "STARLING_BANK";
const BITTREX_API_INTEGRATION = "BITTREX";
const KRAKEN_API_INTEGRATION = "KRAKEN";
const BINANCE_API_INTEGRATION = "BINANCE";

const AVAILABLE_SERVICE_INTEGRATIONS = [
    {
        id: STARLING_BANK_API_INTEGRATION,
        name: "Starling Bank"
    },
    {
        id: BITTREX_API_INTEGRATION,
        name: "Bittrex exchange"
    },
    {
        id: KRAKEN_API_INTEGRATION,
        name: "Kraken exchange"
    },
    {
        id: BINANCE_API_INTEGRATION,
        name: "Binance exchange"
    }
];

export {
    CUSTOM_CATEGORY, API_CATEGORY,
    AVAILABLE_CATEGORY_TYPES,

    STARLING_BANK_API_INTEGRATION, BITTREX_API_INTEGRATION, KRAKEN_API_INTEGRATION, BINANCE_API_INTEGRATION,
    AVAILABLE_SERVICE_INTEGRATIONS
};