resource "aws_cognito_user_pool" "pool" {
  name = "asset-manager-userPool-${var.stage}"
  admin_create_user_config {
    allow_admin_create_user_only = true
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name = "asset-manager-userPool-client-${var.stage}"
  user_pool_id = aws_cognito_user_pool.pool.id
}

module "api_gateway" {
  source         = "../../../../../terraform-common/modules/api"
  service_prefix = var.service_prefix
  stage          = var.stage
  aws_region     = var.aws_region
  api_name       = "${var.service_prefix}-custom-category-${var.stage}"
  api_path       = var.service_prefix
}

# cognito authorizer attached to api gateway
module "cognito_authorizer" {
  source         = "../../../../../terraform-common/modules/cognito_api_authorizer"
  aws_region     = var.aws_region
  rest_api_id    = module.api_gateway.rest_api_id
  service_prefix = var.service_prefix
  stage          = var.stage
  user_pool_arns = [aws_cognito_user_pool.pool.arn]
}
