# Assets Wallet

If you store your money on multiple banks, BTC exchanges and in cash it is extremely inconvenient to track the amounts you have on each and in different currencies. You have to either login into each of the systems every time or use Excel spreadsheet/Notepad. 

This app allows you track your holdings/assets value in different currencies in a single place.

There are two different Categories - Custom and Api Integration:
- Custom - you can add/edit/remove asset to this category as you want
- Api Integration - your assets will be fetched from the service you use using your API key. 

Available integrations: 
   - Starling Bank
   - Bittrex (BTC exchange)
   - Kraken (BTC exchange)
   - Binance (BTC exchange)

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
- Lambdas to fetch categories and assets from DynamoDB and to fetch assets from API integrated categories

Front-end
- Two-page React.js app with Amplify authentication: 
    1. Login page 
    2. Categories page
    
Where you can add/edit/delete categories and custom categories assets.

### Prerequisites

- AWS account
- Terraform (I use v0.12.20)
- npm
- AWS CLI

Using macOS terminal
```
brew install terraform
brew install node
```

### Installing

Follow the steps to: 
1. Deploy serverless infrastructure
2. Deploy publicly accessible front-end with login page
3. Create your user in Cognito

<br/><br/>

1. Set up your terraform state bucket and table for locks:
    
    - Go to `/backend/category-api/terraform/state/variables.tf` and change the default variables (or specify them when running `terraform apply` in the next step)
    - Use terminal from the root of the project to run:
        - ```cd ./backend/category-api/terraform/state```
        - ```terraform apply``` to create state bucket and table for terraform locks
        
2. Set your BACKEND properties in `gradle.properties` in the root of the project with your properties.
3. Use Gradle to deploy your infra:
    1. `asset_manager > backend > Tasks > other > packageLayer`
    2. `asset_manager > backend > Tasks > other > packageLambda`
    3. `asset_manager > backend > Tasks > other > deploy` 
4. Update your FRONTEND properties in `gradle.properties` in the root of the project
    1. Go to your AWS account (double-check you are in the correct AWS region) and verify an API Gateway has been created. 
    2. Open your API
    3. Go to Stages > select <stage> and copy the Invoke Url - this is your `api_url` in `gradle.properties`
    4. Go to AWS > Cognito > Manage User Pools > select your user pool
    5. Copy the Pool Id - this is your `userPoolId`
    6. Go to App clients > find the newly created user pool - App client id is your `userPoolWebClientId` 
7. Install and deploy your frontend:
    1. Use terminal from the root of the project to run: 
        - ```cd ./frontend```
        - ```yarn install```
    2. Use Gradle to deploy your frontend:
        - `asset_manager > frontend > Tasks > other > packFrontend`
        - `asset_manager > backend > Tasks > other > deploy`
8. Use AWS CLI to create your user:
    ```aws cognito-idp --profile <your_profile> admin-create-user --user-pool-id <your_user_pool_id> --username <username> --temporary-password <temp_pass_for_first_login> --message-action SUPPRESS```
9. Go to your AWS account > Cloudfront and find domain name for your bucket
10. Open the url and login

## Authors

* **Vadim Gulkevic** - Author - [vgulkevic](https://github.com/vgulkevic)
* **Vlad C** - Terraform modules - [vladcar](https://github.com/vladcar)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
