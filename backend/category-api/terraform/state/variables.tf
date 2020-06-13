variable "stage" {
  default = "prod"
}

variable "aws_region" {
  default = "eu-west-2"
}

variable "profile" {
  default = "private"
}

variable "bucket_name" {
  default = "asset-manager-terraform-remotestate-"
}

variable "lock_table_table" {
  default = "asset-manager-terraform-locks-"
}