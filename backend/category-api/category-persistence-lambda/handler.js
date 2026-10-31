'use strict';

const {ApiGatewayUtils} = require('custom_common_lib');
const {CategoriesOperations} = require('./service/CategoriesOperations.js');
const {CustomCategoriesOperations} = require('./service/CustomCategoriesOperations.js');
const {AssetHistoryOperations} = require('./service/AssetHistoryOperations.js');
const {NetWorthOperations} = require('./service/NetWorthOperations.js');

module.exports.getCategoriesHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }
  console.log(JSON.stringify(event));

  try {
    const items = await CategoriesOperations.getCategories(event.requestContext.authorizer.claims.sub);
    return ApiGatewayUtils.successResponse(items.map((category) => {
      return {
        id: category.CategoryUid,
        name: category.CategoryName,
        assets: CustomCategoriesOperations.mapAssetsMapToArray(category.Assets),
        categoryType: category.CategoryType
      }
    }));
  } catch (e) {
    console.log(JSON.stringify(e));
    return ApiGatewayUtils.internalError('Internal Error');
  }
}

module.exports.createCategoryHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }
  console.log(JSON.stringify(event));

  try {
    const req = JSON.parse(event.body);
    if (req.categoryType !== 'CUSTOM_CATEGORY') {
      return ApiGatewayUtils.badRequest();
    }

    const res = await CustomCategoriesOperations.createCustomCategory(req, event.requestContext.authorizer.claims.sub);
    const {CategoryUid, CategoryName, CategoryType, Assets} = {...res};

    return ApiGatewayUtils.successResponse({
      id: CategoryUid,
      name: CategoryName,
      categoryType: CategoryType,
      assets: Assets
    });
  } catch (e) {
    console.log(JSON.stringify(e));
    return ApiGatewayUtils.internalError('Internal Error');
  }
}

module.exports.updateCategoryHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }
  console.log(JSON.stringify(event));

  try {
    const req = JSON.parse(event.body);

    if (req.categoryType !== 'CUSTOM_CATEGORY') {
      return ApiGatewayUtils.badRequest();
    }

    const res = await CustomCategoriesOperations.updateCustomCategory(req, event.requestContext.authorizer.claims.sub);
    const {CategoryUid, CategoryName, CategoryType, Assets} = {...res.Attributes};

    return ApiGatewayUtils.successResponse({
      id: CategoryUid,
      name: CategoryName,
      categoryType: CategoryType,
      assets: CustomCategoriesOperations.mapAssetsMapToArray(Assets)
    });
  } catch (e) {
    console.log(JSON.stringify(e));
    return ApiGatewayUtils.internalError('Internal Error');
  }
}


module.exports.deleteCategoryHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }
  console.log(JSON.stringify(event));
  try {
    const deletedId = await CategoriesOperations.deleteCategory(event.body, event.requestContext.authorizer.claims.sub);

    return deletedId ? ApiGatewayUtils.successResponse(deletedId) : ApiGatewayUtils.notFound();
  } catch (e) {
    console.log(JSON.stringify(e));
    return ApiGatewayUtils.internalError('Internal Error');
  }
}

module.exports.createCategoryAssetHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  console.log(JSON.stringify(event));
  try {
    const request = JSON.parse(event.body);
    const res = await CustomCategoriesOperations.createCategoryAsset(request.categoryId, event.requestContext.authorizer.claims.sub, request.asset);
    const {CategoryUid, Asset} = {...res};

    if (!CategoryUid && !Asset) {
      return ApiGatewayUtils.badRequest();
    } else {
      return ApiGatewayUtils.successResponse({
        categoryId: CategoryUid,
        asset: {
          id: Asset.AssetUid,
          name: Asset.AssetName,
          amount: Asset.AssetAmount,
          currency: Asset.AssetCurrency
        }
      });
    }
  } catch (e) {
    console.log(JSON.stringify(e));
    return ApiGatewayUtils.internalError('Internal Error');
  }
}

module.exports.updateCategoryAssetHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  console.log(JSON.stringify(event));
  try {
    const request = JSON.parse(event.body);
    const res = await CustomCategoriesOperations.updateCategoryAsset(request.categoryId, event.requestContext.authorizer.claims.sub, request.asset);
    const {CategoryUid, Asset} = {...res};

    if (!res) {
      return ApiGatewayUtils.notFound();
    } else {
      return ApiGatewayUtils.successResponse({
        categoryId: CategoryUid,
        asset: {
          id: Asset.AssetUid,
          name: Asset.AssetName,
          amount: Asset.AssetAmount,
          currency: Asset.AssetCurrency
        }
      });
    }
  } catch (e) {
    console.log(JSON.stringify(e));
    return ApiGatewayUtils.internalError('Internal Error');
  }
}

module.exports.deleteCategoryAssetHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  console.log(JSON.stringify(event));
  try {
    const request = JSON.parse(event.body);

    const deletedAsset = await CustomCategoriesOperations.deleteCategoryAsset(request.categoryId, event.requestContext.authorizer.claims.sub, request.assetId);

    if (deletedAsset) {
      return ApiGatewayUtils.successResponse({
        categoryId: request.categoryId,
        deletedAssetId: deletedAsset.AssetUid
      });
    } else {
      return ApiGatewayUtils.notFound();
    }

  } catch (e) {
    console.log(JSON.stringify(e));
    return ApiGatewayUtils.internalError('Internal Error');
  }
}

// GET ?assetId=... : every recorded change of an asset, oldest first
module.exports.getAssetHistoryHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  try {
    const assetId = event.queryStringParameters && event.queryStringParameters.assetId;
    if (!assetId) {
      return ApiGatewayUtils.badRequest();
    }

    return ApiGatewayUtils.successResponse(await AssetHistoryOperations.getAssetHistory(event.requestContext.authorizer.claims.sub, assetId));
  } catch (e) {
    console.log(e);
    return ApiGatewayUtils.internalError('Internal Error');
  }
}

// POST {changeId, excluded}: leave a wrong change out of (or back in) the asset's chart
module.exports.setAssetChangeExcludedHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  try {
    const {changeId, excluded} = JSON.parse(event.body);
    if (!changeId || typeof excluded !== 'boolean') {
      return ApiGatewayUtils.badRequest();
    }

    return ApiGatewayUtils.successResponse(await AssetHistoryOperations.setExcluded(event.requestContext.authorizer.claims.sub, changeId, excluded));
  } catch (e) {
    console.log(e);
    return e.name === 'ConditionalCheckFailedException' ? ApiGatewayUtils.notFound() : ApiGatewayUtils.internalError('Internal Error');
  }
}

// POST {categoryIds: [...]}
module.exports.reorderCategoriesHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  try {
    const {categoryIds} = JSON.parse(event.body);
    if (!Array.isArray(categoryIds)) {
      return ApiGatewayUtils.badRequest();
    }

    await CategoriesOperations.reorderCategories(event.requestContext.authorizer.claims.sub, categoryIds);
    return ApiGatewayUtils.successResponse(categoryIds);
  } catch (e) {
    console.log(e);
    return ApiGatewayUtils.internalError('Internal Error');
  }
}

// POST {categoryId, assetIds: [...]}
module.exports.reorderAssetsHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  try {
    const {categoryId, assetIds} = JSON.parse(event.body);
    if (!categoryId || !Array.isArray(assetIds)) {
      return ApiGatewayUtils.badRequest();
    }

    await CustomCategoriesOperations.reorderAssets(categoryId, event.requestContext.authorizer.claims.sub, assetIds);
    return ApiGatewayUtils.successResponse({categoryId, assetIds});
  } catch (e) {
    console.log(e);
    return ApiGatewayUtils.internalError('Internal Error');
  }
}

// GET: the user's net worth over time
module.exports.getNetWorthHistoryHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  try {
    return ApiGatewayUtils.successResponse(await NetWorthOperations.getHistory(event.requestContext.authorizer.claims.sub));
  } catch (e) {
    console.log(e);
    return ApiGatewayUtils.internalError('Internal Error');
  }
}

// Scheduled nightly by EventBridge
module.exports.snapshotNetWorthHandler = async () => {
  const result = await NetWorthOperations.snapshotAll();
  console.log(JSON.stringify(result));
  if (result.failed > 0) {
    throw new Error(`${result.failed} snapshot(s) failed`);
  }
  return result;
}
