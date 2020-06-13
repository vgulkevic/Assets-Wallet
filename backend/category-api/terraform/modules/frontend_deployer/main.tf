resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "${var.frontend_bucket_name}-${var.stage}"
  acl = "public-read"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${var.frontend_bucket_name}-${var.stage}/*"
        }
    ]
}
EOF

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

resource "aws_s3_bucket_object" "front_end" {
  for_each = fileset("../../../frontend/build", "**")

  bucket = aws_s3_bucket.frontend_bucket.bucket
  key    = each.value
  source = "../../../frontend/build/${each.value}"

  # ugly hack to make S3 recognise index.html. Without this, content-type is `octet-stream` and index.html is just download instead
  content_type = "text/html"

  etag = filemd5("../../../frontend/build/${each.value}")
}


# AWS Cloudfront for caching
resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_id = "assetManagerFrontend"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "assetManagerFrontend"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
