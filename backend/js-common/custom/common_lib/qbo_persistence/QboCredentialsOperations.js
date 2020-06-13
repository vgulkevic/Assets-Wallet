'use strict';

const credentialsTable = process.env.INTUIT_CREDENTIALS_TABLE_NAME;
const {DynamoDbClient} = require('../dynamoDbClient.js');
const db = new DynamoDbClient(credentialsTable);

class QboCredentialsOperations {

  static async getCredentials(linkedCompany) {
    return db.get({
      Key: {
        CompanyName: linkedCompany
      }
    });
  }

  static async updateCredentials(linkedCompany, token) {
    return db.update({
      Key: {
        CompanyName: linkedCompany,
      },
      UpdateExpression: 'set AccessToken = :at, '
          + 'RefreshToken = :rt, '
          + 'RefreshTokenExpiresIn = :rtExp, '
          + 'AccessTokenExpiresIn = :atExp, '
          + 'lastUpdated = :upd',
      ExpressionAttributeValues: {
        ':at': token.access_token,
        ':rt': token.refresh_token,
        ':rtExp': token.x_refresh_token_expires_in,
        ':atExp': token.expires_in,
        ':upd': token.createdAt
      },
    });
  }
}

module.exports = {QboCredentialsOperations}