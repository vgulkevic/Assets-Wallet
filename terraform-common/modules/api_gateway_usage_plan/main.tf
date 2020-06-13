#todo review this
resource "aws_api_gateway_usage_plan" "usage_plan" {
  name = var.usage_plan_name

  api_stages {
    api_id = var.rest_api_id
    stage  = var.rest_api_deployment_stage_name
  }

  #todo just in case someone will randomly ddos us
  #todo increase it
  quota_settings {
    limit  = var.quota_limit
    period = var.quota_limit_period
  }
}

resource "aws_api_gateway_api_key" "temp_key" {
  name = var.api_key_name
}

resource "aws_api_gateway_usage_plan_key" "main" {
  key_id        = aws_api_gateway_api_key.temp_key.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.usage_plan.id
}
