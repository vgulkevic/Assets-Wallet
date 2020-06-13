resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = var.rest_api_id
  stage_name  = var.stage

  # hack
  # todo doesn't work properly on consecutive deployments
  triggers = {
    redeployment = sha1(join(",", var.endpoints))
  }

  # hack
  #  depends_on = var.endpoints

  # some hacks
  lifecycle {
    create_before_destroy = true
  }
}