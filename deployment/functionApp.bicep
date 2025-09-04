@description('Location for Function App')
param location string

@description('Function App name')
param functionAppName string

@description('App Service Plan name')
param appServicePlanName string

@description('Cosmos DB Endpoint')
param cosmosEndpoint string

@description('Cosmos DB Key')
param cosmosKey string

@description('Cosmos DB Database name')
param cosmosDbName string

// Function App
resource functionApp 'Microsoft.Web/sites@2022-03-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: resourceId('Microsoft.Web/serverfarms', appServicePlanName)
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appSettings: [
        { name: 'TENANT_ID', value: tenant().tenantId }
        { name: 'GRAPH_SCOPE', value: 'https://graph.microsoft.com/.default' }
        { name: 'COSMOS_ENDPOINT', value: cosmosEndpoint }
        { name: 'COSMOS_KEY', value: cosmosKey }
        { name: 'COSMOS_DATABASE', value: cosmosDbName }
        { name: 'COSMOS_CONTAINER', value: 'Findings' }
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' }
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'node' }
      ]
    }
    httpsOnly: true
  }
}

// Outputs
output functionAppUrl string = functionApp.properties.defaultHostName
