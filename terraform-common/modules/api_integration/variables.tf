variable "stage" {
  description = "Deployment stage"
}

variable "aws_region" {
}

variable "service_prefix" {
  type = string
}

variable "api_path" {
  type = string
}

variable "rest_api_id" {
  type        = string
  description = "id of the root rest api"
}

variable "parent_resource_id" {
  type        = string
  description = "id of the parent resource - e.g /parent/thisresource"
}

variable "http_method" {
  type = string
}

variable "validator_id" {
  type = string
}

variable "api_gateway_deployment_vars" {
  default = {}
}

variable "api_key_required" {
  type    = bool
  default = false
}

# integration

variable "integration_http_method" {
  type    = string
  default = "POST"
}

variable "integration_type" {
  type    = string
  default = "AWS_PROXY"
}

variable "lambda_invoke_arn" {
  type        = string
  description = "MUST be INVOKE arn, not just arn"
}

variable "request_parameters" {
  type        = map(string)
  description = "aws_api_gateway_integration request parameters - configures parameters passed to integration e.g X-Amz-Invocation-Type heder automatically passed to lambda function"
  default     = {}
}

variable "mapping_templates" {
  type        = map(string)
  default     = null
  description = "Mapping templates"
}

variable "passthrough_behavior" {
  type    = string
  default = null
}

variable "enable_async_lambda_integration" {
  type        = bool
  default     = false
  description = "Adds default 'aws_api_gateway_method_response' and 'aws_api_gateway_integration_response' to automatically respond with 202 after forwarding request to lambda. Requires 'integration_type' to be set to 'AWS'"
}

variable "async_response_status_code" {
  type        = string
  default     = "202"
  description = "Success response status code to use when async integration is enabled"
}

variable "request_model" {
  type        = map(string)
  default     = {}
  description = "Enables automatic request body validation, see examples in intuit-service/terraform for syntax"
}

# authrorizer
variable "authorizer_id" {
  default = null
  type    = string
}

variable "authorization_scopes" {
  type    = list(string)
  default = null
}

variable "authorization_type" {
  type        = string
  default     = "NONE"
  description = "COGNITO_USER_POOLS or CUSTOM"
}
