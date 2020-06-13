
module "lambda" {
  source         = "../base_lambda"
  service_prefix = var.service_prefix
  stage          = var.stage
  aws_region     = var.aws_region
  file_name      = var.file_name
  function_name  = var.function_name
  handler        = var.handler
  memory_size    = var.memory_size
  runtime        = var.runtime
  layers         = var.layers
  env_vars       = var.env_vars

  attached_policies = var.attached_policies
}

module "sns_permission" {
  source         = "../sns_lambda_permission"
  function_name  = module.lambda.lambda_function_name
  sns_source_arn = var.sns_topic_arn
}

resource "aws_sns_topic_subscription" "new_prospect_approval_subscription" {
  topic_arn = var.sns_topic_arn
  protocol  = "lambda"
  endpoint  = module.lambda.lambda-arn
}
