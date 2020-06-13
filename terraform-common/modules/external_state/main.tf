
variable "state_prefix" {
  type = string
  description = "the S3 remote state bucket prefix. All buckets within 'management' follow conventional naming pattern"
}

variable "aws_region" {
  type = string
}

variable "stage" {
  type = string
}

variable "key" {
  type = string
  default = "global/s3/terraform.tfstate"
  description = "allows to override conventional key names for backwards compatibility"
}

# use shared outputs from external terraform stack
output "external_outputs" {
  value = data.terraform_remote_state.core.outputs
}

data "terraform_remote_state" "core" {
  backend = "s3"
  config = {
    bucket = "${var.state_prefix}-terraform-remote-state-${var.stage}"
    key    = var.key
    region = var.aws_region
  }
}
