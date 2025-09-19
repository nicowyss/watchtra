// app/scripts/scan.js
const path = require("path");
const { getGraphToken } = require("../auth");
const { getUsers, validateUsers } = require("../users");
const { fetchDynamicGroups } = require("../groups");
const { fetchAuditLogs } = require("../auditlogs");
const { loadRules } = require("./appData");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");

// Azure Blob Storage config
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_CONTAINER_NAME =
  process.env.STORAGE_CONTAINER_NAME || "watchtra";
const STORAGE_SAS_TOKEN = process.env.STORAGE_SAS_TOKEN;

if (!STORAGE_ACCOUNT_NAME || !STORAGE_SAS_TOKEN) {
  throw new Error(
    "Azure Storage account name or SAS token not set in environment variables"
  );
}

// Helper to upload JSON to blob storage
async function uploadToBlob(filename, data) {
  // Ensure SAS token starts with '?'
  const sas = STORAGE_SAS_TOKEN.startsWith("?")
    ? STORAGE_SAS_TOKEN
    : "?" + STORAGE_SAS_TOKEN;

  // Use container-level SAS URL
  const containerClient = new BlobServiceClient(
    `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net${sas}`
  ).getContainerClient(STORAGE_CONTAINER_NAME);

  // Only try to create container if SAS allows it
  try {
    await containerClient.createIfNotExists();
  } catch (err) {
    if (err.statusCode === 403) {
      console.warn(
        `⚠️ Cannot create container, SAS token may lack 'c' permission. Continuing to upload.`
      );
    } else {
      throw err;
    }
  }

  const blockBlobClient = containerClient.getBlockBlobClient(filename);
  await blockBlobClient.upload(
    JSON.stringify(data, null, 2),
    Buffer.byteLength(JSON.stringify(data)),
    { overwrite: true }
  );

  console.log(`✅ Uploaded/Updated ${filename} to Azure Blob Storage`);
}

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
