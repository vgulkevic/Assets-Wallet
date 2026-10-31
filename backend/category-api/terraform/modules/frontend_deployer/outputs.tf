output "bucket_name" {
  value = aws_s3_bucket.frontend_bucket.bucket
}

output "distribution_id" {
  value = aws_cloudfront_distribution.s3_distribution.id
}

output "domain_name" {
  value = aws_cloudfront_distribution.s3_distribution.domain_name
}
