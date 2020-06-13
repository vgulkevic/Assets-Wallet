variable "function_name" {
  type        = string
  description = "name of the function invoked by api gateway"
}

variable "api_gateway_source_arn" {
  type        = string
  description = "api gateway allowed to invoke this lambda"
}