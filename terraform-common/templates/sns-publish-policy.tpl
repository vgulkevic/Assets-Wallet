${jsonencode(
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Action": [
        "sns:Publish"
      ],
      "Effect": "Allow",
      "Resource": [for res in resources : "${res}"]
    }
  ]
}
)}
