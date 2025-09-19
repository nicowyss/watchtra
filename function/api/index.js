const fetch = require("node-fetch");

module.exports = async function (context, req) {
  const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
  const containerName = process.env.STORAGE_CONTAINER_NAME;
  const sasToken = process.env.STORAGE_SAS_TOKEN;
  const functionUrl = process.env.FUNCTION_URL;
  const webappUrl = process.env.WEBAPP_URL; // your frontend URL

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
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": webappUrl || "*", // allow your webapp
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
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": webappUrl || "*",
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
