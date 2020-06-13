output "lambda-arn" {
  value = aws_lambda_function.base_lambda.arn
}

output "lambda_invoke_arn" {
  value = aws_lambda_function.base_lambda.invoke_arn
}

output "lambda_function_name" {
  value = aws_lambda_function.base_lambda.function_name
}