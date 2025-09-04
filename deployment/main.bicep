// ==============================
// Parameters
// ==============================
@description('Location for all resources')
param location string = resourceGroup().location

@description('Name of the App Service Plan')
param appServicePlanName string = 'watchtra-plan'

@description('Name of the Web App')
param webAppName string

@description('GitHub repo URL (e.g. https://github.com/yourorg/watchtra)')
param repoUrl string

@description('Branch to deploy from')
param branch string = 'main'

// ==============================
// Resources
// ==============================

// App Service Plan (Linux, B1 tier by default)
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    family: 'B'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// Web App
resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts' // adjust runtime if needed
    }
    httpsOnly: true
  }
}

// Configure GitHub Actions deployment
resource sourceControl 'Microsoft.Web/sites/sourcecontrols@2022-03-01' = {
  name: '${webApp.name}/web'
  properties: {
    repoUrl: repoUrl
    branch: branch
    isManualIntegration: true
    isGitHubAction: true
    deploymentRollbackEnabled: true
  }
  dependsOn: [
    webApp
  ]
}

// ==============================
// Outputs
// ==============================
output webAppUrl string = webApp.properties.defaultHostName
output webAppResourceId string = webApp.id
