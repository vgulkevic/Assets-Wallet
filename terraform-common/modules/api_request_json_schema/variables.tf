variable "model_name" {
  type = string
}

variable "rest_api_id" {
  type        = string
  description = "API gateway REST API id"
}

variable "json_schema" {
  type        = string
  description = "path to json file with schema"
}
