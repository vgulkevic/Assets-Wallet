'use strict';

const qboCustomersTableName = process.env.QBO_CUSTOMERS_TABLE_NAME;
const {DynamoDbClient} = require('../dynamoDbClient.js');
const db = new DynamoDbClient(qboCustomersTableName);

class QboCustomersOperations {

  static async getByName(name) {
    return db.get({
      Key: {
        CustomerName: name
      }
    });
  }

  static async getAll() {
    return db.scan({
      TableName: qboCustomersTableName
    });
  }

  static async save(customer) {
    return db.update({
      Key: {
        CustomerName: customer.CustomerName,
      },
      UpdateExpression: 'set QboId = :qboId',
      ExpressionAttributeValues: {
        ':qboId': customer.QboId
      },
    });
  }

  static async saveAll(customers) {
    const toUpdate = customers.map(customer => {
      return {
        Update: {
          TableName: qboCustomersTableName,
          Key: {
            CustomerName: customer.CustomerName
          },
          UpdateExpression: 'set QboId = :qboId',
          ExpressionAttributeValues: {
            ':qboId': customer.QboId
          },
        }
      }
    });
    await db.transactUpdate(toUpdate);
  }
}

module.exports = {QboCustomersOperations}