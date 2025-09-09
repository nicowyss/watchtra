// app/scripts/appConfig.js
const { AppConfigurationClient } = require("@azure/app-configuration");
const fs = require("fs");
const path = require("path");

// Fallback paths
const MEMBER_RULES_PATH = path.join(__dirname, "../rules/members.json");
const GUEST_RULES_PATH = path.join(__dirname, "../rules/guests.json");

const connectionString = process.env.APP_CONFIG_CONNECTION_STRING;

let client = null;
if (connectionString) {
  client = new AppConfigurationClient(connectionString);
} else {
  console.warn("⚠️ APP_CONFIG_CONNECTION_STRING not set. Using local JSON rules only.");
}

async function loadRules() {
  const rules = { members: null, guests: null };

  // Members rules
  if (client) {
    try {
      const membersSetting = await client.getConfigurationSetting({ key: "members.rules" });
      rules.members = JSON.parse(membersSetting.value);
    } catch (err) {
      console.warn("⚠️ Could not fetch members rules from App Configuration, falling back to local JSON.");
      rules.members = JSON.parse(fs.readFileSync(MEMBER_RULES_PATH, "utf8"));
    }
  } else {
    rules.members = JSON.parse(fs.readFileSync(MEMBER_RULES_PATH, "utf8"));
  }

  // Guests rules
  if (client) {
    try {
      const guestsSetting = await client.getConfigurationSetting({ key: "guests.rules" });
      rules.guests = JSON.parse(guestsSetting.value);
    } catch (err) {
      console.warn("⚠️ Could not fetch guests rules from App Configuration, falling back to local JSON.");
      rules.guests = JSON.parse(fs.readFileSync(GUEST_RULES_PATH, "utf8"));
    }
  } else {
    rules.guests = JSON.parse(fs.readFileSync(GUEST_RULES_PATH, "utf8"));
  }

  return rules;
}

module.exports = { loadRules };
