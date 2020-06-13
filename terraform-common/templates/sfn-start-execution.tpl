${jsonencode(
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1590857617325",
      "Action": [
        "states:StartExecution",
        "states:SendTaskFailure",
        "states:SendTaskSuccess"
      ],
      "Effect": "Allow",
      "Resource": "${res}"
    }
  ]
}
)}
