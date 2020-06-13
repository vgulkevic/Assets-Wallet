variable "aws_region" {
  type = string
}

variable "stage" {
  type = string
}

variable "service_prefix" {
  type = string
}

variable "layers" {
  type        = list(string)
  description = "Lambda layer ARNs"
}

variable "cognito_pool_arn" {
  type = string
}

variable "rest_api_id" {
  type = string
}

variable "parent_resource_id" {
  type = string
}

variable "api_request_validator_id" {
  type = string
}

variable "authorizer_id" {
  type = string
}