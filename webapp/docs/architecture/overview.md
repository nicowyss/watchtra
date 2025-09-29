---
id: overview
title: Overview
sidebar_position: 1
---

# Overview

The **WatchTra** solution is built on multiple Azure services working together to deliver compliance monitoring for Entra ID.  

## High-Level Architecture

At a glance, the solution contains these main components:

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

## Architecture Diagram

```mermaid
flowchart TD
    A[Microsoft Graph API] -->|Fetch User & Group Data| B[Azure Function App]
    B -->|Write Data| C[Azure Storage Account]
    C -->|Serve Data| D[Azure Web App]
    D -->|Fetch via API| B
    E[GitHub Repository] -->|Frontend Code| D
    E -->|Build Trigger| B
