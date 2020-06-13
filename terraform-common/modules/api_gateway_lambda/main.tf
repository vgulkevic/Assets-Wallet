
data "aws_caller_identity" "identity" {}

module "lambda" {
  source            = "../base_lambda"
  service_prefix    = var.service_prefix
  stage             = var.stage
  aws_region        = var.aws_region
  file_name         = var.file_name
  function_name     = var.function_name
  handler           = var.handler
  memory_size       = var.memory_size
  runtime           = var.runtime
  attached_policies = var.attached_policies
  layers            = var.layers
  env_vars          = var.env_vars
}

module "api_gateway_permission" {
  source                 = "../apigatewaylambdapermission"
  api_gateway_source_arn = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.identity.account_id}:${var.rest_api_id}/*"
  function_name          = module.lambda.lambda_function_name
}
