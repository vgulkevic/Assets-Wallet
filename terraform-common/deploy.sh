#!/usr/bin/env sh

while getopts "p:b:k:r:d:s:f": option; do
  case "${option}" in

  p) PROFILE=${OPTARG} ;;
  b) BUCKET=${OPTARG} ;;
  k) KEY=${OPTARG} ;;
  r) REGION=${OPTARG} ;;
  d) DYNAMODB=${OPTARG} ;;
  s) STAGE=${OPTARG} ;;
  f) FRONT_END_BUCKET_NAME=${OPTARG} ;;
  *)
    echo "usage: $0 [-v] [-r]" >&2
    exit 1
    ;;
  esac
done

echo "Terraform backend:"
echo "Profile: $PROFILE"
echo "S3 Bucket: $BUCKET"
echo "S3 Key: $KEY"
echo "AWS Region: $REGION"
echo "Lock table: $DYNAMODB"
echo "Deployment stage: $STAGE"
echo "Frontend bucket name: $FRONT_END_BUCKET_NAME"

cd ./terraform || exit
AWS_SDK_LOAD_CONFIG=1 AWS_PROFILE=$PROFILE terraform init \
  -backend-config="bucket=$BUCKET" \
  -backend-config="key=$KEY" \
  -backend-config="region=$REGION" \
  -backend-config="dynamodb_table=$DYNAMODB" \
  -backend-config="encrypt=true" \
  -backend-config="profile=$PROFILE"
AWS_SDK_LOAD_CONFIG=1  AWS_PROFILE="$PROFILE" terraform apply -auto-approve -var "frontend_bucket_name=$FRONT_END_BUCKET_NAME" -var "profile=$PROFILE" -var "stage=$STAGE" -var "aws_region=$REGION"
