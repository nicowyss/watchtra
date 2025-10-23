---
id: overview
title: Overview
sidebar_position: 1
---

# Overview

The **WatchTra** solution is built on multiple Azure services working together to deliver compliance monitoring for Entra ID.  

![WatchTra Archtitecture Simple](./images/watchtra-architecture-simple.svg)

---

## High-Level Components

At a glance, the solution contains these main components:

> **Note:** This Solution use an App Service Plan B3 that incurs costs approx. 70 USD per month.

- **Azure Function App**  
  - Provides backend logic for WatchTra.  
  - Fetches data from Microsoft Graph API.  
  - Updates and maintains the web application content.  

- **Azure Web App**  
  - Hosts the WatchTra frontend (React/Docusaurus).  
  - Provides a dashboard for administrators to view compliance status.  
  - Communicates with the Function App via API endpoints.  

- **Azure Storage Account**  
  - Stores compliance-related data.  
  - Holds static assets required by the webapp.  

- **GitHub Repository**  
  - Source of truth for the frontend code (Docusaurus).  
  - Used by the Function App to rebuild and redeploy the site when necessary.  

---

📌 Together, these components form a **scalable, cloud-native compliance monitoring solution** that runs entirely in Azure.
