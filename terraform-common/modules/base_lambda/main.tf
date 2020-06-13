
resource "aws_lambda_function" "base_lambda" {
  filename         = var.file_name
  function_name    = var.function_name
  source_code_hash = filebase64sha256(var.file_name)
  handler          = var.handler
  role             = aws_iam_role.execution_role.arn
  runtime          = var.runtime
  memory_size      = var.memory_size
  layers           = var.layers

  #todo do we need variables??
  timeout                        = 30
  reserved_concurrent_executions = -1

  environment {
    variables = var.env_vars
  }
}

resource "aws_lambda_function_event_invoke_config" "quote_generator_function_invoke_config" {
  function_name                = aws_lambda_function.base_lambda.function_name
  maximum_event_age_in_seconds = 120
  maximum_retry_attempts       = 0
}

resource "aws_iam_role" "execution_role" {
  name_prefix        = "${var.service_prefix}-${var.stage}"
  assume_role_policy = data.aws_iam_policy_document.base_lambda.json
}

data "aws_iam_policy_document" "base_lambda" {
  version = "2012-10-17"
  statement {
    actions = [
      "sts:AssumeRole"
    ]
    principals {
      identifiers = [
      "lambda.amazonaws.com"]
      type = "Service"
    }
  }
}

resource "aws_iam_role_policy_attachment" "basic_execution_policy_attachment" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.execution_role.name
}

# attaches policies provided in 'var.attached_policies' variable
# to lambda execution role
resource "aws_iam_role_policy_attachment" "policy_attachment" {
  count = length(var.attached_policies)

  policy_arn = var.attached_policies[count.index]
  role       = aws_iam_role.execution_role.name
}
