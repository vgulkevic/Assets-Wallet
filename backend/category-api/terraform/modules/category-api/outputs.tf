output "integration_ids" {
  value = [
    module.get_custom_categories_endpoint.integration_id,
    module.create_category_endpoint.integration_id,
    module.update_custom_category_endpoint.integration_id,
    module.delete_custom_category_endpoint.integration_id,
    module.create_asset_endpoint.integration_id,
    module.update_asset_endpoint.integration_id,
    module.delete_asset_endpoint.integration_id
  ]
}
