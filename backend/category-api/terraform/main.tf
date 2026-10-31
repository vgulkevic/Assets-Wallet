terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.71"
    }
  }

  backend "s3" {}
}

provider "aws" {
  region  = var.aws_region
  profile = var.profile
}

data "aws_caller_identity" "account" {}

module "cognito_user_pool" {
  source = "./modules/auth"
  aws_region = var.aws_region
  stage = var.stage
  service_prefix = "asset-manager"
}

module "javascript_lambda_layer" {
  source         = "./modules/js_lambda_layer"
  service_prefix = "asset-manager"
  stage          = var.stage
  aws_region     = var.aws_region
}

module "category_api" {
  source = "./modules/category-api"
  aws_region = var.aws_region
  stage = var.stage
  service_prefix = "asset-manager"
  layers = [module.javascript_lambda_layer.layer_arn]
  cognito_pool_arn = module.cognito_user_pool.pool_arn
  api_request_validator_id = module.cognito_user_pool.api_request_validator_id
  parent_resource_id = module.cognito_user_pool.parent_resource_id
  rest_api_id = module.cognito_user_pool.rest_api_id
  authorizer_id = module.cognito_user_pool.authorizer_id
}

module "user_profile_api" {
  source = "./modules/user-profile-api"
  aws_region = var.aws_region
  stage = var.stage
  service_prefix = "asset-manager"
  layers = [module.javascript_lambda_layer.layer_arn]
  cognito_pool_arn = module.cognito_user_pool.pool_arn
  api_request_validator_id = module.cognito_user_pool.api_request_validator_id
  parent_resource_id = module.cognito_user_pool.parent_resource_id
  rest_api_id = module.cognito_user_pool.rest_api_id
  authorizer_id = module.cognito_user_pool.authorizer_id
}

module "currency_rates_api" {
  source = "./modules/currency-rates-api"
  aws_region = var.aws_region
  stage = var.stage
  service_prefix = "asset-manager"
  api_request_validator_id = module.cognito_user_pool.api_request_validator_id
  parent_resource_id = module.cognito_user_pool.parent_resource_id
  rest_api_id = module.cognito_user_pool.rest_api_id
  authorizer_id = module.cognito_user_pool.authorizer_id
}

# single deployment + stage for the whole REST API, so every endpoint is in the deployed snapshot
module "api_gateway_deployment" {
  source      = "../../../terraform-common/modules/api_deployment"
  rest_api_id = module.cognito_user_pool.rest_api_id
  stage       = var.stage

  endpoints = concat(
    module.category_api.integration_ids,
    module.user_profile_api.integration_ids,
    module.currency_rates_api.integration_ids
  )
}

module "frontend_deploy" {
  source = "./modules/frontend_deployer"
  aws_region = var.aws_region
  stage = var.stage
  frontend_bucket_name = var.frontend_bucket_name
}
