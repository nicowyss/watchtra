const { CosmosClient } = require("@azure/cosmos");
const axios = require("axios");
const { getGraphToken } = require("../app/auth");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});
const db = client.database(process.env.COSMOS_DATABASE);
const container = db.container("AuditLogs");

async function fetchAuditLogs() {
  const token = await getGraphToken();
  let url = "https://graph.microsoft.com/v1.0/auditLogs/directoryAudits?$top=50";
  let logs = [];

  while (url) {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    logs = logs.concat(res.data.value);
    url = res.data["@odata.nextLink"] || null;
  }

  // Filter relevant events
  const filtered = logs.filter(l =>
    ["Add user", "Delete user", "Update user", "Add member to group", "Remove member from group", "Update group"]
      .includes(l.activityDisplayName)
  );

  // Transform for storage & UI
  const transformed = filtered.map(l => ({
    id: l.id,
    category: l.category,
    activity: l.activityDisplayName,
    initiatedBy: l.initiatedBy?.user?.userPrincipalName || "system",
    target: l.targetResources?.map(t => t.userPrincipalName || t.displayName).join(", ") || "",
    details: JSON.stringify(l.additionalDetails || {}),
    timestamp: l.activityDateTime,
  }));

  // Save in Cosmos
  for (const log of transformed) {
    try {
       // await container.items.upsert(log); - UNCOMMENT WHEN COSMOS IS SETUP !!!!!!!!!!!!!!!!!!
    } catch (err) {
      console.error("Failed to save audit log:", log.id, err.message);
    }
  }

  return transformed;
}

module.exports = { fetchAuditLogs };
