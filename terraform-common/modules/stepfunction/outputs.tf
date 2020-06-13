output "state_machine_arn" {
  value = aws_sfn_state_machine.sfn_state_machine.id
}