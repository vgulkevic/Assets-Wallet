
data "aws_caller_identity" "identity" {}

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

  attached_policies = concat(var.attached_policies, [aws_iam_policy.sqs_policy.arn])
}

resource "aws_lambda_event_source_mapping" "event_source" {
  event_source_arn = var.event_queue_arn
  function_name    = module.lambda.lambda-arn
  batch_size       = 10 # 10 is default but we set it here for clarity
}

resource "aws_iam_policy" "sqs_policy" {
  name_prefix = "${var.service_prefix}-${var.stage}"
  policy      = data.aws_iam_policy_document.sqs_policy_doc.json
}

data "aws_iam_policy_document" "sqs_policy_doc" {
  version = "2012-10-17"
  statement {
    effect = "Allow"
    actions = [
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ReceiveMessage"
    ]
    resources = [
      var.event_queue_arn
    ]
  }
}
