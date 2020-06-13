variable "usage_plan_name" {
  type = string
}

variable "rest_api_id" {
  type = string
}

variable "rest_api_deployment_stage_name" {
  type = string
}

variable "api_key_name" {
  type = string
}

variable "quota_limit" {
  type = number
}

variable "quota_limit_period" {
  type        = string
  description = "e.g WEEK or DAY"
}