'use strict';

const {DynamoDbClient} = require('custom_common_lib');
const db = DynamoDbClient.of(process.env.CUSTOM_CATEGORIES_TABLE);
const {AssetHistoryOperations} = require('./AssetHistoryOperations.js');
const {bySortOrderThenName} = require('./CustomCategoriesOperations.js');

class CategoriesOperations {
  // in the user's order; categories that were never reordered follow by name
  static async getCategories(userId) {
    const {Items} = await db.query({
      TableName: process.env.CUSTOM_CATEGORIES_TABLE,
      KeyConditionExpression: "UserId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    });

    return Items.sort(bySortOrderThenName(category => category.SortOrder, category => category.CategoryName));
  }

  // Deletes the category and records a DELETED history entry for each of its assets.
  // Returns the deleted category id, or null if it did not exist.
  static async deleteCategory(categoryId, userId) {
    const category = await db.get({Key: {UserId: userId, CategoryUid: categoryId}});
    if (!category) {
      return null;
    }

    const now = new Date().toISOString();
    const assetDeletions = Object.entries(category.Assets || {}).map(([assetUid, asset]) => {
      const deleted = {...asset, AssetUid: assetUid};
      return AssetHistoryOperations.historyPut(userId, categoryId, 'DELETED', deleted, deleted, now);
    });

    await db.transactUpdate([
      {
        Delete: {
          TableName: process.env.CUSTOM_CATEGORIES_TABLE,
          Key: {UserId: userId, CategoryUid: categoryId},
          ConditionExpression: 'attribute_exists(CategoryUid)'
        }
      },
      ...assetDeletions
    ]);

    return categoryId;
  }

  static async reorderCategories(userId, categoryIds) {
    await Promise.all(categoryIds.map((categoryId, i) => db.update({
      Key: {UserId: userId, CategoryUid: categoryId},
      UpdateExpression: 'set SortOrder = :order',
      ExpressionAttributeValues: {':order': i},
      ConditionExpression: 'attribute_exists(CategoryUid)'
    })));
  }
}

module.exports = {CategoriesOperations};
