output "bucket_arn" {
  value = aws_s3_bucket.private_bucket.arn
}

output "bucket_name" {
  value = aws_s3_bucket.private_bucket.bucket
}
