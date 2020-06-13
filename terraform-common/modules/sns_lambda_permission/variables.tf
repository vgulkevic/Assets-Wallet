variable "function_name" {
  type        = string
  description = "name of the function invoked by sns"
}

variable "sns_source_arn" {
  type        = string
  description = "sns topic allowed to invoke this lambda"
}