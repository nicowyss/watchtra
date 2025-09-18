const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, myTimer) {
  const account = process.env.STORAGE_ACCOUNT_NAME;
  const container = process.env.STORAGE_CONTAINER_NAME || "watchtra";

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  const containerClient = blobServiceClient.getContainerClient(container);

  // Example: Collect some data
  const data = {
    lastUpdated: new Date().toISOString(),
    findings: [
      { id: 1, name: "Alice", userType: "Member", issues: {} },
      { id: 2, name: "Bob", userType: "Guest", issues: { department: null } },
    ],
  };

  // Save as blob
  const blobName = "users-results.json";
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.upload(
    JSON.stringify(data, null, 2),
    Buffer.byteLength(JSON.stringify(data))
  );

  context.log(`✅ Updated ${blobName} at ${data.lastUpdated}`);
};
