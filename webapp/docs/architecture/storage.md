---
id: storage
title: Storage Account
sidebar_position: 3
---

# Storage Account

The **Azure Storage Account** plays a central role in WatchTra by holding all data required for the web application.

## Responsibilities

- **Data Persistence**  
  - Stores compliance dictionaries (allowed values).  
  - Holds processed user and group data fetched from Microsoft Graph.  

- **Frontend Assets**  
  - Serves static resources needed by the webapp.  
  - Ensures quick and reliable delivery of UI components.  

- **Bridge Between Backend & Frontend**  
  - The Function App writes updated data into Storage.  
  - The Web App reads from Storage to display real-time compliance results.  

---

📌 The Storage Account ensures **WatchTra** remains **stateless**, reliable, and scalable by separating data storage from processing and presentation.
