const fetch = require("node-fetch");

module.exports = async function (context, req) {
  const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
  const containerName = "watchtra";
  const sasToken = process.env.STORAGE_SAS_TOKEN;
  const functionUrl = process.env.REACT_APP_FUNCTION_URL;

  try {
    // Handle query for blob file
    const file = req.query.file;
    if (file) {
      const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${file}?${sasToken}`;
      const response = await fetch(blobUrl);
      const data = await response.json();

      context.res = {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: data,
      };
      return;
    }

    // If no file, return the config
    const storageUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}`;
    const storageSAS = sasToken || "";

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        STORAGE_URL: storageUrl,
        STORAGE_SAS: storageSAS,
        FUNCTION_URL: functionUrl,
        env: process.env.ENV || "production",
      },
    };
  } catch (err) {
    context.log.error("Error in Azure Function:", err);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: "Internal server error" },
    };
  }
};
