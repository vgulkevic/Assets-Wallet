'use strict';

const axios = require('axios')
const crypto = require('crypto');

const BASE_URL = "https://api.bittrex.com/api/v1.1/";
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

const headers = (apiSign) => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'apisign': `${apiSign}`
  };
};

class BittrexIntegrationOperations {

  static async fetchAssets(category) {
    const {apiKey, apiKeySecret} = category;

    const {balances, btcPrice} = await this.getBalancesAndBtcPrice(apiKey,
        apiKeySecret);
    console.log(balances);
    console.log(btcPrice);

    const getEachBalanceValue = await this.getEachBalanceValue(apiKey,
        apiKeySecret, balances, btcPrice);
    console.log(getEachBalanceValue);

    return getEachBalanceValue;
  }

  static async getEachBalanceValue(apiKey, apiKeySecret, balances, btcPrice) {
    return Promise.all(
        balances.map((balance) => {
          return this.getValueForBalance(apiKey, apiKeySecret, balance,
              btcPrice);
        })
    ).then((res) => {
      return res.map((convertedBalance) => {
        console.log("converted result: ");
        console.log(convertedBalance);
        return {
          name: convertedBalance.name,
          btcValue: convertedBalance.btcValue,
          amount: convertedBalance.amount,
          currency: "USD"
        }
      }).filter((balance) => {
        return balance.amount > 5;
      });
    });
  }

  static async getValueForBalance(apiKey, apiKeySecret, balance, btcPrice) {
    // check if usd / usdt - no need to convert
    // check if this is BTC
    let usdAmount, btcValue;

    // add more conditions for stable coins
    if (balance.Currency === "USD" || balance.Currency === "USDT") {
      usdAmount = balance.Balance;
    } else if (balance.Currency === "BTC") {
      btcValue = balance.Balance;
      usdAmount = balance.Balance * btcPrice;
    } else {
      const {btcPrice: btcPriceForCoin} = await this.getBtcPriceForCoin(balance.Currency);
      console.log(btcPriceForCoin);

      btcValue = btcPriceForCoin * balance.Balance;
      usdAmount = btcValue * btcPrice;

      console.log(btcPriceForCoin);
      console.log(balance.Balance);
      console.log(btcPrice);
    }

    return {
      name: balance.Currency,
      currency: "USD",
      amount: usdAmount,
      btcValue: btcValue
    }
  }

  static async getBalancesAndBtcPrice(apiKey, apiKeySecret) {
    return Promise.all(
        [this.getBalances(apiKey, apiKeySecret), this.getBtcPrice()]
    )
    .then((res) => {
      return Object.assign(...res);
    });
  }

  static async getBalances(apiKey, apiKeySecret) {
    const apiCallUrl = `${BASE_URL}account/getbalances?apikey=${apiKey}&nonce=${this.generateNonce()}`;

    return instance.get(apiCallUrl,
        {
          headers: headers(this.signApiCall(apiKeySecret, apiCallUrl))
        }
    )
    .then((res) => {
      return {
        balances: res.data.result.filter((balance) =>{
          if (balance.Currency === "BTXCRD") {
            return false;
          }
          return balance.Balance > 0
        })
      };
    })
  }

  static async getBtcPrice() {
    return instance.get(`${BASE_URL}public/getticker?market=USDT-BTC`)
    .then((res) => {
      return {
        btcPrice: res.data.result.Bid
      };
    });
  }

  static async getBtcPriceForCoin(coin) {
    return instance.get(`${BASE_URL}public/getticker?market=BTC-${coin}`)
    .then((res) => {
      return {
        btcPrice: res.data.result.Bid
      };
    });
  }

  static async getBtcPriceForCoin(coinName) {
    return instance.get(`${BASE_URL}public/getticker?market=BTC-${coinName}`)
    .then((res) => {
      return {
        btcPrice: res.data.result.Bid
      };
    });
  }

  static signApiCall(apiKeySecret, apiCallUrl) {
    return crypto.createHmac('sha512', apiKeySecret)
    .update(apiCallUrl)
    .digest('hex');
  }

  static generateNonce() {
    return crypto.randomBytes(16).toString('hex');
  }
}

module.exports = {BittrexIntegrationOperations};