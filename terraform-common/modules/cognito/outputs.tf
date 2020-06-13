output "pool_id" {
  value = aws_cognito_user_pool.pool.id
}

output "pool_arn" {
  value = aws_cognito_user_pool.pool.arn
}

output "authorization_scopes" {
  value = aws_cognito_resource_server.resource.scope_identifiers
}