// src/utils/loadRules.js
const fs = require("fs");
const path = require("path");

// Local JSON fallback paths
const MEMBER_RULES_PATH = path.join(__dirname, "../rules/members.json");
const GUEST_RULES_PATH = path.join(__dirname, "../rules/guests.json");

// Function URL from env vars (set in Azure WebApp or locally via .env)
const functionUrl = process.env.REACT_APP_FUNCTION_URL || "http://localhost:7071/api/api";

async function loadRules() {
  const rules = { members: null, guests: null };

  async function fetchFromFunction(file, fallbackPath) {
    if (process.env.REACT_APP_FUNCTION_URL) {
      try {
        const res = await fetch(`${functionUrl}?file=${file}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch ${file} from Function API`);
        }
        return await res.json();
      } catch (err) {
        console.warn(
          `⚠️ Could not fetch ${file} from Function API. Falling back to local JSON.`
        );
      }
    }
    return JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
  }

  rules.members = await fetchFromFunction("members.json", MEMBER_RULES_PATH);
  rules.guests = await fetchFromFunction("guests.json", GUEST_RULES_PATH);

  return rules;
}

module.exports = { loadRules };
