'use strict';

const {DynamoDB} = require('aws-sdk');
const docClient = new DynamoDB.DocumentClient();

class DynamoDbClient {
  TableName;

  /**
   * @constructor
   * @param {string} TableName
   */
  constructor(TableName) {
    this.TableName = TableName;
  }

  /**
   * @param {string} table
   */
  static of(table) {
    return new DynamoDbClient(table);
  }

  /**
   * @async
   * @param {Object} [params]
   * @param {Object} params.Key
   * @returns {Promise<*>}
   */
  async get(params) {
    const _params = {
      TableName: this.TableName,
      Key: params.Key
    };

    try {
      const res = await docClient.get(_params).promise();
      return res.Item;
    } catch (error) {
      console.log(`Dynamodb 'get' error`);
      logError(error, _params);
      throw error;
    }
  }

  /**
   * @async
   * @param {Object} [params]
   * @param {Object} params.Key
   */
  async put(params) {
    const _params = {
      TableName: this.TableName,
      ...params
    };

    try {
      return await docClient.put(_params).promise();
    } catch (error) {
      console.log(`Dynamodb 'put' - error`);
      logError(error, _params);
      throw error;
    }
  }

  /**
   * @async
   * @param {Object} params
   * @param {string} params.TableName
   * @param {Object} params.Key
   * @param {string} params.UpdateExpression
   * @param {object} params.ExpressionAttributeValues
   */
  async update(params) {
    const _params = {
      TableName: this.TableName,
      ...params
    };

    try {
      return await docClient.update(_params).promise();
    } catch (error) {
      console.log(`Dynamodb 'update' error`);
      logError(error, _params);
      throw error;
    }
  }

  /**
   * @async
   * @param {Object} params
   * @param {string} params.TableName
   * @param {string} params.KeyConditionExpression
   * @param {Object} params.ExpressionAttributeValues
   */
  async query(params) {
    const _params = {
      TableName: this.TableName,
      ...params
    };

    try {
      return await docClient.query(_params).promise();
    } catch (error) {
      console.log(`Dynamodb 'query' error`);
      logError(error, _params)
      throw error;
    }
  }

  /**
   * @async
   * @param {Object} params
   * @param {string} params.TableName
   * @param {string} [params.IndexName]
   */
  async scan(params) {
    try {
      return await docClient.scan(params).promise();
    } catch (error) {
      console.log(`Dynamodb 'scan' error`);
      logError(error, params);
      throw error;
    }
  }

  /**
   * @async
   * @param {Object} params
   */
  async delete(params) {
    const _params = {
      TableName: this.TableName,
      ...params
    };

    try {
      return await docClient.delete(_params).promise();
    } catch (error) {
      console.log(`Dynamodb 'delete' error`);
      logError(error, _params);
      throw error;
    }
  }

  /**
   * @async
   * @param {Array<Object>} params
   * @param {string} params.TableName
   * @param {string} params.KeyConditionExpression
   * @param {Object} params.ExpressionAttributeValues
   */
  async transactUpdate(params) {
    const batches = partition(params, 25);

    for (const batch of batches) {
      try {
        await docClient.transactWrite({
          TransactItems: batch
        }).promise();
      } catch (error) {
        console.log(`Dynamodb 'transactUpdate' error`);
        logError(error, params);
        throw error;
      }
    }
  }
}

function partition(array, size) {
  let result = [];
  for (let i = 0; i < array.length; i += size) {
    let chunk = array.slice(i, i + size);
    result.push(chunk);
  }
  return result
}

function logError(error, params) {
  console.log(`params: \n${JSON.stringify(params)}`);
  console.log(error);
}

module.exports = {DynamoDbClient};