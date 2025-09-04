const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");
const { CosmosClient } = require("@azure/cosmos");
const { getGraphToken } = require("../app/auth"); // one level up, into app
const { Console } = require("console");

function generateId() {
  return crypto.randomUUID(); // Node.js 18+
}

// Paths (go up to app/rules)
const MEMBER_RULES_PATH = path.join(__dirname, "../app/rules/members.json");
const GUEST_RULES_PATH = path.join(__dirname, "../app/rules/guests.json");

// Cosmos DB setup
const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});
const database = client.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER);

// Fetch users
async function getUsers(token) {
  const url =
    "https://graph.microsoft.com/v1.0/users?$select=id,displayName,userPrincipalName,companyName,department,officeLocation,city,country,userType";
  let users = [];
  let nextLink = url;

  while (nextLink) {
    const resp = await axios.get(nextLink, {
      headers: { Authorization: `Bearer ${token}` },
    });
    users = users.concat(resp.data.value);
    nextLink = resp.data["@odata.nextLink"] || null;
  }
  return users;
}

// Validate
function validateUsers(users, rules) {
  const findings = [];
  const excludeUsers = rules.excludeUsers || [];

  for (const u of users) {
    if (excludeUsers.includes(u.userPrincipalName)) continue;

    const issues = {};
    if (!rules.companyName.allowed.includes(u.companyName))
      issues.companyName = u.companyName;
    if (!rules.department.allowed.includes(u.department))
      issues.department = u.department;
    if (!rules.officeLocation.allowed.includes(u.officeLocation))
      issues.officeLocation = u.officeLocation;
    if (!rules.city.allowed.includes(u.city)) issues.city = u.city;
    if (!rules.country.allowed.includes(u.country)) issues.country = u.country;

    if (Object.keys(issues).length > 0) {
      findings.push({
        id: generateId(),
        userPrincipalName: u.userPrincipalName,
        name: u.displayName,
        userType: u.userType,
        issues,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return findings;
}

// Save
async function saveFindings(findings) {
  for (const f of findings) {
    try {
      await container.items.upsert(f);
    } catch (err) {
      console.error("Failed to save user:", f.id, err.message);
    }
  }
}

// Main scan
async function runScan() {
  try {
    const memberRules = JSON.parse(
      fs.readFileSync(MEMBER_RULES_PATH, "utf8")
    );
    const guestRules = JSON.parse(fs.readFileSync(GUEST_RULES_PATH, "utf8"));

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
    };
  } catch (err) {
    console.error("Scan failed:", err.message);
    throw err;
  }
}

module.exports = { runScan };
