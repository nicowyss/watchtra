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
- members.json Rules cannot stay in the webapp (for Later Updates pushes would override this)
- Deploy to Azure (bicep via GitHub)
- Full Stying Update (index.js) from Tailwind CSS Code to native Docusaurus css file

## Bugs (Known Issues)
- Dynamic Group Membership Validator not works

## Notes

- UPDATE DATA: node app/scripts/scan.js 

⚠️ App Registration caveat:
Deploying Entra ID App Registrations via Bicep requires the Microsoft Graph resource provider (preview). The deploying user must have permission (Application.ReadWrite.All) in Entra ID. If your customers deploy, they’ll need those rights in their tenant.

## Deploy to Azure

Click the button below to deploy this solution to your Azure subscription:

# Watchtra Deployment

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https://raw.githubusercontent.com/nicowyss/watchtra/main/deployment/azuredeploy.json)


