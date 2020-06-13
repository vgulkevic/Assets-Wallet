'use strict';

const {DynamoDbClient} = require('custom_common_lib');
const db = DynamoDbClient.of(process.env.CUSTOM_CATEGORIES_TABLE);
const {v4: uuidv4} = require('uuid');
const {StarlingBankIntegrationOperations} = require('./StarlingBankIntegrationOperations.js');
const {BittrexIntegrationOperations} = require('./BittrexIntegrationOperations.js');
const {KrakenIntegrationOperations} = require('./KrakenIntegrationOperations.js');
const {BinanceIntegrationOperations} = require('./BinanceIntegrationOperations.js');

class ApiServiceIntegratedCategoryOperations {

  static async getCategory(categoryId, userId) {
    console.log(categoryId);
    console.log(userId);

    return await db.get({
      Key: {
        UserId: userId,
        CategoryUid: categoryId
      },
      TableName: process.env.CUSTOM_CATEGORIES_TABLE
    });
  }

  static async createApiIntegratedCategory(category, userId) {
    const uid = uuidv4();
    const name = category.name;

    const res = await db.put({
      Key: {
        UserId: userId,
        CategoryUid: uid
      },
      Item: {
        'UserId': userId,
        'CategoryUid': uid,
        'CategoryName': name,
        'CategoryType': category.categoryType,
        'IntegrationService': category.integrationService,
        'ApiKey': category.apiKey,
        'ApiKeySecret': category.apiKeySecret,
        'Assets': {}
      },
      ReturnValues: 'ALL_OLD',
      ConditionExpression: "CategoryUid <> :uid",
      ExpressionAttributeValues: {
        ':uid': uid
      }
    });

    return {
      CategoryUid: uid,
      CategoryName: name,
      CategoryType: category.categoryType,
      IntegrationService: category.integrationService,
      ApiKey: category.apiKey,
      ApiKeySecret: category.apiKeySecret,
      Assets: []
    }
  }

  static async updateApiServiceIntegratedCategory(category, userId) {
    const name = category.name;
    const id = category.id;

    let updateObj = {
      Key: {
        UserId: userId,
        CategoryUid: id
      },
      UpdateExpression: 'set CategoryName = :categoryName, ' +
          'CategoryType = :categoryType, ' +
          'IntegrationService = :integrationService' +
          (category.apiKey ? ', ApiKey = :apiKey' : '') +
          (category.apiKeySecret ? ', ApiKeySecret = :apiKeySecret' : ''),
      ExpressionAttributeValues: {
        ':categoryName': name,
        ':categoryType': category.categoryType,
        ':integrationService': category.integrationService,
        ':conditionCategoryType' : 'CUSTOM_CATEGORY'
      },
      ConditionExpression: 'attribute_exists(CategoryUid) and CategoryType = :categoryType and CategoryType <> :conditionCategoryType',
      ReturnValues: 'ALL_NEW',
    };

    if (category.apiKey) {
      updateObj.ExpressionAttributeValues[':apiKey'] = category.apiKey;
    }

    if (category.apiKeySecret) {
      updateObj.ExpressionAttributeValues[':apiKeySecret'] = category.apiKeySecret;
    }

    return db.update(updateObj);
  }

  static maskApiKey(apiKey) {
    if (!apiKey) {
      return apiKey;
    }

    let unmaskedLength;

    if (apiKey.length < 5) {
      unmaskedLength = 0;
    } else if (apiKey.length < 7) {
      unmaskedLength = 2;
    } else if (apiKey.length < 9) {
      unmaskedLength = 3;
    } else {
      unmaskedLength = 4;
    }

    const maskedLength = apiKey.length - unmaskedLength;

    let res = Array(maskedLength + 1).join("*");
    res = res + apiKey.substring(maskedLength, apiKey.length);

    return res;
  }

  static async fetchAssets(category) {
    const {id, name, categoryType, apiKey, apiKeySecret, integrationService} = category;

    let assets = [];

    try {
      if (integrationService === 'STARLING_BANK') {
        assets = await StarlingBankIntegrationOperations.fetchAssets(category)
      }

      if (integrationService === "BITTREX") {
        assets = await BittrexIntegrationOperations.fetchAssets(category);
      }

      if (integrationService === "KRAKEN") {
        assets = await KrakenIntegrationOperations.fetchAssets(category);
      }

      if (integrationService === "BINANCE") {
        assets = await BinanceIntegrationOperations.fetchAssets(category);
      }
    } catch (e) {
      console.log(e);
    }

    return {
      id: id,
      name: name,
      categoryType: categoryType,
      apiKey: this.maskApiKey(apiKey),
      apiKeySecret: this.maskApiKey(apiKeySecret),
      integrationService: integrationService,
      assets: assets || []
    }
  }
}

module.exports = {ApiServiceIntegratedCategoryOperations};
