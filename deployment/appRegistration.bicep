@description('Location for deployment script')
param location string

@description('App Registration name')
param appRegName string

@description('Web App name to inject secrets')
param webAppName string

@description('Function App name to inject secrets')
param functionAppName string

// Deployment Script to create App Registration + secret
resource createAppReg 'Microsoft.Resources/deploymentScripts@2020-10-01' = {
  name: 'createAppRegistration'
  location: location
  kind: 'AzureCLI'
  properties: {
    azCliVersion: '2.47.0'
    retentionInterval: 'P1D'
    forceUpdateTag: '1'
    scriptContent: '''
      echo "Creating App Registration..."
      APP_JSON=$(az ad app create --display-name "${appRegName}" --output json)
      APP_ID=$(echo $APP_JSON | jq -r .appId)
      
      echo "Creating Client Secret..."
      SECRET_JSON=$(az ad app credential reset --id $APP_ID --append --display-name "ClientSecret" --output json)
      SECRET_VALUE=$(echo $SECRET_JSON | jq -r .secretText)
      
      echo "Injecting CLIENT_ID + CLIENT_SECRET into Web App..."
      az webapp config appsettings set --name ${webAppName} --resource-group $AZURE_RESOURCE_GROUP --settings CLIENT_ID=$APP_ID CLIENT_SECRET=$SECRET_VALUE
      
      echo "Injecting CLIENT_ID + CLIENT_SECRET into Function App..."
      az webapp config appsettings set --name ${functionAppName} --resource-group $AZURE_RESOURCE_GROUP --settings CLIENT_ID=$APP_ID CLIENT_SECRET=$SECRET_VALUE
    '''
  }
}
