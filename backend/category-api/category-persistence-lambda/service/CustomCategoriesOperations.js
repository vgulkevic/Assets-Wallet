'use strict';

const {DynamoDbClient} = require('custom_common_lib');
const db = DynamoDbClient.of(process.env.CUSTOM_CATEGORIES_TABLE);
const {v4: uuidv4} = require('uuid');

class CustomCategoriesOperations {

  static async createCustomCategory(category, userId) {
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
        'CategoryType': 'CUSTOM_CATEGORY',
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
      CategoryType: 'CUSTOM_CATEGORY',
      Assets: []
    }
  }

  static async updateCustomCategory(category, userId) {
    const name = category.name;
    const id = category.id;

    return db.update({
      Key: {
        UserId: userId,
        CategoryUid: id
      },
      UpdateExpression: 'set CategoryName = :categoryName',
      ExpressionAttributeValues: {
        ':categoryName': name,
        ':categoryType' : 'CUSTOM_CATEGORY'
      },
      ConditionExpression: 'attribute_exists(CategoryUid) and CategoryType = :categoryType',
      ReturnValues: 'ALL_NEW',
    });
  }


  static async createCategoryAsset(categoryId, userId, asset) {
    console.log(categoryId);
    console.log(userId);
    console.log(asset);

    const assetUid = uuidv4();

    const res = await db.update({
      Key: {
        UserId: userId,
        CategoryUid: categoryId
      },
      UpdateExpression: 'set Assets.#assetUid = :asset',
      ExpressionAttributeNames: {
        '#assetUid' : assetUid
      },
      ExpressionAttributeValues: {
        ':asset' : {
          AssetUid: assetUid,
          AssetName: asset.name,
          AssetAmount: asset.amount,
          AssetCurrency: asset.currency
        },
        ':categoryType' : 'CUSTOM_CATEGORY'
      },
      ConditionExpression: 'attribute_not_exists(Assets.#assetUid) and attribute_exists(CategoryUid) and CategoryType = :categoryType',
      ReturnValues: 'ALL_NEW',
    });

    const {CategoryUid, Assets} = {...res.Attributes};

    if (!Assets || !Assets[assetUid]) {
      return null;
    } else {
      return {
        CategoryUid: CategoryUid,
        Asset: Assets[assetUid]
      };
    }
  }

  static async updateCategoryAsset(categoryId, userId, asset) {
    console.log(categoryId);
    console.log(userId);
    console.log(asset);

    const assetUid = asset.id;

    const res = await db.update({
      Key: {
        UserId: userId,
        CategoryUid: categoryId
      },
      UpdateExpression: 'set Assets.#assetUid.AssetName = :assetName, ' +
          'Assets.#assetUid.AssetAmount = :assetAmount, ' +
          'Assets.#assetUid.AssetCurrency = :assetCurrency',
      ExpressionAttributeNames: { "#assetUid" :  assetUid },
      ExpressionAttributeValues: {
        ':assetName': asset.name,
        ':assetAmount': asset.amount,
        ':assetCurrency': asset.currency,
        ':categoryType' : 'CUSTOM_CATEGORY'
      },
      ConditionExpression: 'attribute_exists(Assets.#assetUid) and attribute_exists(CategoryUid) and CategoryType = :categoryType',
      ReturnValues: 'UPDATED_NEW',
    });

    const {Assets} = {...res.Attributes};

    if (!Assets || !Assets[assetUid]) {
      return null;
    } else {
      const res = {
        CategoryUid: categoryId,
        Asset: Assets[assetUid]
      };
      res.Asset.AssetUid = assetUid;

      return res;
    }
  }

  static async deleteCategoryAsset(categoryId, userId, assetId) {
    console.log(categoryId);
    console.log(userId);
    console.log(assetId);

    return db.update({
      Key: {
        UserId: userId,
        CategoryUid: categoryId
      },
      UpdateExpression: 'remove Assets.#assetUid',
      ExpressionAttributeNames: {
        '#assetUid' : assetId
      },
      ExpressionAttributeValues: {
        ':categoryType' : 'CUSTOM_CATEGORY'
      },
      ConditionExpression: 'attribute_exists(Assets.#assetUid) and attribute_exists(CategoryUid) and CategoryType = :categoryType',
      ReturnValues: 'UPDATED_OLD'
    });
  }

  static mapAssetsMapToArray(assets) {
    console.log("mapAssetsMapToArray: ");
    console.log(assets);

    if (!assets || assets === {}) {
      return [];
    }

    const res = [];

    Object.keys(assets).map(function(key, index) {
      const asset = assets[key];
      res.push({
        id: asset.AssetUid,
        name: asset.AssetName,
        amount: asset.AssetAmount,
        currency: asset.AssetCurrency
      });
    });

    return res;
  }
}

module.exports = {CustomCategoriesOperations}
