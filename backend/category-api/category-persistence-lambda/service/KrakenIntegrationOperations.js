'use strict';

const {KrakenClient} = require('./KrakenClient.js');
const fiatTickers = ["ZUSD", "ZEUR", "ZGBP", "USDT"];
const ignoredTickers = ["XICN", "BSV", "XNMC", "XXVN", "ZKRW"];
const btcTickers = ["BTC", "XBT", "XXBT"];
const currencyMappings = {
  "ADA": "ADAXBT",
  "ALGO": "ALGOXBT",
  "BCH": "BCHXBT",
  "DASH": "DASHXBT",
  "EOS": "EOSXBT",
  "ICX": "ICXXBT",
  "TRX": "TRXXBT"
}

class KrakenIntegrationOperations {

  static async fetchAssets(category) {
    const {apiKey, apiKeySecret} = category;

    const {btcPrice, balance} = await this.getBalancesAndBtcPrice(apiKey, apiKeySecret);
    console.log(JSON.stringify(balance));
    console.log(JSON.stringify(btcPrice));

    const btcPricesForBalances = await this.getBtcPriceForBalances(apiKey, apiKeySecret, balance, btcPrice);
    console.log(JSON.stringify(btcPricesForBalances));

    const assets = this.getValueForEachBalance(btcPricesForBalances, btcPrice, balance);
    console.log(assets);

    return assets;
  }

  static async getBalancesAndBtcPrice(apiKey, apiKeySecret) {
    return Promise.all(
        [this.getBalance(apiKey, apiKeySecret),
          this.getBtcPrice(apiKey, apiKeySecret)]
    )
    .then((res) => {
      return Object.assign(...res);
    });
  }

  static async getBalance(apiKey, apiKeySecret) {
    return KrakenClient
    .api(apiKey, apiKeySecret, {}, "Balance", {})
    .then((res) => {
      return res.result;
    })
    .then((res) => {
      return {
        balance: Object.keys(res)
        .map((key) => {
          return {
            name: key,
            amount: res[key]
          };
        })
      };
    });
  }

  static async getBtcPrice(apiKey, apiKeySecret) {
    return KrakenClient
    .api(apiKey, apiKeySecret, {}, "Ticker", {'pair': 'XXBTZUSD'})
    .then((res) => {
      return {btcPrice: res.result.XXBTZUSD.c[0]};
    });
  }

  static async getBtcPriceForBalances(apiKey, apiKeySecret, balance) {
    const filteredBalances = balance
    .filter((currency) => {
      return (
          (currency.name !== "XXBT" && !fiatTickers.includes(currency.name))
          &&
          !(ignoredTickers.includes(currency.name))
      );
    });

    const pairsToFetch = {
      'pair': filteredBalances
      .map((el) => {
        return this.getAssetToXbtPairName(el.name);
      })
      .join(',')
    };

    console.log(pairsToFetch);

    const btcPricesForBalances = await KrakenClient.api(apiKey, apiKeySecret, {}, "Ticker", pairsToFetch);
    console.log(JSON.stringify(btcPricesForBalances));

    return btcPricesForBalances.result;
  }

  static getValueForEachBalance(btcPricesForBalances, btcPrice, balances) {
    return balances
    .filter((balance) => {
      return !ignoredTickers.includes(balance.name);
    })
    .map((balance) => {
      const convertedBalance = {
        name: balance.name,
        btcValue: null,
        amount: null,
        currency: null
      }

      if (fiatTickers.includes(balance.name)) {
        convertedBalance.amount = balance.amount;

        if (balance.name === "ZUSD" || balance.name === "USDT") {
          convertedBalance.currency = "USD";
        }

        if (balance.name === "ZGBP") {
          convertedBalance.currency = "GBP";
        }

        if (balance.name === "ZEUR") {
          convertedBalance.currency = "EUR";
        }

      } else if (btcTickers.includes(balance.name)){
        convertedBalance.btcValue = balance.amount;
        convertedBalance.currency = "USD";
        convertedBalance.amount = btcPrice * balance.amount;
      }
      else {
        convertedBalance.currency = "USD";

        const toXbtPairName = this.getAssetToXbtPairName(balance.name);
        const toXbtRates = btcPricesForBalances[toXbtPairName];

        if (!toXbtRates) {
          convertedBalance.btcValue = balance.name + " CONVERSION ERROR";
          convertedBalance.amount = 0;
          convertedBalance.error = true;
        } else {
          const toXbtRate = toXbtRates.c[0];
          convertedBalance.btcValue = balance.amount * toXbtRate;
          convertedBalance.amount = convertedBalance.btcValue * btcPrice;

          console.log(balance.amount * toXbtRate);
        }
      }
      return convertedBalance;
    })
    .filter((asset) => {
      return asset.amount > 5 || asset.error;
    });
  }

  static getAssetToXbtPairName(ticker) {
    if (currencyMappings[ticker]) {
      return currencyMappings[ticker];
    }
    else {
      return ticker + "XXBT";
    }
  }
}

module.exports = {KrakenIntegrationOperations};