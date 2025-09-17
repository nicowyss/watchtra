const axios = require("axios");

// Load .env only if it exists (for local development)
if (process.env.NODE_ENV !== "production") {
  const path = require("path");
  const fs = require("fs");
  const envPath = path.resolve(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath });
  }
}

const TENANT_ID = process.env.TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const GRAPH_SCOPE = "https://graph.microsoft.com/.default";

if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
  throw new Error("TENANT_ID, CLIENT_ID, and CLIENT_SECRET must be set");
}

async function getGraphToken() {
  try {
    const resp = await axios.post(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: CLIENT_ID,
        scope: GRAPH_SCOPE,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return resp.data.access_token;
  } catch (err) {
    console.error("Error fetching Graph token:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { getGraphToken };
