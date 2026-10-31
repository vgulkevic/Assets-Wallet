'use strict';

const {DynamoDbClient} = require('custom_common_lib');
const db = DynamoDbClient.of(process.env.CUSTOM_CATEGORIES_TABLE);
const {randomUUID} = require('crypto');
const {AssetHistoryOperations} = require('./AssetHistoryOperations.js');

const CUSTOM_CATEGORY = 'CUSTOM_CATEGORY';

class CustomCategoriesOperations {

  static async createCustomCategory(category, userId) {
    const uid = randomUUID();
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


  // Asset changes and their history entry are written in one transaction, so the history is never missing a change.

  static async createCategoryAsset(categoryId, userId, asset) {
    const now = new Date().toISOString();
    const stored = {
      AssetUid: randomUUID(),
      AssetName: asset.name,
      AssetAmount: asset.amount,
      AssetCurrency: asset.currency,
      AssetUpdatedAt: now
    };

    await db.transactUpdate([
      {
        Update: {
          TableName: process.env.CUSTOM_CATEGORIES_TABLE,
          Key: {UserId: userId, CategoryUid: categoryId},
          UpdateExpression: 'set Assets.#assetUid = :asset',
          ExpressionAttributeNames: {'#assetUid': stored.AssetUid},
          ExpressionAttributeValues: {':asset': stored, ':categoryType': CUSTOM_CATEGORY},
          ConditionExpression: 'attribute_not_exists(Assets.#assetUid) and attribute_exists(CategoryUid) and CategoryType = :categoryType'
        }
      },
      AssetHistoryOperations.historyPut(userId, categoryId, 'CREATED', stored, null, now)
    ]);

    return {CategoryUid: categoryId, Asset: stored};
  }

  static async updateCategoryAsset(categoryId, userId, asset) {
    const previous = await CustomCategoriesOperations.getAsset(categoryId, userId, asset.id);
    if (!previous) {
      return null;
    }

    const now = new Date().toISOString();
    const updated = {
      ...previous,
      AssetName: asset.name,
      AssetAmount: asset.amount,
      AssetCurrency: asset.currency,
      AssetUpdatedAt: now
    };

    await db.transactUpdate([
      {
        Update: {
          TableName: process.env.CUSTOM_CATEGORIES_TABLE,
          Key: {UserId: userId, CategoryUid: categoryId},
          UpdateExpression: 'set Assets.#assetUid.AssetName = :assetName, ' +
              'Assets.#assetUid.AssetAmount = :assetAmount, ' +
              'Assets.#assetUid.AssetCurrency = :assetCurrency, ' +
              'Assets.#assetUid.AssetUpdatedAt = :updatedAt',
          ExpressionAttributeNames: {'#assetUid': asset.id},
          ExpressionAttributeValues: {
            ':assetName': updated.AssetName,
            ':assetAmount': updated.AssetAmount,
            ':assetCurrency': updated.AssetCurrency,
            ':updatedAt': now,
            ':categoryType': CUSTOM_CATEGORY
          },
          ConditionExpression: 'attribute_exists(Assets.#assetUid) and attribute_exists(CategoryUid) and CategoryType = :categoryType'
        }
      },
      AssetHistoryOperations.historyPut(userId, categoryId, 'UPDATED', updated, previous, now)
    ]);

    return {CategoryUid: categoryId, Asset: updated};
  }

  // returns the deleted asset, or null if it did not exist
  static async deleteCategoryAsset(categoryId, userId, assetId) {
    const previous = await CustomCategoriesOperations.getAsset(categoryId, userId, assetId);
    if (!previous) {
      return null;
    }

    const now = new Date().toISOString();
    await db.transactUpdate([
      {
        Update: {
          TableName: process.env.CUSTOM_CATEGORIES_TABLE,
          Key: {UserId: userId, CategoryUid: categoryId},
          UpdateExpression: 'remove Assets.#assetUid',
          ExpressionAttributeNames: {'#assetUid': assetId},
          ExpressionAttributeValues: {':categoryType': CUSTOM_CATEGORY},
          ConditionExpression: 'attribute_exists(Assets.#assetUid) and attribute_exists(CategoryUid) and CategoryType = :categoryType'
        }
      },
      AssetHistoryOperations.historyPut(userId, categoryId, 'DELETED', previous, previous, now)
    ]);

    return previous;
  }

  static async getAsset(categoryId, userId, assetId) {
    const category = await db.get({Key: {UserId: userId, CategoryUid: categoryId}});
    const asset = category && category.CategoryType === CUSTOM_CATEGORY && category.Assets && category.Assets[assetId];
    return asset ? {...asset, AssetUid: assetId} : null;
  }

  // Saves the user's order of the assets in a category; assets missing from `assetIds` keep their position number.
  static async reorderAssets(categoryId, userId, assetIds) {
    if (assetIds.length === 0) {
      return;
    }

    const names = {};
    const values = {':categoryType': CUSTOM_CATEGORY};
    const sets = assetIds.map((assetId, i) => {
      names[`#a${i}`] = assetId;
      values[`:o${i}`] = i;
      return `Assets.#a${i}.SortOrder = :o${i}`;
    });

    await db.update({
      Key: {UserId: userId, CategoryUid: categoryId},
      UpdateExpression: 'set ' + sets.join(', '),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(CategoryUid) and CategoryType = :categoryType'
    });
  }

  // Assets with a saved position come first in that order, the rest (never reordered) follow by name.
  static mapAssetsMapToArray(assets) {
    if (!assets) {
      return [];
    }

    return Object.values(assets)
        .sort(bySortOrderThenName(asset => asset.SortOrder, asset => asset.AssetName))
        .map(asset => ({
          id: asset.AssetUid,
          name: asset.AssetName,
          amount: asset.AssetAmount,
          currency: asset.AssetCurrency,
          updatedAt: asset.AssetUpdatedAt
        }));
  }
}

function bySortOrderThenName(getOrder, getName) {
  return (a, b) => {
    const orderA = getOrder(a) ?? Number.MAX_SAFE_INTEGER;
    const orderB = getOrder(b) ?? Number.MAX_SAFE_INTEGER;
    return orderA !== orderB ? orderA - orderB : String(getName(a)).localeCompare(String(getName(b)));
  };
}

module.exports = {CustomCategoriesOperations, bySortOrderThenName}
