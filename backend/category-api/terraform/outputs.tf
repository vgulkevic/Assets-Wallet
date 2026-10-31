output "api_url" {
  value = "${module.api_gateway_deployment.invoke_url}/"
}

output "user_pool_id" {
  value = module.cognito_user_pool.pool_id
}

output "user_pool_client_id" {
  value = module.cognito_user_pool.client_id
}

output "frontend_bucket" {
  value = module.frontend_deploy.bucket_name
}

output "cloudfront_distribution_id" {
  value = module.frontend_deploy.distribution_id
}

output "frontend_url" {
  value = "https://${module.frontend_deploy.domain_name}"
}

output "fx_api_key_parameter" {
  value = module.currency_rates_api.fx_api_key_parameter
}
