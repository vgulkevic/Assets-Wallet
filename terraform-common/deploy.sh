#!/usr/bin/env bash
# Usage: deploy.sh -a plan|apply|frontend -p <profile> -b <state bucket> -k <state key> -r <region> -s <stage> -f <frontend bucket name>
#
#   plan      writes terraform/tfplan and prints it. Review it before applying.
#   apply     applies exactly the reviewed terraform/tfplan (never re-plans).
#   frontend  builds the frontend with config taken from terraform outputs, syncs it to S3 and invalidates CloudFront.
set -euo pipefail

while getopts "a:p:b:k:r:s:f:" option; do
  case "${option}" in
  a) ACTION=${OPTARG} ;;
  p) PROFILE=${OPTARG} ;;
  b) BUCKET=${OPTARG} ;;
  k) KEY=${OPTARG} ;;
  r) REGION=${OPTARG} ;;
  s) STAGE=${OPTARG} ;;
  f) FRONT_END_BUCKET_NAME=${OPTARG} ;;
  *)
    echo "usage: $0 -a plan|apply|frontend -p profile -b bucket -k key -r region -s stage -f frontend_bucket_name" >&2
    exit 1
    ;;
  esac
done

export AWS_PROFILE="$PROFILE" AWS_REGION="$REGION" AWS_PAGER=""
FRONTEND_DIR="$(cd "$(dirname "$0")/../frontend" && pwd)"

echo "Action: $ACTION | Profile: $PROFILE | Region: $REGION | Stage: $STAGE"
echo "State: s3://$BUCKET/$KEY"

cd ./terraform

tf_init() {
  terraform init -input=false -reconfigure \
    -backend-config="bucket=$BUCKET" \
    -backend-config="key=$KEY" \
    -backend-config="region=$REGION" \
    -backend-config="use_lockfile=true" \
    -backend-config="encrypt=true" \
    -backend-config="profile=$PROFILE"
}

case "$ACTION" in
plan)
  if ! tf_init; then
    # state written by Terraform 0.12 uses a legacy provider address; upgrade it once and retry
    # (the lock file has to be out of the way: init can't install providers until the state is fixed)
    echo "Upgrading legacy provider address in state (one-time)..."
    mv .terraform.lock.hcl .terraform.lock.hcl.bak
    terraform state replace-provider -auto-approve registry.terraform.io/-/aws registry.terraform.io/hashicorp/aws \
      || { mv .terraform.lock.hcl.bak .terraform.lock.hcl; exit 1; }
    mv .terraform.lock.hcl.bak .terraform.lock.hcl
    tf_init
  fi

  PARAM=$(terraform output -raw fx_api_key_parameter 2>/dev/null || echo "/asset-manager/$STAGE/fx-api-key")
  if ! aws ssm get-parameter --name "$PARAM" --query Parameter.Name --output text >/dev/null 2>&1; then
    echo "WARNING: SSM parameter $PARAM is missing; currency rates will fail until you create it:" >&2
    echo "  aws ssm put-parameter --profile $PROFILE --region $REGION --type SecureString --name $PARAM --value <exchangerate.host key>" >&2
  fi

  terraform plan -input=false -out=tfplan \
    -var "frontend_bucket_name=$FRONT_END_BUCKET_NAME" -var "profile=$PROFILE" -var "stage=$STAGE" -var "aws_region=$REGION"
  echo
  echo "Review the plan above. If it is what you expect, run the 'apply' task."
  ;;
apply)
  if [ ! -f tfplan ]; then
    echo "No terraform/tfplan found. Run the 'plan' task first." >&2
    exit 1
  fi
  tf_init
  terraform apply -input=false tfplan
  rm -f tfplan
  ;;
frontend)
  tf_init >/dev/null
  BUCKET_NAME=$(terraform output -raw frontend_bucket)
  DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
  export VITE_API_URL VITE_USER_POOL_ID VITE_USER_POOL_CLIENT_ID VITE_REGION="$REGION" VITE_STAGE="$STAGE"
  VITE_API_URL=$(terraform output -raw api_url)
  VITE_USER_POOL_ID=$(terraform output -raw user_pool_id)
  VITE_USER_POOL_CLIENT_ID=$(terraform output -raw user_pool_client_id)

  (cd "$FRONTEND_DIR" && npm ci && npm run build)

  # hashed assets can be cached forever; index.html must always be revalidated
  aws s3 sync "$FRONTEND_DIR/build" "s3://$BUCKET_NAME" --delete --exclude index.html --cache-control "public, max-age=31536000, immutable"
  aws s3 cp "$FRONTEND_DIR/build/index.html" "s3://$BUCKET_NAME/index.html" --cache-control "no-cache"
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" --query Invalidation.Id --output text
  echo "Frontend deployed: $(terraform output -raw frontend_url)"
  ;;
*)
  echo "Unknown action '$ACTION' (expected plan, apply or frontend)" >&2
  exit 1
  ;;
esac
