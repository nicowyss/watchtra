## Architecture (Components)
- Cosmos DB
- Azure Web App
- Azure Function
- Entra ID App Registration

## Sources (Links)
- https://docusaurus.io/docs
- https://infima.dev/docs/components/badge
- https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/deploy-to-azure-button

## Features (To Do List)
- Deploy to Azure (bicep via GitHub)
- Setup static (guests, members) app config in the webapp   

## Bugs (Known Issues)
- Dynamic Group Membership Validator not works
- scheduler.js does not start automatically after ARM Template deployment (needs to be fixed, every hour update data)

## Notes

- UPDATE DATA: node app/scripts/scan.js 
      // "schedule": "0 0 */4 * * *"


⚠️ App Registration caveat:
Deploying Entra ID App Registrations via Bicep requires the Microsoft Graph resource provider (preview). The deploying user must have permission (Application.ReadWrite.All) in Entra ID. If your customers deploy, they’ll need those rights in their tenant.

## Deploy to Azure
1. App Registration
2. Deploy to Azure (ARM Template)
3. GitHub Connection (Web App - Deployment Center)

Click the button below to deploy this solution to your Azure subscription: (YOU NEED GLOBAL ADMIN PERMISSION)

# Watchtra Deployment

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fnicowyss%2Fwatchtra%2Fmain%2Fdeployment%2Fazuredeploy.json)



