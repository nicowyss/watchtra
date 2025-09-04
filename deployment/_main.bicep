@description('Location for all resources')
param location string = resourceGroup().location

@description('Web App name')
param webAppName string

@description('App Service Plan name')
param appServicePlanName string = 'watchtra-plan'

@description('GitHub repo URL for Web App')
param repoUrl string

@description('GitHub branch')
param branch string = 'main'

@description('Cosmos DB account name')
param cosmosDbAccountName string

@description('Cosmos DB database name')
param cosmosDbDatabaseName string = 'watchtra-db'

// ------------------------------
// Web App Module
// ------------------------------
module webappModule 'webapp.bicep' = {
  name: 'webappModule'
  params: {
    location: location
    webAppName: webAppName
    appServicePlanName: appServicePlanName
    repoUrl: repoUrl
    branch: branch
  }
}

// ------------------------------
// Cosmos DB Module
// ------------------------------
module cosmosModule 'cosmos.bicep' = {
  name: 'cosmosModule'
  params: {
    location: location
    cosmosDbAccountName: cosmosDbAccountName
    cosmosDbDatabaseName: cosmosDbDatabaseName
  }
}


// ------------------------------
// Function App Module
// ------------------------------
module functionAppModule 'functionApp.bicep' = {
  name: 'functionAppModule'
  params: {
    location: location
    functionAppName: functionAppName
    appServicePlanName: appServicePlanName
    cosmosEndpoint: cosmosModule.outputs.cosmosEndpoint
    cosmosKey: listKeys(resourceId('Microsoft.DocumentDB/databaseAccounts', cosmosDbAccountName), '2023-04-15').primaryMasterKey
    cosmosDbName: cosmosDbDatabaseName
  }
  dependsOn: [webappModule, cosmosModule]
}

// ------------------------------
// App Registration Module
// ------------------------------
module appRegModule 'appRegistration.bicep' = {
  name: 'appRegModule'
  params: { location: location, appRegName: appRegName, webAppName: webAppName, functionAppName: functionAppName }
  dependsOn: [webappModule, functionAppModule]
}

// ------------------------------
// Outputs
// ------------------------------
output webAppUrl string = webappModule.outputs.webAppUrl
output cosmosEndpoint string = cosmosModule.outputs.cosmosEndpoint
