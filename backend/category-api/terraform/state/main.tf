# don't run it unless you setting up terraform state from scratch

provider "aws" {
  region = var.aws_region
  profile = var.profile
}

resource "aws_s3_bucket" "remote_state_prod" {
  bucket = "${var.bucket_name}${var.stage}"
  versioning {
    enabled = true
  }
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "${var.lock_table_table}${var.stage}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}
