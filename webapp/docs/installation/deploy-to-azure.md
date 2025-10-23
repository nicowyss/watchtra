---
id: deploy-to-azure
title: Deploy to Azure
sidebar_position: 3
---

# Deploy to Azure

With your App Registration created and permissions verified, you can now deploy WatchTra. 

## Steps

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

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://func-watchtra-tracker.azurewebsites.net/api/tracker)

> **Be Aware** the Deployment can take up to 15 Minutes, this is just because depends on the API Connection/Timeouts. 

---

✅ When deployment is complete, continue to [Dashboard](../usage/dashboard.md) to access the web application.
