---
id: create-app-registration
title: Create an App Registration
sidebar_position: 1
---

# Create an App Registration

To connect WatchTra with **Microsoft Entra ID**, you must first create an App Registration.

## Steps

1. Go to the [Azure Portal](https://portal.azure.com).  
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**.  
3. Enter a name for your app (e.g., `WatchTraApp`).  
4. Under **Redirect URI**, leave blank or configure if required for your environment.  
5. After the app is created:  
   - Go to **Certificates & secrets** → **New client secret**.  
   - Copy the generated **secret value**.  
6. Go to **API permissions** → **Add a permission** → **Microsoft Graph**.  
   - Select **Application permissions**.  
   - Add:  
     - `User.Read.All`  
     - `Group.Read.All`  
   - Click **Grant admin consent**.  

📌 You now have the following values ready for deployment:
- **Tenant ID**  
- **Client ID** (Application ID)  
- **Client Secret**  
