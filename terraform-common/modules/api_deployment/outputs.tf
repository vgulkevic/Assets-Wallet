output "deployment_stage_name" {
  value = aws_api_gateway_stage.stage.stage_name
}

output "invoke_url" {
  value = aws_api_gateway_stage.stage.invoke_url
}
