output "parent_resource_id" {
  value = aws_api_gateway_resource.root_resource.id
}

output "rest_api_id" {
  value = aws_api_gateway_rest_api.api.id
}

output "api_request_validator_id" {
  value = aws_api_gateway_request_validator.validator.id
}