---
id: webapp
title: App Service
sidebar_position: 3
---

# App Service

The **Azure Web App** is the frontend component of WatchTra.  
It delivers the user interface where administrators can view compliance data and reports.  

---

## Responsibilities

- **Host the Frontend**  
  - Runs the Docusaurus-based web application.  
  - Provides an interactive dashboard for compliance monitoring.  

- **Connect to the Backend**  
  - Communicates with the **Azure Function App** through secure API endpoints.  
  - Fetches compliance data stored in the **Azure Storage Account**.  

- **Deliver Reports & Insights**  
  - Displays compliant vs. non-compliant users.  
  - Allows filtering and searching by attributes (e.g., Country, Department).  
  - Provides options to export results (CSV, etc.).  

---

## Deployment

- Deployed automatically via the **“Deploy to Azure”** pipeline in the GitHub repository.  
- The **Function App** can trigger rebuilds when new frontend code is pushed.  
- Static assets are served directly from the **Web App** for scalability and performance.  

---

📌 The Azure Web App is the **face of WatchTra**, giving administrators a simple but powerful interface to maintain compliance.
