resource "aws_lambda_layer_version" "lambda_layer" {
  layer_name          = "${var.service_prefix}-js-common-${var.stage}"
  filename            = "../../js-common/function.zip"
  source_code_hash    = filebase64sha256("../../js-common/function.zip")
  compatible_runtimes = ["nodejs12.x"]
}
