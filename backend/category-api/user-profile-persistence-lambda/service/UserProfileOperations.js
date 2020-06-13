'use strict';

const {DynamoDbClient} = require('custom_common_lib');
const db = DynamoDbClient.of(process.env.USER_PROFILE_TABLE);

class UserProfileOperations {

  static async getUserProfile(userId) {
    console.log(userId);

    return await db.get({
      Key: {
        UserId: userId
      }
    });
  }

  static async setUserProfile(userProfile, userId) {
    console.log("setUserProfile");

    return db.update({
      Key: {
        UserId: userId
      },
      UpdateExpression:
          'set MainCurrency = :mainCurrency, ' +
          'SecondaryCurrency = :secondaryCurrency',
      ReturnValues: 'ALL_NEW',
      ExpressionAttributeValues: {
        ':mainCurrency': userProfile.main,
        ':secondaryCurrency': userProfile.secondary
      },
    });
  }
}

module.exports = {UserProfileOperations}
