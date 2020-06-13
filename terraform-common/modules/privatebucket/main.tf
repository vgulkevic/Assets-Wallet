resource "aws_s3_bucket" "private_bucket" {
  bucket = var.bucket_name
  acl    = "private"
  tags   = var.tags

  versioning {
    enabled = var.enable_versioning
  }
}

# Make S3 bucket fully private
resource "aws_s3_bucket_public_access_block" "s3_block_public_access" {
  bucket                  = aws_s3_bucket.private_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  restrict_public_buckets = true
  ignore_public_acls      = true
}