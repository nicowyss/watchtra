## Architecture (Components)
- Azure Web App
- Azure Function
- Storage Account
- Entra ID App Registration (Application Administrator)

## Sources (Links)
- https://docusaurus.io/docs
- https://infima.dev/docs/components/badge
- https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-to-azure-button

## Features (To Do List)
- Setup static (guests, members) app config in the webapp   
- Docs, how to use it   
- Least Privlidges for ARM Deployment in Azure (does it really needs a Global Admin) - try ARM Deployment with Contributor Rights only in one sub
- Generate a SAS with right priv for ARM Deployment and later on use a SAS on the same container for access data with read priv
- userCard max hight definition and scollable tables

1 update
2 customer data
3 deploy

## Bugs (Known Issues)
- Dynamic Group Membership Validator not works
- Azure Function (Scheduler) does not work yet
- Audit Logs make it more prettier
- last sync date make it prettier   
- Azure Function CORS Settings deployment

## Ideas (v2)
- Entra ID App Registration Deployment
- Comos DB, store not compliant Users in DB for 30 Days (Historie View)
- Alering, notify a specific admin User with a daily summary of non compliant Users (SendGrid - Azure Monitor Alerts)
- Bicep, Terraform, GitHub Action -  CI/CD Deployments
- Visualization with armviz.io 

## Deploy to Azure
1. App Registration
2. Deploy to Azure (ARM Template)
3. GitHub Connection (Web App - Deployment Center)

Click the button below to deploy this solution to your Azure subscription: (YOU NEED GLOBAL ADMIN PERMISSION)

# Watchtra Deployment

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fnicowyss%2Fwatchtra%2Fmain%2Fdeployment%2Fazuredeploy.json)



