variable "function_name" {
  type        = string
  description = "name of the function invoked by api gateway"
}

variable "cloudwatch_source_arn" {
  type        = string
  description = "cloudwatch event allowed to invoke this lambda"
}