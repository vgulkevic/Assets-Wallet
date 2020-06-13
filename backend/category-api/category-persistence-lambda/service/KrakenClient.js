'use strict';

const crypto = require('crypto');
const axios = require('axios');
const qs = require('qs');

const instance = axios.create({
  timeout: 5000,
});

// Public/Private method names
const methods = {
  public  : [ 'Time', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC' ],
  private : [ 'Balance', 'TradeBalance', 'OpenOrders', 'ClosedOrders', 'QueryOrders', 'TradesHistory', 'QueryTrades', 'OpenPositions', 'Ledgers', 'QueryLedgers', 'TradeVolume', 'AddOrder', 'CancelOrder', 'DepositMethods', 'DepositAddresses', 'DepositStatus', 'WithdrawInfo', 'Withdraw', 'WithdrawStatus', 'WithdrawCancel', 'GetWebSocketsToken' ],
};

// Default options
const defaults = {
  url     : 'https://api.kraken.com',
  version : 0
};

// Create a signature for a request
const getMessageSignature = (path, request, secret, nonce) => {
  const message       = qs.stringify(request);
  const secret_buffer = new Buffer(secret, 'base64');
  const hash          = new crypto.createHash('sha256');
  const hmac          = new crypto.createHmac('sha512', secret_buffer);
  const hash_digest   = hash.update(nonce + message).digest('binary');
  const hmac_digest   = hmac.update(path + hash_digest, 'binary').digest('base64');

  return hmac_digest;
};

// Send an API request
const rawRequest = async (url, headers, data, timeout) => {
  // Set custom User-Agent string
  headers['User-Agent'] = 'Kraken Javascript API Client';

  const options = { headers, timeout };

  Object.assign(options, {
    method : 'POST',
    body   : qs.stringify(data),
  });

  const res = await instance.post(url, options.body, {headers: options.headers});
  const response = res.data;

  if(response.error && response.error.length) {
    const error = response.error
    .filter((e) => e.startsWith('E'))
    .map((e) => e.substr(1));

    if(!error.length) {
      throw new Error("Kraken API returned an unknown error");
    }

    throw new Error(error.join(', '));
  }

  return response;
};


class KrakenClient {

  static async api(key, secret, options, method, params) {
    let config = Object.assign({ key, secret }, defaults, options);

    if(typeof options === 'string') {
      options = { otp : options };
    }

    // Default params to empty object
    if(typeof params === 'function') {
      params   = {};
    }

    if(methods.public.includes(method)) {
      return this.publicMethod(config, method, params);
    }
    else if(methods.private.includes(method)) {
      return this.privateMethod(config, method, params);
    }
    else {
      throw new Error(method + ' is not a valid API method.');
    }
  }

  static publicMethod(config, method, params) {
    params = params || {};

    // Default params to empty object
    if(typeof params === 'function') {
      params   = {};
    }

    const path     = '/' + config.version + '/public/' + method;
    const url      = config.url + path;

    return rawRequest(url, {}, params, config.timeout);
  }

  static privateMethod(config, method, params) {
    params = params || {};

    // Default params to empty object
    if(typeof params === 'function') {
      params   = {};
    }

    const path = '/' + config.version + '/private/' + method;
    const url  = config.url + path;

    if(!params.nonce) {
      params.nonce = new Date() * 1000; // spoof microsecond
    }

    if(config.otp !== undefined) {
      params.otp = config.otp;
    }

    const signature = getMessageSignature(
        path,
        params,
        config.secret,
        params.nonce
    );

    const headers = {
      'API-Key'  : config.key,
      'API-Sign' : signature,
    };

    return rawRequest(url, headers, params, config.timeout);
  }
}

module.exports = {KrakenClient};