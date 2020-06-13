resource "aws_api_gateway_model" "model" {
  content_type = "application/json"
  name         = var.model_name
  rest_api_id  = var.rest_api_id
  schema       = templatefile(var.json_schema, {})
}
