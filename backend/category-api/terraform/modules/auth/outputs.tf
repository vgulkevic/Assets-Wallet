output "pool_id" {
  value = aws_cognito_user_pool.pool.id
}

output "pool_arn" {
  value = aws_cognito_user_pool.pool.arn
}

output "rest_api_id" {
  value = module.api_gateway.rest_api_id
}

output "parent_resource_id" {
  value = module.api_gateway.parent_resource_id
}

output "api_request_validator_id" {
  value = module.api_gateway.api_request_validator_id
}

output "authorizer_id" {
  value = module.cognito_authorizer.authorizer_id
}
