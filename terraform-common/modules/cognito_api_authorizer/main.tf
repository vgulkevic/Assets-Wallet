resource "aws_api_gateway_authorizer" "authorizer" {
  name                             = "${var.service_prefix}-gateway-authorizer-${var.stage}"
  rest_api_id                      = var.rest_api_id
  authorizer_credentials           = aws_iam_role.invocation_role.arn
  authorizer_result_ttl_in_seconds = 60 #todo make configurable?
  identity_source                  = "method.request.header.Authorization"
  type                             = "COGNITO_USER_POOLS"
  provider_arns                    = var.user_pool_arns
}

resource "aws_iam_role" "invocation_role" {
  name               = "${var.service_prefix}-api-gateway-auth-invocation-${var.stage}"
  path               = "/"
  assume_role_policy = data.aws_iam_policy_document.api_gateway_role_policy.json
}

data "aws_iam_policy_document" "api_gateway_role_policy" {
  version = "2012-10-17"
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["apigateway.amazonaws.com"]
      type        = "Service"
    }
    effect = "Allow"
  }
}