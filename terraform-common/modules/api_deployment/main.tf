resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = var.rest_api_id

  # redeploy whenever the set of endpoints changes
  triggers = {
    redeployment = sha1(join(",", var.endpoints))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "stage" {
  rest_api_id   = var.rest_api_id
  stage_name    = var.stage
  deployment_id = aws_api_gateway_deployment.deployment.id
}
