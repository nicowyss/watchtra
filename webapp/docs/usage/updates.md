---
id: updates
title: Updates
description: Description of the automatic and manual update cycle in the WatchTra Dashboard
---

# Updates

WatchTra features both **automatic updates** through an Azure Function and **manual updates** triggered by the user from the dashboard. This ensures that all information about user attributes always reflects the most current state.

## Automatic Update

After installing WatchTra, an **Azure Function** continuously updates the user data. The process runs **automatically every full hour** and performs the following steps:

1. **Retrieves user attributes** from Microsoft Entra ID via the Graph API.  
2. **Compares the current values** with the allowed entries defined in the [JSON configuration files](./prerequisites.md) (`members.json` and `guests.json`).  
3. **Generates a comparison report** identifying all non-compliant user attributes.  
4. **Updates the dashboard** to reflect any new or resolved compliance violations.

This hourly interval ensures consistent data integrity without requiring manual intervention.

## Manual Update

In addition to the automatic synchronization, WatchTra also allows the synchronization to be **started manually**.

In the **User Issues** section of the dashboard, a button labeled **Update Data** is located at the bottom of the page. Clicking this button immediately triggers the validation process independent of the regular hourly cycle.

A manual update is particularly useful when:

- user attributes in Microsoft Entra ID have recently been modified  
- new allowed values have been added to `members.json` or `guests.json`  
- or an immediate confirmation of a correction is required  

After the manual update starts, data is validated instantly and the results are refreshed in the dashboard.

## Update Results

Both the automatic and manual updates produce the same outcome:

- The dashboard always displays the most recent list of **non-compliant users**.  
- Changes to user attributes are reflected immediately.  
- The timestamp of the last successful synchronization is shown in the **Last Sync** field within the *Statistics* section.

As a result, WatchTra remains continuously synchronized with Microsoft Entra ID and provides a reliable real-time view of the organization’s attribute compliance status.
