variable "stage" {
  description = "Deployment stage"
}

variable "aws_region" {
}

variable "service_prefix" {
  type = string
}

variable "api_name" {
  type = string
}

variable "api_path" {
  description = "root resource path"
  type        = string
}