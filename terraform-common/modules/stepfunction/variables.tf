variable "aws_region" {
  type    = string
  default = "eu-west-2"
}

variable "stage" {
  default     = "dev"
  description = "Deployment stage"
}

variable "service_prefix" {
  type = string
}

variable "state_machine_name" {
  type = string
}

variable "state_machine_definition" {
  type = string
}

variable "state_machine_vars" {
  type = map(string)
}

variable "controlled_functions" {
  description = "arns of lambda functions participating in this state machine"
  type        = list(string)
}
