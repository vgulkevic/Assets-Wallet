variable "table_name" {
  type = string
}

variable "partition_key" {
  type        = string
  description = "aka primary key aka id"
}

variable "sort_key" {
  type    = string
  default = null
}

variable "attributes" {
  type = list(object({
    name : string
    type : string
  }))
  description = "list of attributes"
}

variable "local_indexes" {
  type = list(object({
    name : string
    range_key : string
    projection_type : string
    non_key_attributes : list(string)
  }))
  default     = []
  description = "list of local indexes"

  # see docs for argument reference
  # https://www.terraform.io/docs/providers/aws/r/dynamodb_table.html#local_secondary_index-1
}

variable "global_indexes" {
  type = list(object({
    name : string
    hash_key : string
    range_key : string
    projection_type : string
    non_key_attributes : list(string)
  }))
  default     = []
  description = "list of global indexes"

  # see docs for argument reference
  # https://www.terraform.io/docs/providers/aws/r/dynamodb_table.html#global_secondary_index-1
}