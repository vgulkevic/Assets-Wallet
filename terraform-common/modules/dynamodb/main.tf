#####################################################
########### Basic 'PAY_PER_REQUEST' dynamodb table ##
#####################################################

resource "aws_dynamodb_table" "dynamodb-table" {
  name         = var.table_name
  hash_key     = var.partition_key
  range_key    = var.sort_key
  billing_mode = "PAY_PER_REQUEST"

  dynamic "attribute" {
    for_each = var.attributes

    content {
      name = attribute.value.name
      type = attribute.value.type
    }
  }

  dynamic "local_secondary_index" {
    for_each = var.local_indexes

    content {
      name               = local_secondary_index.value.name
      range_key          = local_secondary_index.value.range_key
      projection_type    = local_secondary_index.value.projection_type
      non_key_attributes = local_secondary_index.value.non_key_attributes
    }
  }

  dynamic "global_secondary_index" {
    for_each = var.global_indexes

    content {
      name               = global_secondary_index.value.name
      hash_key           = global_secondary_index.value.hash_key
      range_key          = global_secondary_index.value.range_key
      projection_type    = global_secondary_index.value.projection_type
      non_key_attributes = global_secondary_index.value.non_key_attributes
    }
  }
}
