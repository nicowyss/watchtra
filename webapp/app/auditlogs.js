const axios = require("axios");
const { getGraphToken } = require("./auth");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

async function fetchAuditLogs() {
  const token = await getGraphToken();
  let url =
    "https://graph.microsoft.com/v1.0/auditLogs/directoryAudits?$top=50";
  let logs = [];

  while (url) {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    logs = logs.concat(res.data.value);
    url = res.data["@odata.nextLink"] || null;
  }

  // Filter relevant events
  const filtered = logs.filter((l) =>
    [
      "Add user",
      "Delete user",
      "Update user",
      "Add member to group",
      "Remove member from group",
      "Update group",
    ].includes(l.activityDisplayName)
  );

  // Transform for storage & UI
  const transformed = filtered.map((l) => {
    // Extract modified properties (if any)
    let modifiedProperties = [];
    if (l.targetResources && l.targetResources.length > 0) {
      l.targetResources.forEach((resource) => {
        if (
          resource.modifiedProperties &&
          resource.modifiedProperties.length > 0
        ) {
          resource.modifiedProperties.forEach((prop) => {
            modifiedProperties.push({
              displayName: prop.displayName,
              oldValue: prop.oldValue,
              newValue: prop.newValue,
            });
          });
        }
      });
    }

    let initiatedBy = "system"; // fallback
    if (l.initiatedBy) {
      if (l.initiatedBy.user)
        initiatedBy = l.initiatedBy.user.userPrincipalName;
      else if (l.initiatedBy.application)
        initiatedBy = l.initiatedBy.application.displayName;
      else if (l.initiatedBy.servicePrincipal)
        initiatedBy = l.initiatedBy.servicePrincipal.displayName;
    }

    return {
      id: l.id,
      category: l.category,
      activity: l.activityDisplayName,
      initiatedBy: initiatedBy,
      target:
        l.targetResources
          ?.map((t) => t.userPrincipalName || t.displayName)
          .join(", ") || "",
      details: JSON.stringify(l.additionalDetails || {}),
      modifiedProperties, // Added modified properties array
      timestamp: l.activityDateTime,
    };
  });

  return transformed;
}

module.exports = { fetchAuditLogs };
