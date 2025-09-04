@description('Location for Cosmos DB')
param location string

@description('Cosmos DB account name')
param cosmosDbAccountName string

@description('Cosmos DB database name')
param cosmosDbDatabaseName string

// Cosmos DB Account
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosDbAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      { locationName: location, failoverPriority: 0, isZoneRedundant: false }
    ]
    capabilities: [{ name: 'EnableServerless' }]
  }
}

// Cosmos Database
resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  name: '${cosmosAccount.name}/${cosmosDbDatabaseName}'
  properties: { resource: { id: cosmosDbDatabaseName }, options: {} }
  dependsOn: [cosmosAccount]
}

// Outputs
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
output cosmosDbName string = cosmosDatabase.name
