const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const path = require("path");

const MEMBER_RULES_PATH = path.join(__dirname, "../rules/members.json");
const GUEST_RULES_PATH = path.join(__dirname, "../rules/guests.json");

const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
const containerName = process.env.STORAGE_CONTAINER_NAME;
const sasToken = process.env.STORAGE_SAS_TOKEN; // optional

let blobClient = null;
if (storageAccountName && containerName) {
  const blobServiceClient = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net${sasToken ? '?' + sasToken : ''}`
  );
  blobClient = blobServiceClient.getContainerClient(containerName);
} else {
  console.warn("⚠️ STORAGE_ACCOUNT_NAME or STORAGE_CONTAINER_NAME not set. Using local JSON only.");
}

async function loadRules() {
  const rules = { members: null, guests: null };

  async function fetchBlob(key, fallbackPath) {
    if (blobClient) {
      try {
        const blockBlobClient = blobClient.getBlockBlobClient(key);
        const download = await blockBlobClient.download(0);
        return JSON.parse((await streamToBuffer(download.readableStreamBody)).toString());
      } catch (err) {
        console.warn(`⚠️ Could not fetch ${key} from blob. Falling back to local JSON.`);
      }
    }
    return JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
  }

  rules.members = await fetchBlob("members.json", MEMBER_RULES_PATH);
  rules.guests = await fetchBlob("guests.json", GUEST_RULES_PATH);

  return rules;
}

async function streamToBuffer(readableStream) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

module.exports = { loadRules };
