variable "stage" {
  description = "Deployment stage"
}

variable "aws_region" {
}

variable "service_prefix" {
  type = string
}

variable "rest_api_id" {
  type        = string
  description = "id of the root rest api"
}

variable "user_pool_arns" {
  type = list(string)
}