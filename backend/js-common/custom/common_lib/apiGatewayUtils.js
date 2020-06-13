'use strict';

class ApiGatewayUtils {
  static successResponse(body) {
    const _body = body != null
        ? JSON.stringify(body) : "";
    return {
      body: _body,
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
      }
    }
  }

  static internalError(msg) {
    return {
      body: msg,
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
      }
    }
  }

  static clientError(msg) {
    return {
      body: msg,
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
      }
    }
  }

  static notFound() {
    return {
      body: "Not found",
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
      }
    }
  }

  static badRequest() {
    return {
      body: "Bad Request",
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
      }
    }
  }
}

module.exports = {ApiGatewayUtils}