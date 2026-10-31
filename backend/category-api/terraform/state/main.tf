# don't run it unless you setting up terraform state from scratch

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.71"
    }
  }
}

provider "aws" {
  region = var.aws_region
  profile = var.profile
}

resource "aws_s3_bucket" "remote_state_prod" {
  bucket = "${var.bucket_name}${var.stage}"
}

resource "aws_s3_bucket_versioning" "remote_state_prod" {
  bucket = aws_s3_bucket.remote_state_prod.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "remote_state_prod" {
  bucket = aws_s3_bucket.remote_state_prod.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
