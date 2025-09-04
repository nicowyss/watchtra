// infra/app/groups.js
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const axios = require("axios");
const { getGraphToken } = require("./auth");

/**
 * Fetch all dynamic groups in the tenant
 */
async function getDynamicGroups(token) {
  const url = "https://graph.microsoft.com/v1.0/groups?$filter=groupTypes/any(c:c eq 'DynamicMembership')&$select=id,displayName,membershipRule";
  let groups = [];
  let nextLink = url;

  while (nextLink) {
    const resp = await axios.get(nextLink, {
      headers: { Authorization: `Bearer ${token}` },
    });
    groups = groups.concat(resp.data.value);
    nextLink = resp.data["@odata.nextLink"] || null;
  }

  return groups;
}

/**
 * Fetch the member count for a group
 */
async function getGroupMemberCount(groupId, token) {
  const url = `https://graph.microsoft.com/v1.0/groups/${groupId}/members/$count`;
  const resp = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      ConsistencyLevel: "eventual", // Required for $count
    },
  });
  return resp.data;
}

/**
 * Gather all dynamic groups with their member count and rules
 */
async function fetchDynamicGroups() {
  try {
    const token = await getGraphToken();
    const groups = await getDynamicGroups(token);

    const enrichedGroups = [];
    for (const g of groups) {
      const memberCount = await getGroupMemberCount(g.id, token);
      enrichedGroups.push({
        name: g.displayName,
        memberCount,
        membershipRule: g.membershipRule,
      });
    }

    return enrichedGroups;
  } catch (err) {
    console.error("Failed to fetch groups:", err.message);
    throw err;
  }
}

module.exports = { fetchDynamicGroups };

// Run standalone for testing
if (require.main === module) {
  fetchDynamicGroups().then(groups => console.log(groups));
}

