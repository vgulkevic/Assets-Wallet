output "dynamodb_arn" {
  value = aws_dynamodb_table.dynamodb-table.arn
}

output "dynamodb_name" {
  value = aws_dynamodb_table.dynamodb-table.name
}

output "dynamodb_id" {
  value = aws_dynamodb_table.dynamodb-table.id
}
