const axios = require("axios");
const { getGraphToken } = require("./auth");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

async function fetchAuditLogs() {
  const token = await getGraphToken();
  let url = "https://graph.microsoft.com/v1.0/auditLogs/directoryAudits?$top=50";
  let logs = [];

  while (url) {
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      logs = logs.concat(res.data.value);
      url = res.data["@odata.nextLink"] || null;

      // polite delay between pages (Graph hard-throttles auditLogs)
      await new Promise((r) => setTimeout(r, 800));

    } catch (err) {
      // handle 429 Too Many Requests
      if (err.response && err.response.status === 429) {
        const retryAfter = parseInt(err.response.headers["retry-after"] || "5", 10);
        console.warn(`⚠️ Graph throttled — waiting ${retryAfter}s`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue; // retry same URL
      }

      // handle transient network issues
      if (err.code === "ENOTFOUND" || err.code === "ECONNRESET") {
        console.warn("🔁 Network glitch — retrying in 5s");
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      // everything else → throw
      console.error("❌ Failed fetching audit logs:", err.message);
      throw err;
    }
  }

  // Filter and transform
  const ignoredProperties = [
    "SPN",
    "ActorId.ServicePrincipalNames",
    "StrongAuthenticationPhoneAppDetail",
  ];

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

  const transformed = filtered.map((l) => {
    let modifiedProperties = [];

    if (l.targetResources?.length) {
      for (const resource of l.targetResources) {
        if (resource.modifiedProperties?.length) {
          for (const prop of resource.modifiedProperties) {
            if (!ignoredProperties.includes(prop.displayName)) {
              modifiedProperties.push({
                displayName: prop.displayName,
                oldValue: prop.oldValue,
                newValue: prop.newValue,
              });
            }
          }
        }
      }
    }

    let initiatedBy = "system";
    if (l.initiatedBy?.user)
      initiatedBy = l.initiatedBy.user.userPrincipalName;
    else if (l.initiatedBy?.application)
      initiatedBy = l.initiatedBy.application.displayName;
    else if (l.initiatedBy?.servicePrincipal)
      initiatedBy = l.initiatedBy.servicePrincipal.displayName;

    return {
      id: l.id,
      category: l.category,
      activity: l.activityDisplayName,
      initiatedBy,
      target:
        l.targetResources?.map((t) => t.userPrincipalName || t.displayName).join(", ") || "",
      details: JSON.stringify(l.additionalDetails || {}),
      modifiedProperties,
      timestamp: l.activityDateTime,
    };
  });

  return transformed;
}

module.exports = { fetchAuditLogs };
