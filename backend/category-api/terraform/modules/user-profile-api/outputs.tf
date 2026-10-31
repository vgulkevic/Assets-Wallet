output "integration_ids" {
  value = [
    module.get_user_profile_endpoint.integration_id,
    module.update_user_profile.integration_id
  ]
}
