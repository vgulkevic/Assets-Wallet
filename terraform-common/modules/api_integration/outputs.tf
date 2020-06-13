output "http_method" {
  value = aws_api_gateway_method.method.http_method
}

output "resource_path" {
  value = aws_api_gateway_resource.child_resource.path
}

# hack to work around 'aws_api_gateway_deployment' dependency
# on at least one 'aws_api_gateway_integration'
output "integration_id" {
  value = aws_api_gateway_integration.integration.id
}
