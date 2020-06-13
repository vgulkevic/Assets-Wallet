#todo refactor and generify all IAM stuff in this module

resource "aws_sfn_state_machine" "sfn_state_machine" {
  name       = var.state_machine_name
  role_arn   = aws_iam_role.sfn-exec.arn
  definition = templatefile(var.state_machine_definition, var.state_machine_vars)
}

resource "aws_iam_role" "sfn-exec" {
  name               = "${var.service_prefix}-sfn-exec-${var.stage}"
  assume_role_policy = data.aws_iam_policy_document.sfn-assume-role.json
}

resource "aws_iam_policy" "lambda-invoke" {
  name   = "lambda-invoke"
  policy = data.aws_iam_policy_document.lambda-invoke.json
}

resource "aws_iam_role_policy_attachment" "lambda-invoke" {
  role       = aws_iam_role.sfn-exec.name
  policy_arn = aws_iam_policy.lambda-invoke.arn
}

data "aws_iam_policy_document" "sfn-assume-role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["states.${var.aws_region}.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "lambda-invoke" {
  statement {
    actions = [
      "lambda:InvokeFunction"
    ]
    resources = var.controlled_functions
  }
}


resource "aws_iam_policy" "sns_publish_policy" {
  policy = data.aws_iam_policy_document.sns_publish.json
}

data "aws_iam_policy_document" "sns_publish" {
  statement {
    actions = [
      "sns:Publish"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy_attachment" "sns_publish_attachment" {
  policy_arn = aws_iam_policy.sns_publish_policy.arn
  role       = aws_iam_role.sfn-exec.name
}
