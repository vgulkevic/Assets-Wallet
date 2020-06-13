### CATEGORIES START
# ENDPOINTS
module "get_custom_categories_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "categories"
  http_method                     = "GET"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.get_categories_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "create_category_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "create-category"
  http_method                     = "POST"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.create_category_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "update_custom_category_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "update-category"
  http_method                     = "POST"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.update_category_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "delete_custom_category_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "delete-category"
  http_method                     = "DELETE"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.delete_category_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

# CATEGORIES LAMBDAS
module "get_categories_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-get-categories-handler-${var.stage}"
  handler        = "handler.getCategoriesHandler"
  memory_size    = 128
  runtime        = "nodejs12.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = {
    CUSTOM_CATEGORIES_TABLE = module.categories_table.dynamodb_name
  }
}

module "create_category_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-create-category-handler-${var.stage}"
  handler        = "handler.createCategoryHandler"
  memory_size    = 128
  runtime        = "nodejs12.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = {
    CUSTOM_CATEGORIES_TABLE = module.categories_table.dynamodb_name
  }
}

module "update_category_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-update-category-handler-${var.stage}"
  handler        = "handler.updateCategoryHandler"
  memory_size    = 128
  runtime        = "nodejs12.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = {
    CUSTOM_CATEGORIES_TABLE = module.categories_table.dynamodb_name
  }
}

module "delete_category_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-delete-category-handler-${var.stage}"
  handler        = "handler.deleteCategoryHandler"
  memory_size    = 128
  runtime        = "nodejs12.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = {
    CUSTOM_CATEGORIES_TABLE = module.categories_table.dynamodb_name
  }
}

### CATEGORIES END


### ASSETS START
# ASSETS ENDPOINTS

module "fetch_category_assets_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "fetch-assets"
  http_method                     = "GET"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.fetch_category_assets_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}


module "create_asset_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "create-asset"
  http_method                     = "POST"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.create_category_asset_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "update_asset_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "update-asset"
  http_method                     = "POST"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.update_category_asset_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "delete_asset_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "delete-asset"
  http_method                     = "DELETE"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.delete_category_asset_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

# ASSETS LAMBDAS
module "fetch_category_assets_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-fetch-category-assets-handler-${var.stage}"
  handler        = "handler.fetchCategoryAssetsHandler"
  memory_size    = 128
  runtime        = "nodejs12.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = {
    CUSTOM_CATEGORIES_TABLE = module.categories_table.dynamodb_name
  }
}

module "create_category_asset_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-create-category-asset-handler-${var.stage}"
  handler        = "handler.createCategoryAssetHandler"
  memory_size    = 128
  runtime        = "nodejs12.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = {
    CUSTOM_CATEGORIES_TABLE = module.categories_table.dynamodb_name
  }
}

module "update_category_asset_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-update-category-asset-handler-${var.stage}"
  handler        = "handler.updateCategoryAssetHandler"
  memory_size    = 128
  runtime        = "nodejs12.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = {
    CUSTOM_CATEGORIES_TABLE = module.categories_table.dynamodb_name
  }
}

module "delete_category_asset_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-delete-category-asset-handler-${var.stage}"
  handler        = "handler.deleteCategoryAssetHandler"
  memory_size    = 128
  runtime        = "nodejs12.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = {
    CUSTOM_CATEGORIES_TABLE = module.categories_table.dynamodb_name
  }
}
### ASSETS END


module "api_gateway_deployment" {
  source      = "../../../../../terraform-common/modules/api_deployment"
  rest_api_id = var.rest_api_id
  stage       = var.stage

  endpoints = [
    module.get_custom_categories_endpoint.integration_id,
    module.create_category_endpoint.integration_id,
    module.update_custom_category_endpoint.integration_id,
    module.delete_custom_category_endpoint.integration_id,

    module.fetch_category_assets_endpoint.integration_id,
    module.create_asset_endpoint.integration_id,
    module.update_asset_endpoint.integration_id,
    module.delete_asset_endpoint.integration_id
  ]
}

module "categories_table" {
  source          = "../../../../../terraform-common/modules/dynamodb"
  table_name      = "CustomCategory-${var.stage}"
  partition_key   = "UserId"
  sort_key        = "CategoryUid"
  attributes = [
    {
      name : "UserId"
      type : "S"
    },
    {
      name : "CategoryUid"
      type : "S"
    }
  ]
}

resource "aws_iam_policy" "allow_dynamo_policy" {
  name_prefix = "${var.service_prefix}-${var.stage}"
  policy = templatefile("../../../terraform-common/templates/dynamodb-read-write-policy.tpl", {
    resources = [module.categories_table.dynamodb_arn]
  })
}
