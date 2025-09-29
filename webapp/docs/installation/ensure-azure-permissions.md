---
id: ensure-azure-permissions
title: Ensure Azure Subscription Permissions
sidebar_position: 2
---

# Ensure Azure Subscription Permissions

To successfully deploy WatchTra, you must have the correct permissions in your Azure environment.

## Required Role

- **Contributor** (at minimum) on the target Azure **subscription**.  

This role allows you to:
- Deploy new resources into the subscription  
- Assign the necessary identities and permissions for WatchTra  

📌 Without this role, the deployment will fail.  
