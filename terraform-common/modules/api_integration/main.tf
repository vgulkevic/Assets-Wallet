
locals {
  # add 'X-Amz-Invocation-Type' header if 'enable_async_lambda_integration' variable is set to true
  # to enable default async lambda integration.
  # Use value passed into module otherwise
  integration_request_parameters = (var.enable_async_lambda_integration
    ? merge(var.request_parameters, {
      "integration.request.header.X-Amz-Invocation-Type" = "'Event'"
    })
  : var.request_parameters)
}

resource "aws_api_gateway_resource" "child_resource" {
  parent_id   = var.parent_resource_id
  path_part   = var.api_path
  rest_api_id = var.rest_api_id
}

resource "aws_api_gateway_method" "method" {
  rest_api_id          = var.rest_api_id
  resource_id          = aws_api_gateway_resource.child_resource.id
  http_method          = var.http_method
  authorization        = var.authorization_type
  authorizer_id        = var.authorizer_id
  request_validator_id = var.validator_id
  request_models       = var.request_model
  authorization_scopes = var.authorization_scopes
  api_key_required     = var.api_key_required
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.child_resource.id
  http_method             = aws_api_gateway_method.method.http_method
  integration_http_method = var.integration_http_method
  type                    = var.integration_type
  uri                     = var.lambda_invoke_arn

  # set invocation type header to 'Event' in order to invoke lambda function asynchronously
  request_parameters = local.integration_request_parameters
  request_templates  = var.mapping_templates
}

# OPTIONS CORS
resource "aws_api_gateway_method" "options_method" {
  rest_api_id          = var.rest_api_id
  resource_id          = aws_api_gateway_resource.child_resource.id
  http_method          = "OPTIONS"
  authorization        = "NONE"
}

resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.child_resource.id
  http_method             = aws_api_gateway_method.options_method.http_method
  integration_http_method = var.integration_http_method
  type                    = var.integration_type
  uri                     = var.lambda_invoke_arn
}


resource "aws_api_gateway_method_response" "options_200" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.child_resource.id
  http_method             = aws_api_gateway_method.options_method.http_method
  status_code             = "200"
  response_models         = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}


# default '202 Accepted' method response. Use for async lambda integration
resource "aws_api_gateway_method_response" "response_202" {
  count = var.enable_async_lambda_integration ? 1 : 0

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.child_resource.id
  http_method = aws_api_gateway_method.method.http_method
  status_code = var.async_response_status_code
}

# default '202 Accepted' integration response. Use for async lambda integration
resource "aws_api_gateway_integration_response" "integration_response" {
  count      = var.enable_async_lambda_integration ? 1 : 0
  depends_on = [aws_api_gateway_integration.integration]

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.child_resource.id
  http_method = aws_api_gateway_method.method.http_method
  status_code = aws_api_gateway_method_response.response_202[count.index].status_code

  # default selection pattern - more info: https://www.terraform.io/docs/providers/aws/r/api_gateway_integration_response.html#selection_pattern
  selection_pattern = "-"
}
