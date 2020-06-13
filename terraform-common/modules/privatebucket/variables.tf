variable "bucket_name" {
  type = string
}

variable "tags" {
  default = {}
}

variable "enable_versioning" {
  type    = bool
  default = true
}
