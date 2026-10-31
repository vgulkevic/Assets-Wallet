# Assets Wallet

If you store your money in multiple banks, BTC exchanges and in cash it is extremely inconvenient to track all your balances and convert them to different currencies. You have to either login into each of the systems every time you want to check how much money you have overall or use Excel spreadsheet/Notepad to track this.

This app allows you track your holdings/assets value in different currencies in a single place.

Group your assets into categories and add, edit or remove them as you like. Totals are shown in your main and secondary currency (GBP, USD or EUR), using daily ECB reference rates from [Frankfurter](https://frankfurter.dev).
   
## Demo
![](asset_manager_demo.gif)

## Getting Started

These instructions will help you deploy your own infrastructure for this project in AWS. All the services used in this project are eligible for 
free tier. 

The project consists of two parts: 
1. Serverless backend
2. React.js front end

Serverless backend includes:
- DynamoDB for storing the data
- Cognito authentication for lambdas and for accessing front-end
- API gateway endpoints with AWS proxy integration and Cognito authoriser
- Lambdas to manage categories and assets in DynamoDB and to fetch currency rates

Front-end
- Two-page React.js app with Amplify authentication: 
    1. Login page 
    2. Categories page
    
Where you can add/edit/delete categories and custom categories assets.

### Prerequisites

- AWS account
- Terraform >= 1.10
- Node.js >= 22 (Lambdas run on `nodejs24.x`)
- Java >= 17 (for the Gradle wrapper)
- AWS CLI v2

Using macOS terminal
```
brew install hashicorp/tap/terraform
brew install node awscli
```

### Installing

Follow the steps to: 
1. Deploy serverless infrastructure
2. Deploy publicly accessible front-end with login page
3. Create your user in Cognito

<br/><br/>

1. Set up your terraform state bucket:

    - Go to `/backend/category-api/terraform/state/variables.tf` and change the default variables (or specify them when running `terraform apply` in the next step)
    - Use terminal from the root of the project to run:
        - ```cd ./backend/category-api/terraform/state```
        - ```terraform init && terraform apply``` to create the state bucket (state locking uses S3 lock files, no DynamoDB table needed)

2. Set your BACKEND properties and `frontend_bucket_name` in `gradle.properties` (or in `~/.gradle/gradle.properties` to keep them out of git).
3. Deploy the backend infrastructure with Gradle:
    1. `asset_manager > backend > category-api > Tasks > other > plan` packages the Lambdas and layer and writes `terraform/tfplan`. **Read the plan output** before continuing.
    2. `asset_manager > backend > category-api > Tasks > other > apply` applies exactly that plan.

    DynamoDB tables and the Cognito user pool have `prevent_destroy` and deletion protection, so a plan that would delete them fails instead.
4. Deploy the frontend: `asset_manager > backend > category-api > Tasks > other > deployFrontend` builds it with the API url and Cognito ids from terraform outputs, uploads it to S3 and invalidates CloudFront.
5. Use AWS CLI to create your user:
    ```aws cognito-idp --profile <your_profile> admin-create-user --user-pool-id <your_user_pool_id> --username <username> --temporary-password <temp_pass_for_first_login> --message-action SUPPRESS```
6. Open the `frontend_url` printed by `terraform output` and log in.

### Local development

```
cd ./frontend
cp .env.example .env.local   # fill in values from `terraform output`
npm install
npm start
```

## Authors

* **Vadim Gulkevic** - Author - [vgulkevic](https://github.com/vgulkevic)
* **Vlad C** - Terraform modules - [vladcar](https://github.com/vladcar)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
