// app/scripts/scan.js
const fs = require("fs");
const path = require("path");
const { getGraphToken } = require("../auth");
const { getUsers, validateUsers } = require("../users");
const { fetchDynamicGroups } = require("../groups");
const { saveFindings } = require("../cosmos");
const { fetchAuditLogs } = require("../auditlogs");
const { loadRules } = require("./appData");

// Output paths for frontend
const USERS_OUTPUT_PATH = path.join(
  __dirname,
  "../../static/users-results.json"
);
const GROUPS_OUTPUT_PATH = path.join(
  __dirname,
  "../../static/groups-results.json"
);
const LOGS_OUTPUT_PATH = path.join(__dirname, "../../static/logs-results.json");

async function runUserScan() {
  const { members: memberRules, guests: guestRules } = await loadRules();

  const token = await getGraphToken();
  const users = await getUsers(token);

  const memberUsers = users.filter((u) => u.userType === "Member");
  const guestUsers = users.filter((u) => u.userType === "Guest");

  const memberFindings = validateUsers(memberUsers, memberRules);
  const guestFindings = validateUsers(guestUsers, guestRules);

  const allFindings = [...memberFindings, ...guestFindings];
  await saveFindings(allFindings);

  return {
    total: users.length,
    issues: allFindings.length,
    findings: allFindings,
    lastUpdated: new Date().toISOString(),
  };
}

async function runGroupScan() {
  const groups = await fetchDynamicGroups();
  return {
    totalGroups: groups.length,
    groups,
    lastUpdated: new Date().toISOString(),
  };
}

async function runAuditLogScan() {
  const logs = await fetchAuditLogs();
  return {
    totalLogs: logs.length,
    logs,
    lastUpdated: new Date().toISOString(),
  };
}

async function runScan() {
  try {
    const userResults = await runUserScan();
    fs.writeFileSync(USERS_OUTPUT_PATH, JSON.stringify(userResults, null, 2));
    console.log(`✅ User scan saved to ${USERS_OUTPUT_PATH}`);

    const groupResults = await runGroupScan();
    fs.writeFileSync(GROUPS_OUTPUT_PATH, JSON.stringify(groupResults, null, 2));
    console.log(`✅ Group scan saved to ${GROUPS_OUTPUT_PATH}`);

    const logResults = await runAuditLogScan();
    fs.writeFileSync(LOGS_OUTPUT_PATH, JSON.stringify(logResults, null, 2));
    console.log(`✅ Audit Log scan saved to ${LOGS_OUTPUT_PATH}`);

    return { userResults, groupResults };
  } catch (err) {
    console.error("❌ Scan failed:", err.message);
    throw err;
  }
}

// Run standalone
if (require.main === module) {
  runScan().catch((err) => process.exit(1));
}

module.exports = { runScan };
