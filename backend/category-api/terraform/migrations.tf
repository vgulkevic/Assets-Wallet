# One-time migration of the existing `prod` stack from Terraform 0.12 / AWS provider 2.x.
# Safe to keep: import/removed blocks are no-ops once applied. The IDs below are prod-only,
# so delete this file before deploying a brand new stage.

# API Gateway deployments used to own the stage via `stage_name` (removed in provider v6).
# Forget them instead of deleting; the stage now lives in module.api_gateway_deployment.
removed {
  from = module.category_api.module.api_gateway_deployment.aws_api_gateway_deployment.deployment
  lifecycle {
    destroy = false
  }
}

removed {
  from = module.user_profile_api.module.api_gateway_deployment.aws_api_gateway_deployment.deployment
  lifecycle {
    destroy = false
  }
}

import {
  to = module.api_gateway_deployment.aws_api_gateway_stage.stage
  id = "798ohpokhl/prod"
}

# Frontend files are now uploaded by deploy.sh (aws s3 sync); stop tracking them without deleting.
removed {
  from = module.frontend_deploy.aws_s3_bucket_object.front_end
  lifecycle {
    destroy = false
  }
}

# /asset-manager/currency-rates was created in the console in Oct 2023
import {
  to = module.currency_rates_api.module.currency_rates_endpoint.aws_api_gateway_resource.child_resource
  id = "798ohpokhl/nbbb1d"
}

import {
  to = module.currency_rates_api.module.currency_rates_endpoint.aws_api_gateway_method.method
  id = "798ohpokhl/nbbb1d/POST"
}

import {
  to = module.currency_rates_api.module.currency_rates_endpoint.aws_api_gateway_integration.integration
  id = "798ohpokhl/nbbb1d/POST"
}

import {
  to = module.currency_rates_api.module.currency_rates_endpoint.aws_api_gateway_method.options_method
  id = "798ohpokhl/nbbb1d/OPTIONS"
}

import {
  to = module.currency_rates_api.module.currency_rates_endpoint.aws_api_gateway_integration.options_integration
  id = "798ohpokhl/nbbb1d/OPTIONS"
}

import {
  to = module.currency_rates_api.module.currency_rates_endpoint.aws_api_gateway_method_response.options_200
  id = "798ohpokhl/nbbb1d/OPTIONS/200"
}
