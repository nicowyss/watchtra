// app/users.js
const axios = require("axios");
const crypto = require("crypto");

/**
 * Fetch all users from Microsoft Graph API
 */
async function getUsers(token) {
  const url =
    "https://graph.microsoft.com/v1.0/users?$select=id,displayName,userPrincipalName,companyName,department,officeLocation,city,country,userType,accountEnabled";

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

/**
 * Validate users against rules JSON
 */
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
        id: crypto.randomUUID(),
        userPrincipalName: u.userPrincipalName,
        name: u.displayName,
        userType: u.userType,
        accountEnabled: u.accountEnabled,
        issues,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return findings;
}

module.exports = { getUsers, validateUsers };
