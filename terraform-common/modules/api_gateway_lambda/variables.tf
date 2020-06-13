variable "stage" {
  type        = string
  description = "Deployment stage"
}

variable "aws_region" {
  type = string
}

variable "service_prefix" {
  type = string
}

variable "env_vars" {
  default = {}
}

variable "file_name" {
  type = string
}

variable "function_name" {
  type = string
}

variable "handler" {
  type = string
}

variable "runtime" {
  type = string
}

variable "memory_size" {
  type = number
}

variable "rest_api_id" {
  type = string
}

variable "attached_policies" {
  type        = list(string)
  description = "A list of IAM policy ARNs. Will be attached to execution role"
}

variable "layers" {
  type        = list(string)
  default     = []
  description = "Lambda layer ARNs"
}
