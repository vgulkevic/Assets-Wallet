output "integration_ids" {
  value = [
    module.currency_rates_endpoint.integration_id
  ]
}

output "fx_api_key_parameter" {
  value = local.fx_api_key_parameter
}
