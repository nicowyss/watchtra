![Logo](https://accesspackagebuilder.dev/images/watchtra-github-banner.png)

# WatchTra

**WatchTra** is a web application for **Microsoft Entra ID** that helps organizations enforce compliance in user attributes. It compares values stored in Entra ID user properties against a predefined compliance dictionary and highlights non-compliant entries.

## Features

- 🔍 **Compliance Monitoring** – Detects inconsistent or invalid user attributes.  
- 📊 **Dashboard** – Visualizes compliant vs. non-compliant users.  
- ⚡ **Automation** – Hourly data fetch from Entra ID and automatic webapp updates.  
- 🛠 **Configurable Rules** – Define your organization’s compliance standards in JSON.  

## Architecture Overview

WatchTra is built entirely on **Azure**:

- **Azure Function App** – Backend logic, API endpoints, scheduled data fetch, and webapp rebuild.  
- **Azure Web App** – Hosts the Docusaurus-based frontend dashboard.  
- **Azure Storage Account** – Stores compliance dictionaries, processed data, and static assets.  
- **GitHub Repository** – Source of truth for frontend code.  

# Installation

To install **WatchTra**, follow these steps:

## Prerequisites

- Active **Microsoft Entra ID** tenant  
- Admin permissions to create **App Registrations**  
- **Contributor** role on target Azure subscription  

## Steps

### 1. Create an App Registration

1. Go to [Azure Portal](https://portal.azure.com).  
2. Navigate to **Azure Active Directory → App registrations → New registration**.  
3. Enter a name for your app (e.g., `WatchTraApp`).  
4. Create a **client secret** under **Certificates & secrets**. (safe it for later...)
5. Add **Microsoft Graph API permissions**:  
   - `User.Read.All` (Application)  
   - `Group.Read.All` (Application) 
   - `GroupMember.Read.All` (Application) 
   - `AuditLog.Read.All` (Application)  
6. Grant admin consent for the permissions.  

### 2. Ensure Azure Subscription Permissions

- You must have at least **Contributor** role on the target subscription.  

### 3. Deploy to Azure

1. Go to the WatchTra GitHub repository.  
2. Click the **“Deploy to Azure”** button.  
3. Fill in required fields:  
   - Subscription  
   - Resource Group
   - Region
   - Site Name (e.g. **watchtra** - beware a Unique Suffix will be added later)  
   - Tenant ID, Client ID, Client Secret  
4. Click **Review + Create → Create**.
5. Deployment Time can be up to 15 Minutes!  

The deployment will provision the **Azure Function App**, **Web App**, and **Storage Account** automatically.

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fnicowyss%2Fwatchtra%2Fmain%2Fdeployment%2Fazuredeploy.json)

## Author(s)  

- [@nicowyss](https://github.com/nicowyss)  

## License  

This project is licensed under the [MIT License](LICENSE).  

## Open Points (In Development)
**Backend:**
- Least Privlidges for ARM Deployment in Azure (does it really needs a Global Admin) - try ARM Deployment with Contributor Rights only in one sub
- Storage Account Deployment - (Generate a SAS with right priv for ARM Deployment and later on use a SAS on the same container for access data with read priv)

**Frontend:**
- last sync date - (make it prettier) 
- Documentation - (Make it better)   

## Ideas (v2)
- Entra ID App Registration Deployment
- Button to Trigger Update User Information manually
- Comos DB, store not compliant Users in DB for 30 Days (Historie View)
- Alering, notify a specific admin User with a daily summary of non compliant Users (SendGrid - Azure Monitor Alerts)
- Bicep, Terraform, GitHub Action -  CI/CD Deployments
- Visualization with armviz.io 

- Application Insights ? Ja oder Nein?






