'use strict';

const {DynamoDbClient} = require('custom_common_lib');
const db = DynamoDbClient.of(process.env.CUSTOM_CATEGORIES_TABLE);
const {v4: uuidv4} = require('uuid');

class CategoriesOperations {
  static async getCategories(userId) {
    const {Items} = await db.query({
      TableName: process.env.CUSTOM_CATEGORIES_TABLE,
      KeyConditionExpression: "UserId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    });

    return Items;
  }

  static async deleteCategory(categoryId, userId) {
    return db.delete({
      Key: {
        UserId: userId,
        CategoryUid: categoryId
      },
      ReturnValues: 'ALL_OLD',
    });
  }
}

module.exports = {CategoriesOperations};