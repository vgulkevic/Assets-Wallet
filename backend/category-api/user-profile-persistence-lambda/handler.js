'use strict';

const {ApiGatewayUtils} = require('custom_common_lib');
const {UserProfileOperations} = require(
    './service/UserProfileOperations.js');

module.exports.getUserProfile = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  try {
    const defResponse = {
      main: "GBP",
      secondary: "USD"
    };

    const userProfile = await UserProfileOperations.getUserProfile(event.requestContext.authorizer.claims.sub);

    const res = !userProfile ? defResponse : {
      main: userProfile.MainCurrency,
      secondary: userProfile.SecondaryCurrency
    }

    console.log(res);

    return ApiGatewayUtils.successResponse(res);
  } catch (e) {
    console.log(JSON.stringify(e));
    return ApiGatewayUtils.internalError('Internal Error');
  }
}

module.exports.setUserProfile = async (event) => {
  console.log(JSON.stringify(event));

  if (event.httpMethod === "OPTIONS") {
    return ApiGatewayUtils.successResponse();
  }

  try {
    const res = await UserProfileOperations.setUserProfile(JSON.parse(event.body), event.requestContext.authorizer.claims.sub);
    const {MainCurrency, SecondaryCurrency} = {...res.Attributes};

    return ApiGatewayUtils.successResponse({
      main: MainCurrency,
      secondary: SecondaryCurrency
    });
  } catch (e) {
    console.log(JSON.stringify(e));
    return ApiGatewayUtils.internalError('Internal Error');
  }
}
