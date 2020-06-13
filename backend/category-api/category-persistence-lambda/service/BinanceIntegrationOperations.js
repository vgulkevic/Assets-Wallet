'use strict';
const crypto = require('crypto');

const axios = require('axios');
const qs = require('qs');
const BASE_URL = "https://api.binance.com";

const instance = axios.create({
  timeout: 5000
});

const headers = (apiKey) => {
  return {
    'X-MBX-APIKEY': `${apiKey}`
  };
};

const buildSign = (data, apiKeySecret) => {
  return crypto.createHmac('sha256', apiKeySecret).update(data).digest('hex');
};

class BinanceIntegrationOperations {

  static async fetchAssets(category) {
    const {apiKey, apiKeySecret} = category;

    const {balances, btcPrice} = await this.getBalancesAndBtcPrice(apiKey, apiKeySecret);
    console.log(balances);
    console.log(btcPrice);

    const assets = await this.getValueForEachBalance(balances, btcPrice);
    console.log(assets);

    return assets.filter((asset) => {
      return asset.amount > 5;
    });
  }

  static async getBalancesAndBtcPrice(apiKey, apiKeySecret) {
    return Promise.all(
        [
            this.getAccountBalances(apiKey, apiKeySecret)
            .then((res) => {
              return {balances: res}
            }),

          this.getTickerPrice("BTCUSDT")
            .then((res) => {
              return {btcPrice: res}
            })
        ]
    )
    .then((res) => {
      return Object.assign(...res);
    });
  }

  static async getTickerPrice(ticker) {
    return instance.get(`${BASE_URL}/api/v3/avgPrice?symbol=${ticker}`).then((res) => res.data.price);
  }

  static async getAccountBalances(apiKey, apiKeySecret) {
    const params = {timestamp: new Date().getTime()};
    params.signature = buildSign(qs.stringify(params), apiKeySecret);
    return instance
    .get(`${BASE_URL}/api/v3/account`, {params: params, headers: headers(apiKey)})
    .then((res) => {
      console.log(res.data);
      return res.data.balances;
    })
    .then((balances)=> {
      return balances.filter((balance) =>{
        return (parseFloat(balance.free) + parseFloat(balance.locked)) !== 0;
      });
    })
    .then((res) => {
      console.log(res);
      return res.map((balance) => {
        return {
          name: balance.asset,
          amount: parseFloat(balance.free) + parseFloat(balance.locked)
        }
      });
    });
  }

  static async getValueForEachBalance(balances, btcPrice) {
    return Promise.all(
        balances.map((balance) => {
          return this.getValueForBalance(balance, btcPrice);
        })
    );
  }

  static async getValueForBalance(balance, btcPrice) {
    if (balance.name === "USDT") {
      return {
        name: "USDT",
        btcValue: null,
        amount: balance.amount,
        currency: "USD"
      }
    }
    if (balance.name === "BTC") {
      return {
        name: "BTC",
        btcValue: balance.amount,
        amount: balance.amount * btcPrice,
        currency: "USD"
      }
    }

    const btcPriceForAsset = await this.getTickerPrice(balance.name + "BTC");

    return {
      name: balance.name,
      btcValue: (balance.amount * btcPriceForAsset).toFixed(7),
      amount: btcPriceForAsset * btcPrice,
      currency: "USD"
    }
  }
}

module.exports = {BinanceIntegrationOperations};
