'use strict';

const {QboCredentialsOperations} = require(
    './qbo_persistence/QboCredentialsOperations.js');

const axios = require('axios');
const instance = axios.create({
  baseURL: process.env.QBO_BASE_URL,
  timeout: 5000,
});

const headers = (token) => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

class QboClient {

  #access_token;
  #realm_id;

  /**
   * @constructor
   * @param {string} params.accessToken
   * @param {string} params.realmId
   */
  constructor(params) {
    this.#access_token = params.accessToken;
    this.#realm_id = params.realmId;
  }

  /**
   * Creates new invoice
   * @param {Object} invoice
   * @returns Promise<*>
   */
  async createInvoice(invoice) {
    const response = await this.post('/invoice', invoice);
    console.log(JSON.stringify(response.data));
    return response.data.Invoice;
  }

  /**
   * Get invoice pdf file as byte array
   * @param {string} invoiceId
   * @return {Promise<*>}
   */
  async getInvoicePdf(invoiceId) {
    const opts = {
      headers: {
        'Accept': 'application/pdf',
        'Authorization': `Bearer ${this.#access_token}`
      },
      responseType: 'arraybuffer'
    };

    const response = await instance.get(
        `/${this.#realm_id}/invoice/${invoiceId}/pdf`, opts);
    return response.data;
  }

  /**
   * Query QBO customer by name
   * @param {string} customerName
   * @return {Promise<*>}
   */
  async queryCustomer(customerName) {
    const query = `select * from Customer where DisplayName = '${customerName}'`;
    const response = await this.get(`query?query=${query}`);
    console.log(JSON.stringify(response.data));

    const queryResponse = response.data.QueryResponse.Customer;
    if (queryResponse.length === 0) {
      throw new Error(`Customer ${customerName} not found`);
    }
    return queryResponse[0];
  }

  /**
   * Query all available QBO customers
   * @return {Promise<Array<object>>}
   */
  async getAllQboCustomers() {
    const query = `select * from Customer`;
    const response = await this.get(`query?query=${query}`);
    console.log(JSON.stringify(response.data));
    return response.data.QueryResponse.Customer;
  }

  /**
   * Create QBO SalesItem (i.e. service/product)
   * @param {Object} item
   * @return {Promise<*>}
   */
  async createSalesItem(item) {
    const response = await this.post('/item', item);
    console.log(JSON.stringify(response.data));
    return response.data.Item;
  }

  /**
   * Create QBO Customer
   * @param customer
   * @return {Promise<*>}
   */
  async createCustomer(customer) {
    const response = await this.post('/customer', customer);
    console.log(JSON.stringify(response.data));
    return response.data.Customer;
  }

  /**
   * Get all QBO SalesItem
   * @return {Promise<Array<object>>}
   */
  async getAllSalesItems() {
    const query = `select * from Item`;
    const response = await this.get(`query?query=${query}`);
    console.log(JSON.stringify(response.data));
    return response.data.QueryResponse.Item;
  }

  /**
   * Perform GET request on Intuit API
   * @param {string} path
   * @return {Promise<AxiosResponse<*>>}
   */
  async get(path) {
    const opts = {
      headers: headers(this.#access_token),
    };

    return instance.get(`/${this.#realm_id}/${path}`, opts);
  }

  /**
   * Perform POST request on Intuit API
   * @param {string} path
   * @param {Object} body
   * @return {Promise<AxiosResponse<*>>}
   */
  async post(path, body) {
    const opts = {
      headers: headers(this.#access_token),
    };

    return instance.post(`/${this.#realm_id}/${path}`, JSON.stringify(body),
        opts);
  }
}

class QboClientFactory {

  /**
   * Instantiate QboClient with cached credentials
   * @async
   * @param {string} linkedCompany - QuickBooks Online company
   * @return {Promise<QboClient>}
   */
  static async forCompany(linkedCompany) {
    const credentials = await QboCredentialsOperations.getCredentials(
        linkedCompany);

    // noinspection JSUnresolvedVariable
    return new QboClient({
      realmId: credentials.RealmId,
      accessToken: credentials.AccessToken,
    });
  }
}

module.exports = {QboClient, QboClientFactory};
