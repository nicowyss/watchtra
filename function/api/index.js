const fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    const file = req.query.file;
    if (!file) {
      context.res = { status: 400, body: { error: "Missing file query parameter" } };
      return;
    }

    const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
    const containerName = process.env.STORAGE_CONTAINER_NAME;
    const sasToken = process.env.STORAGE_SAS_TOKEN;

    const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${file}?${sasToken}`;
    const response = await fetch(blobUrl);
    const data = await response.json();

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: data
    };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: "Unable to fetch file" } };
  }
};

module.exports = async function (context, req) {
  try {
    const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
    const containerName = process.env.STORAGE_CONTAINER_NAME;
    const sasToken = process.env.STORAGE_SAS_TOKEN; // optional, include "?" if present

    if (!storageAccountName || !containerName) {
      throw new Error("Missing STORAGE_ACCOUNT_NAME or STORAGE_CONTAINER_NAME environment variables");
    }

    // Construct the full storage URL dynamically
    const storageUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}${sasToken ? (sasToken.startsWith('?') ? sasToken : '?' + sasToken) : ''}`;

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: {
        STORAGE_URL: storageUrl,
        FUNCTION_URL: process.env.FUNCTION_URL,
        env: process.env.ENV || "production"
      }
    };
  } catch (err) {
    context.log.error("Error generating config:", err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: "Unable to generate config.json" }
    };
  }
};

