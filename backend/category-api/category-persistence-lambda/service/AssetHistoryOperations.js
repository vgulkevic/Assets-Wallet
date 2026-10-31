'use strict';

const {randomUUID} = require('crypto');
const {DynamoDbClient} = require('custom_common_lib');
const db = DynamoDbClient.of(process.env.ASSET_HISTORY_TABLE);

// One item per change of an asset: UserId (PK) + ChangeId (SK) = "<assetUid>#<ISO time>#<random>",
// so all changes of an asset can be queried in time order with begins_with.
class AssetHistoryOperations {

  /**
   * Builds the history item; it is written by the caller in the same transaction as the asset change.
   * @param {'CREATED'|'UPDATED'|'DELETED'|'BASELINE'} changeType
   */
  static historyPut(userId, categoryId, changeType, asset, previous, changedAt) {
    const item = {
      UserId: userId,
      ChangeId: `${asset.AssetUid}#${changedAt}#${randomUUID().slice(0, 8)}`,
      AssetUid: asset.AssetUid,
      CategoryUid: categoryId,
      ChangeType: changeType,
      ChangedAt: changedAt,
      Name: asset.AssetName,
      Amount: asset.AssetAmount,
      Currency: asset.AssetCurrency,
      Excluded: false
    };

    if (previous) {
      item.PreviousName = previous.AssetName;
      item.PreviousAmount = previous.AssetAmount;
      item.PreviousCurrency = previous.AssetCurrency;
    }

    return {
      Put: {
        TableName: process.env.ASSET_HISTORY_TABLE,
        Item: item,
        ConditionExpression: 'attribute_not_exists(ChangeId)'
      }
    };
  }

  static async getAssetHistory(userId, assetId) {
    const items = [];
    let ExclusiveStartKey;
    do {
      const res = await db.query({
        KeyConditionExpression: 'UserId = :userId and begins_with(ChangeId, :prefix)',
        ExpressionAttributeValues: {':userId': userId, ':prefix': `${assetId}#`},
        ExclusiveStartKey
      });
      items.push(...res.Items);
      ExclusiveStartKey = res.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return items.map(AssetHistoryOperations.toApi);
  }

  // An excluded change stays in the history but is left out of the asset's chart.
  static async setExcluded(userId, changeId, excluded) {
    const res = await db.update({
      Key: {UserId: userId, ChangeId: changeId},
      UpdateExpression: excluded ? 'set Excluded = :excluded, ExcludedAt = :now' : 'set Excluded = :excluded remove ExcludedAt',
      ExpressionAttributeValues: excluded ? {':excluded': true, ':now': new Date().toISOString()} : {':excluded': false},
      ConditionExpression: 'attribute_exists(ChangeId)',
      ReturnValues: 'ALL_NEW'
    });

    return AssetHistoryOperations.toApi(res.Attributes);
  }

  static toApi(item) {
    return {
      id: item.ChangeId,
      assetId: item.AssetUid,
      categoryId: item.CategoryUid,
      type: item.ChangeType,
      changedAt: item.ChangedAt,
      name: item.Name,
      amount: item.Amount,
      currency: item.Currency,
      previousName: item.PreviousName,
      previousAmount: item.PreviousAmount,
      previousCurrency: item.PreviousCurrency,
      excluded: Boolean(item.Excluded)
    };
  }
}

module.exports = {AssetHistoryOperations};
