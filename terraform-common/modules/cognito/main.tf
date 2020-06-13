resource "aws_cognito_user_pool" "pool" {
  name = "${var.service_prefix}-userPool-${var.stage}"
  admin_create_user_config {
    allow_admin_create_user_only = true
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name                                 = "${var.service_prefix}-userPool-client-${var.stage}"
  user_pool_id                         = aws_cognito_user_pool.pool.id
  generate_secret                      = true
  explicit_auth_flows                  = ["ADMIN_NO_SRP_AUTH"] #todo unhardcode
  allowed_oauth_flows                  = ["client_credentials"] #todo unhardcode
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = aws_cognito_resource_server.resource.scope_identifiers
  supported_identity_providers         = ["COGNITO"] #todo unhardcode
}

resource "aws_cognito_resource_server" "resource" {
  identifier   = "${var.service_prefix}-resource-server-${var.stage}"
  name         = "${var.service_prefix}-resource-server-${var.stage}"
  user_pool_id = aws_cognito_user_pool.pool.id

  scope {
    scope_name        = "api_access"
    scope_description = "Grants full access"
  }
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.service_prefix}-domain-${var.stage}"
  user_pool_id = aws_cognito_user_pool.pool.id
}