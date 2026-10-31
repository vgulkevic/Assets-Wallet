output "integration_ids" {
  value = [
    module.get_custom_categories_endpoint.integration_id,
    module.create_category_endpoint.integration_id,
    module.update_custom_category_endpoint.integration_id,
    module.delete_custom_category_endpoint.integration_id,
    module.create_asset_endpoint.integration_id,
    module.update_asset_endpoint.integration_id,
    module.delete_asset_endpoint.integration_id,
    module.asset_history_endpoint.integration_id,
    module.set_asset_change_excluded_endpoint.integration_id,
    module.reorder_categories_endpoint.integration_id,
    module.reorder_assets_endpoint.integration_id,
    module.net_worth_history_endpoint.integration_id
  ]
}
