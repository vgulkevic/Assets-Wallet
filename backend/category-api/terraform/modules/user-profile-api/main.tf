module "get_user_profile_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "user-profile"
  http_method                     = "GET"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.get_user_profile_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "update_user_profile" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "create-user-profile"
  http_method                     = "POST"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.set_user_profile_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "api_gateway_deployment" {
  source      = "../../../../../terraform-common/modules/api_deployment"
  rest_api_id = var.rest_api_id
  stage       = var.stage

  endpoints = [
    module.get_user_profile_endpoint.integration_id,
    module.update_user_profile.integration_id
  ]
}

module "get_user_profile_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../user-profile-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-get-user-profile-handler-${var.stage}"
  handler        = "handler.getUserProfile"
  memory_size    = 128
  runtime        = "nodejs12.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = {
    USER_PROFILE_TABLE = module.user_profile_table.dynamodb_name
  }
}

module "set_user_profile_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../user-profile-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-set-user-profile-handler-${var.stage}"
  handler        = "handler.setUserProfile"
  memory_size    = 128
  runtime        = "nodejs12.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = {
    USER_PROFILE_TABLE = module.user_profile_table.dynamodb_name
  }
}

module "user_profile_table" {
  source          = "../../../../../terraform-common/modules/dynamodb"
  table_name      = "UserProfile-${var.stage}"
  partition_key   = "UserId"
  attributes = [
    {
      name : "UserId"
      type : "S"
    }
  ]
}

resource "aws_iam_policy" "allow_dynamo_policy" {
  name_prefix = "${var.service_prefix}-${var.stage}"
  policy = templatefile("../../../terraform-common/templates/dynamodb-read-write-policy.tpl", {
    resources = [module.user_profile_table.dynamodb_arn]
  })
}
