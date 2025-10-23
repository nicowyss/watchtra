---
id: webapp
title: App Service
sidebar_position: 3
---

# App Service

The **Azure Web App** is the frontend component of WatchTra.  
It delivers the user interface where administrators can view compliance data and reports.  

![WatchTra Dashboard](../usage/images/Dashboard.png)

---

## Responsibilities

- **Host the Frontend**  
  - Runs the Docusaurus-based web application.  
  - Provides an interactive dashboard for compliance monitoring.  

- **Connect to the Backend**  
  - Communicates with the **Azure Function App** through secure API endpoints.  
  - Fetches compliance data stored in the **Azure Storage Account**.  

- **Deliver Reports & Insights**  
  - Displays non-compliant users.  

---

📌 The Azure Web App is the **face of WatchTra**, giving administrators a simple but powerful interface to maintain compliance.
