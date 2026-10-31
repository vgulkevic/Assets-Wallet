module "currency_rates_endpoint" {
  source                          = "../../../../../terraform-common/modules/api_integration"
  service_prefix                  = var.service_prefix
  stage                           = var.stage
  aws_region                      = var.aws_region
  rest_api_id                     = var.rest_api_id
  parent_resource_id              = var.parent_resource_id
  api_path                        = "currency-rates"
  http_method                     = "POST"
  integration_type                = "AWS_PROXY"
  integration_http_method         = "POST"
  lambda_invoke_arn               = module.currency_rates_lambda.lambda_invoke_arn
  enable_async_lambda_integration = false
  validator_id                    = var.api_request_validator_id
  api_key_required                = false
  authorizer_id                   = var.authorizer_id
  authorization_type              = "COGNITO_USER_POOLS"
}

module "currency_rates_lambda" {
  source         = "../../../../../terraform-common/modules/api_gateway_lambda"
  service_prefix = var.service_prefix
  aws_region     = var.aws_region
  stage          = var.stage
  file_name      = "../currency-rates-lambda/function.zip"
  function_name  = "${var.service_prefix}-currency-rates-handler-${var.stage}"
  handler        = "index.handler"
  memory_size    = 128
  runtime        = "nodejs24.x"
  rest_api_id    = var.rest_api_id

  attached_policies = [
    aws_iam_policy.read_fx_api_key_policy.arn
  ]

  env_vars = {
    FX_API_KEY_PARAMETER = local.fx_api_key_parameter
  }
}

# The exchangerate.host API key is kept out of the repo and Terraform state.
# Create it once per stage:
#   aws ssm put-parameter --type SecureString --name /asset-manager/<stage>/fx-api-key --value <key>
locals {
  fx_api_key_parameter = "/${var.service_prefix}/${var.stage}/fx-api-key"
}

data "aws_caller_identity" "account" {}

resource "aws_iam_policy" "read_fx_api_key_policy" {
  name_prefix = "${var.service_prefix}-${var.stage}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameter"]
        Resource = ["arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.account.account_id}:parameter${local.fx_api_key_parameter}"]
      }
    ]
  })
}
