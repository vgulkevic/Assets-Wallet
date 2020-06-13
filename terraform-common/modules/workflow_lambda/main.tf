
data "aws_caller_identity" "identity" {}

module "lambda" {
  source            = "../base_lambda"
  service_prefix    = var.service_prefix
  stage             = var.stage
  aws_region        = var.aws_region
  file_name         = var.file_name
  function_name     = var.function_name
  handler           = var.handler
  memory_size       = var.memory_size
  runtime           = var.runtime
  attached_policies = var.attached_policies
  layers            = var.layers
  env_vars          = var.env_vars
}

#todo permissions