'use strict';

const axios = require('axios')
const instance = axios.create({
  baseURL: "https://api.starlingbank.com/api/v2/",
  timeout: 5000,
});
const Dinero = require('dinero.js')

const headers = (token) => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};
class StarlingBankIntegrationOperations {

  static async fetchAssets(category) {
    const {apiKey} = category;

    const accounts = await this.getAccounts(apiKey);
    console.log(accounts);

    const allStarlingAssets = await this.getAllStarlingAssets(apiKey, accounts);
    console.log(allStarlingAssets);

    return allStarlingAssets;
  }

  static async getAllStarlingAssets(apiKey, accounts) {
    return Promise.all([this.getAllBalances(apiKey, accounts), this.getAllSavingsGoalsForAccount(apiKey, accounts)])
    .then((res) => {
      return Object.assign(...res);
    })
    .then((res) => {
      return [...res.balances, ...res.savingsGoals];
    });
  }

  static async getAllBalances(apiKey, accounts) {
    return Promise.all(
        accounts.map((account) => {
          return this.getBalance(apiKey, account.accountUid);
        })
    ).then((res)=> {

      return {
        balances: res.map((balance) => {
          return {
            name: "Balance in " + balance.effectiveBalance.currency,
            amount: Dinero({ amount: balance.effectiveBalance.minorUnits, currency: balance.effectiveBalance.currency }).toUnit(),
            currency: balance.effectiveBalance.currency
          }
        })
        .filter((balance) => {
          return balance.amount > 5;
        })
      };
    });
  }

  static async getAccounts(apiKey) {
    return instance.get("/accounts", {headers: headers(apiKey)}).then((res) => {
      return res.data.accounts;
    });
  }

  static async getBalance(apiKey, accountUid) {
    return instance.get("/accounts/" + accountUid + "/balance", {headers: headers(apiKey)}).then((res)=> {
      return res.data;
    });
  }

  static async getAllSavingsGoalsForAccount(apiKey, accounts) {
    return Promise.all(
        accounts.map((account) => {
          return this.getSavingsGoalsForAccount(apiKey, account.accountUid);
        })
    ).then((res) => {
      const allSavingsGoals = [].concat.apply([], res);

      return {
        savingsGoals: allSavingsGoals.map((goal) => {
          return {
            name: goal.name,
            amount: Dinero({ amount: goal.totalSaved.minorUnits, currency: goal.totalSaved.currency }).toUnit(),
            currency: goal.totalSaved.currency
          }
        })
        .filter((balance) => {
          return balance.amount > 5;
        })
      };
    });
  }

  static async getSavingsGoalsForAccount(apiKey, accountUid) {
    return instance.get("/account/" + accountUid + "/savings-goals", {headers: headers(apiKey)})
    .then((res) => {
      return res.data.savingsGoalList;
    });
  }
}

module.exports = {StarlingBankIntegrationOperations};
