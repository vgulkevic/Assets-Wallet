# Assets Wallet

If you keep your money in several banks, exchanges and in cash, tracking your balances and converting them to different currencies is a pain. You either log in to every system each time you want to know how much you have, or keep an Excel spreadsheet or a note.

This app lets you track the value of your holdings in different currencies in one place.

## Features

- **Categories and assets:** group your assets into categories, then add, edit or remove them.
- **Two currencies:** totals are shown in your main and secondary currency (GBP, USD or EUR), using daily ECB reference rates from [Frankfurter](https://frankfurter.dev). No API key is needed.
- **Net worth history:** a chart of your total over 1 year, 3 years or all time, in your main currency. A snapshot is saved every night, and older history can be imported (see [Importing history](#importing-history)).
- **Allocation:** a donut chart of your assets by category or by currency.
- **Asset history:** every change to an asset is recorded. Each asset has its own History tab with a chart and a list of its changes. You can exclude a wrong change: it stays in the list but no longer counts in the chart.
- **"Updated" labels:** each asset shows when it was last updated. It turns amber when the value hasn't been updated for 90 days.
- **Ordering:** drag and drop categories and assets into your own order.
- **Show/hide balances:** hide the amounts when someone is looking over your shoulder.
- **Light and dark mode**, and a layout that works on mobile.

## Demo
![](asset_manager_demo.gif)

## Architecture

The project consists of two parts:
1. Serverless backend
2. React front end

The serverless backend includes:
- **DynamoDB tables:**
  - `CustomCategory`: categories and their assets
  - `UserProfile`: the selected currencies
  - `AssetHistory`: every asset change
  - `NetWorthHistory`: daily snapshots and imported history
- **Cognito** authentication for the API and the front end
- **API Gateway** endpoints with AWS proxy integration and a Cognito authorizer
- **Lambdas:**
  - one that manages categories, assets, ordering and history in DynamoDB
  - one that manages the user profile
  - one that fetches currency rates
- **EventBridge:** a scheduled Lambda that saves a net worth snapshot every night at 23:30 UTC
- **S3 and CloudFront** (with Origin Access Control) to host the front end

An asset change and its history entry are written in a single DynamoDB transaction, so the history can't miss a change.

The front end is a React 19 app built with Vite, MUI, MUI X Charts, Redux Toolkit Query, dnd-kit and Amplify authentication. It has a login page and a dashboard.

All the services used are eligible for the AWS free tier.

## Getting Started

These instructions will help you deploy your own copy of the infrastructure to AWS.

### Prerequisites

- AWS account
- Terraform >= 1.10
- Node.js >= 22 (the Lambdas run on `nodejs24.x`)
- Java >= 17 (for the Gradle wrapper)
- AWS CLI v2

On macOS:
```
brew install hashicorp/tap/terraform
brew install node awscli
```

### Installing

These steps deploy the serverless infrastructure and a public front end with a login page, then create your Cognito user.

1. **Set up the Terraform state bucket:**
    - In `backend/category-api/terraform/state/variables.tf`, change the default variables (or pass them to `terraform apply` in the next step).
    - From the root of the project, run:
        ```
        cd ./backend/category-api/terraform/state
        terraform init && terraform apply
        ```
      State locking uses S3 lock files, so no DynamoDB table is needed.
2. **Set the properties:** fill in the BACKEND properties and `frontend_bucket_name` in `gradle.properties`, or in `~/.gradle/gradle.properties` to keep them out of git.
3. **Deploy the backend infrastructure:**
    1. Run `./gradlew :backend:category-api:plan`. This packages the Lambdas and the layer and writes `terraform/tfplan`. **Read the plan output** before you continue.
    2. Run `./gradlew :backend:category-api:apply`. This applies exactly that plan.

    The DynamoDB tables and the Cognito user pool have `prevent_destroy` and deletion protection, so a plan that would delete them fails instead.
4. **Deploy the front end:** run `./gradlew :backend:category-api:deployFrontend`. It builds the front end with the API URL and Cognito IDs from the Terraform outputs, uploads it to S3 and invalidates CloudFront.
5. **Create your user** with the AWS CLI:
    ```
    aws cognito-idp --profile <your_profile> admin-create-user --user-pool-id <your_user_pool_id> --username <username> --temporary-password <temp_pass_for_first_login> --message-action SUPPRESS
    ```
6. **Log in:** open the `frontend_url` printed by `terraform output`.

In IntelliJ IDEA, the same Gradle tasks are under `asset_manager > backend > category-api > Tasks > other`.

### Importing history

The nightly snapshot only records history from the day you deploy. To add your earlier totals, write them to a file with one month per line (`month.year - total`):

```
04.2023 - 210500
05.2023 - 214300
```

Then run this from `backend/`:

```
NODE_PATH=js-common/nodejs/node_modules AWS_PROFILE=<your_profile> \
  node scripts/import-history.mjs --stage <stage> --user-id <cognito sub> --net-worth <file> --currency EUR --dry-run
```

- **Dates and currencies:** each line is saved on the last day of its month. It's converted to GBP, USD and EUR using the ECB rate of that day.
- **`--baseline`:** records each asset's current value as its starting value in the asset history. Only assets that don't have a history yet get one.
- **`--dry-run`:** prints what the script would write without writing anything. Remove it to import.
- **Re-running:** the script never overwrites existing entries, so it's safe to run again. The nightly snapshot never replaces an imported entry either.

### Local development

```
cd ./frontend
npm install
npm run start:mock           # no AWS needed: in-memory mock API, any username/password signs in
```

To run against your deployed backend instead:

```
cp .env.example .env.local   # fill in values from `terraform output`
npm start
```

`npm run lint` and `npm run build` are also run by CI (`.github/workflows/ci.yml`), along with Terraform validation and `npm audit`. Dependabot keeps the dependencies up to date.

## Authors

* **Vadim Gulkevic** - Author - [vgulkevic](https://github.com/vgulkevic)
* **Vlad C** - Terraform modules - [vladcar](https://github.com/vladcar)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
