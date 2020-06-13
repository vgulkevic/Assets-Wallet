'use strict';

const salesItemsTable = process.env.QBO_SALES_ITEMS_TABLE_NAME;
const {DynamoDbClient} = require('../dynamoDbClient.js');
const db = new DynamoDbClient(salesItemsTable);

class QboSalesItemsOperations {

  static async getByName(name) {
    return db.get({
      Key: {
        ItemName: name
      }
    });
  }

  static async getAll() {
    return db.scan({
      TableName: salesItemsTable
    });
  }

  static async save(item) {
    return db.update({
      Key: {
        ItemName: item.Name,
      },
      UpdateExpression: 'set QboId = :qboId',
      ExpressionAttributeValues: {
        ':qboId': item.Id
      },
    });
  }

  static async saveAll(items) {
    const toUpdate = items.map(item => {
      return {
        Update: {
          TableName: salesItemsTable,
          Key: {
            ItemName: item.Name,
          },
          UpdateExpression: 'set QboId = :qboId',
          ExpressionAttributeValues: {
            ':qboId': item.Id
          },
        }
      }
    });
    await db.transactUpdate(toUpdate);
  }
}

module.exports = {QboSalesItemsOperations}