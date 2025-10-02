// app/scripts/scan.js
const path = require("path");
const fetch = require("node-fetch");
const { getGraphToken } = require("../auth");
const { getUsers, validateUsers } = require("../users");
const { fetchDynamicGroups } = require("../groups");
const { fetchAuditLogs } = require("../auditlogs");
const { loadRules } = require("./appData");
const { ContainerClient } = require("@azure/storage-blob");

// Function URL to fetch storage credentials
const FUNCTION_URL =
  process.env.REACT_APP_FUNCTION_URL || "http://localhost:7071/api/api";

// Lazy-load storage config from Function API
let storageConfig = null;

async function getStorageConfig() {
  if (storageConfig) return storageConfig;

  try {
    const res = await fetch(FUNCTION_URL);
    if (!res.ok) throw new Error(`Failed to fetch storage config`);
    storageConfig = await res.json();

    if (!storageConfig.STORAGE_URL || !storageConfig.STORAGE_SAS) {
      throw new Error("Function did not return valid storage config");
    }
    console.log("✅ Loaded storage config from Function API");
    return storageConfig;
  } catch (err) {
    console.error("❌ Could not fetch storage config:", err.message);
    throw err;
  }
}

// Helper to upload JSON to blob storage
async function uploadToBlob(filename, data) {
  const { STORAGE_URL, STORAGE_SAS } = await getStorageConfig();

  // Ensure SAS starts with "?"
  const sas = STORAGE_SAS.startsWith("?") ? STORAGE_SAS : "?" + STORAGE_SAS;

  // STORAGE_URL already includes container, treat it as container-level URL
  const containerClient = new ContainerClient(`${STORAGE_URL}${sas}`);

  const blockBlobClient = containerClient.getBlockBlobClient(filename);
  const body = JSON.stringify(data, null, 2);

  await blockBlobClient.upload(body, Buffer.byteLength(body), { overwrite: true });

  console.log(`✅ Uploaded/Updated ${filename} to Azure Blob Storage`);
}

// === Scan logic ===
async function runUserScan() {
  const { members: memberRules, guests: guestRules } = await loadRules();
  const token = await getGraphToken();
  const users = await getUsers(token);

  const memberUsers = users.filter((u) => u.userType === "Member");
  const guestUsers = users.filter((u) => u.userType === "Guest");

  const memberFindings = validateUsers(memberUsers, memberRules);
  const guestFindings = validateUsers(guestUsers, guestRules);

  const allFindings = [...memberFindings, ...guestFindings];

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
    await uploadToBlob("users-results.json", userResults);

    const groupResults = await runGroupScan();
    await uploadToBlob("groups-results.json", groupResults);

    const logResults = await runAuditLogScan();
    await uploadToBlob("logs-results.json", logResults);

    return { userResults, groupResults, logResults };
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
