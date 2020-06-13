'use strict';

const {ApiGatewayUtils} = require('custom_common_lib');
const {CategoriesOperations} = require('./service/CategoriesOperations.js');
const {CustomCategoriesOperations} = require('./service/CustomCategoriesOperations.js');
const {ApiServiceIntegratedCategoryOperations} = require('./service/ApiServiceIntegratedCategoryOperations.js');

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
        categoryType: category.CategoryType,
        apiKey: ApiServiceIntegratedCategoryOperations.maskApiKey(category.ApiKey),
        apiKeySecret: ApiServiceIntegratedCategoryOperations.maskApiKey(category.ApiKeySecret),
        integrationService: category.IntegrationService
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
    let res;

    const req = JSON.parse(event.body);
    if (req.categoryType === 'CUSTOM_CATEGORY') {
      res = await CustomCategoriesOperations.createCustomCategory(req, event.requestContext.authorizer.claims.sub);

      const {CategoryUid, CategoryName, CategoryType, Assets} = {...res};

      return ApiGatewayUtils.successResponse({
        id: CategoryUid,
        name: CategoryName,
        categoryType: CategoryType,
        assets: Assets
      });

    } else {
      res = await ApiServiceIntegratedCategoryOperations.createApiIntegratedCategory(req, event.requestContext.authorizer.claims.sub);

      const {CategoryUid, CategoryName, CategoryType, ApiKey, ApiKeySecret, IntegrationService} = {...res};

      return ApiGatewayUtils.successResponse({
        id: CategoryUid,
        name: CategoryName,
        assets: [],
        categoryType: CategoryType,
        apiKey: ApiServiceIntegratedCategoryOperations.maskApiKey(ApiKey),
        apiKeySecret: ApiServiceIntegratedCategoryOperations.maskApiKey(ApiKeySecret),
        integrationService: IntegrationService
      });
    }


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

    if (!req.categoryType) {
      return ApiGatewayUtils.internalError('Internal Error');
    }

    if (req.categoryType === 'CUSTOM_CATEGORY') {
      const res = await CustomCategoriesOperations.updateCustomCategory(req, event.requestContext.authorizer.claims.sub);
      const {CategoryUid, CategoryName, CategoryType, Assets} = {...res.Attributes};

      return ApiGatewayUtils.successResponse({
        id: CategoryUid,
        name: CategoryName,
        categoryType: CategoryType,
        assets: CustomCategoriesOperations.mapAssetsMapToArray(Assets)
      });
    }
    else {
      const res = await ApiServiceIntegratedCategoryOperations.updateApiServiceIntegratedCategory(req, event.requestContext.authorizer.claims.sub);

      const {CategoryUid, CategoryName, CategoryType, ApiKey, ApiKeySecret, IntegrationService} = {...res.Attributes};

      return ApiGatewayUtils.successResponse({
        id: CategoryUid,
        name: CategoryName,
        assets: [],
        categoryType: CategoryType,
        apiKey: ApiServiceIntegratedCategoryOperations.maskApiKey(ApiKey),
        apiKeySecret: ApiServiceIntegratedCategoryOperations.maskApiKey(ApiKeySecret),
        integrationService: IntegrationService
      });
    }
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
    const res = await CategoriesOperations.deleteCategory(event.body, event.requestContext.authorizer.claims.sub);
    const {CategoryUid} = {...res.Attributes};

    return ApiGatewayUtils.successResponse(CategoryUid);
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

module.exports.deleteCategoryAssetHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  console.log(JSON.stringify(event));
  try {
    const request = JSON.parse(event.body);

    const res = await CustomCategoriesOperations.deleteCategoryAsset(request.categoryId, event.requestContext.authorizer.claims.sub, request.assetId);

    console.log("delete returned");
    console.log(JSON.stringify(res));
    const {Assets} = {...res.Attributes};

    const deletedAsset = Assets[request.assetId];

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

module.exports.fetchCategoryAssetsHandler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  console.log(JSON.stringify(event));

  try {
    if (!event.queryStringParameters || !event.queryStringParameters.categoryId) {
      return ApiGatewayUtils.badRequest();
    }

    const item = await ApiServiceIntegratedCategoryOperations.getCategory(event.queryStringParameters.categoryId, event.requestContext.authorizer.claims.sub);
    const category = {
      id: item.CategoryUid,
      name: item.CategoryName,
      categoryType: item.CategoryType,
      apiKey: item.ApiKey,
      apiKeySecret: item.ApiKeySecret,
      integrationService: item.IntegrationService
    };

    if (!item.CategoryUid) {
      return ApiGatewayUtils.notFound();
    }

    const categoryWithFetchedAssets = await ApiServiceIntegratedCategoryOperations.fetchAssets(category);
    return ApiGatewayUtils.successResponse(categoryWithFetchedAssets);

  } catch (e) {
    console.log(JSON.stringify(e));
    return ApiGatewayUtils.internalError('Internal Error');
  }
};
