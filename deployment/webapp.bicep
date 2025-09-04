@description('Location for Web App')
param location string

@description('Web App name')
param webAppName string

@description('App Service Plan name')
param appServicePlanName string

@description('GitHub repo URL')
param repoUrl string

@description('GitHub branch')
param branch string = 'main'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: { name: 'B1', tier: 'Basic', size: 'B1', family: 'B', capacity: 1 }
  kind: 'linux'
  properties: { reserved: true }
}

// Web App
resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: { linuxFxVersion: 'NODE|18-lts' }
    httpsOnly: true
  }
}

// Source control (GitHub)
resource sourceControl 'Microsoft.Web/sites/sourcecontrols@2022-03-01' = {
  name: '${webAppName}/web'
  properties: { repoUrl: repoUrl, branch: branch, isManualIntegration: true, isGitHubAction: false }
  dependsOn: [webApp]
}

// Outputs
output webAppUrl string = webApp.properties.defaultHostName
