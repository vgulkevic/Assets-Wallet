locals {
  lambda_env = {
    CUSTOM_CATEGORIES_TABLE = module.categories_table.dynamodb_name
    ASSET_HISTORY_TABLE     = module.asset_history_table.dynamodb_name
    NET_WORTH_TABLE         = module.net_worth_table.dynamodb_name
  }
}

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
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
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
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
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
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
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
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
}

### CATEGORIES END

### ASSETS START
# ASSETS ENDPOINTS

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

module "create_category_asset_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-create-category-asset-handler-${var.stage}"
  handler        = "handler.createCategoryAssetHandler"
  memory_size    = 128
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
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
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
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
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
}
### ASSETS END

### HISTORY AND ORDERING START

module "asset_history_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "asset-history"
  http_method                     = "GET"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.get_asset_history_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "get_asset_history_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-get-asset-history-handler-${var.stage}"
  handler        = "handler.getAssetHistoryHandler"
  memory_size    = 128
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
}

module "set_asset_change_excluded_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "set-asset-change-excluded"
  http_method                     = "POST"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.set_asset_change_excluded_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "set_asset_change_excluded_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-set-asset-change-excluded-handler-${var.stage}"
  handler        = "handler.setAssetChangeExcludedHandler"
  memory_size    = 128
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
}

module "reorder_categories_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "reorder-categories"
  http_method                     = "POST"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.reorder_categories_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "reorder_categories_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-reorder-categories-handler-${var.stage}"
  handler        = "handler.reorderCategoriesHandler"
  memory_size    = 128
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
}

module "reorder_assets_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "reorder-assets"
  http_method                     = "POST"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.reorder_assets_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "reorder_assets_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-reorder-assets-handler-${var.stage}"
  handler        = "handler.reorderAssetsHandler"
  memory_size    = 128
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
}

module "net_worth_history_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "net-worth-history"
  http_method                     = "GET"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.get_net_worth_history_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "get_net_worth_history_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-get-net-worth-history-handler-${var.stage}"
  handler        = "handler.getNetWorthHistoryHandler"
  memory_size    = 128
  runtime        = "nodejs24.x"
  layers         = var.layers
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
}

# Saves every user's net worth once a day
module "snapshot_net_worth_lambda" {
  source         = "../../../../../terraform-common/modules/base_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../category-persistence-lambda/function.zip"
  function_name  = "${var.service_prefix}-snapshot-net-worth-${var.stage}"
  handler        = "handler.snapshotNetWorthHandler"
  memory_size    = 256
  runtime        = "nodejs24.x"
  layers         = var.layers

  attached_policies = [
    aws_iam_policy.allow_dynamo_policy.arn
  ]

  env_vars = local.lambda_env
}

resource "aws_cloudwatch_event_rule" "nightly_net_worth_snapshot" {
  name                = "${var.service_prefix}-nightly-net-worth-snapshot-${var.stage}"
  description         = "Daily net worth snapshot"
  schedule_expression = "cron(30 23 * * ? *)"
}

resource "aws_cloudwatch_event_target" "nightly_net_worth_snapshot" {
  rule = aws_cloudwatch_event_rule.nightly_net_worth_snapshot.name
  arn  = module.snapshot_net_worth_lambda.lambda-arn
}

resource "aws_lambda_permission" "allow_nightly_net_worth_snapshot" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = module.snapshot_net_worth_lambda.lambda_function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.nightly_net_worth_snapshot.arn
}

module "asset_history_table" {
  source        = "../../../../../terraform-common/modules/dynamodb"
  table_name    = "AssetHistory-${var.stage}"
  partition_key = "UserId"
  sort_key      = "ChangeId"
  attributes = [
    {
      name : "UserId"
      type : "S"
    },
    {
      name : "ChangeId"
      type : "S"
    }
  ]
}

module "net_worth_table" {
  source        = "../../../../../terraform-common/modules/dynamodb"
  table_name    = "NetWorthHistory-${var.stage}"
  partition_key = "UserId"
  sort_key      = "SnapshotDate"
  attributes = [
    {
      name : "UserId"
      type : "S"
    },
    {
      name : "SnapshotDate"
      type : "S"
    }
  ]
}
### HISTORY AND ORDERING END

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
    resources = [module.categories_table.dynamodb_arn, module.asset_history_table.dynamodb_arn, module.net_worth_table.dynamodb_arn]
  })
}
