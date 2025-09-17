// app/cosmos.js
require("dotenv").config();
const { CosmosClient } = require("@azure/cosmos");

// Cosmos DB client setup
const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

const database = client.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER);

/**
 * Save findings to Cosmos DB
 */
async function saveFindings(findings) {
  return Promise.all(
    findings.map((f) =>
      container.items.upsert(f).catch((err) => {
        console.error("Failed to save user:", f.id, err.message);
      })
    )
  );
}

module.exports = { saveFindings };
