variable "stage" {
  description = "Deployment stage"
}

variable "endpoints" {
  type        = list(string)
  default     = []
  description = "list of dependent endpoint ids"
}

variable "rest_api_id" {
  type = string
}