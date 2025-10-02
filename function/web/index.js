const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");
const { BlobServiceClient } = require("@azure/storage-blob");
const AdmZip = require("adm-zip");
const fetch = require("node-fetch");

// Log file path
const logFilePath = path.join(os.tmpdir(), "webapp-build.log");
function log(message) {
  console.log(message);
  try {
    fs.appendFileSync(
      logFilePath,
      `[${new Date().toISOString()}] ${message}\n`
    );
  } catch (err) {
    console.error("Failed to write log file:", err);
  }
}

module.exports = async function (context, req) {
  try {
    // Raw URL of your ZIP in GitHub
    const zipUrl =
      "https://github.com/nicowyss/watchtra/raw/main/releases/webapp-v1.0.zip";

    // Env variables
    const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
    const containerName = "watchtra";
    const sasToken = process.env.STORAGE_SAS_TOKEN;

    // Temp paths
    const tempDir = path.join(os.tmpdir(), "watchtra");
    const downloadedZipPath = path.join(os.tmpdir(), "webapp-v1.0.zip");
    const finalZipPath = path.join(os.tmpdir(), "webapp-v1.0-final.zip");

    log("🔹 Preparing temporary workspace...");

    // Always clean up old dirs/files
    safeDelete(tempDir);
    safeDelete(downloadedZipPath);
    safeDelete(finalZipPath);

    // Download, extract, and clean zip
    const webappPath = await downloadAndExtractZip(
      zipUrl,
      downloadedZipPath,
      tempDir
    );

    // Build the webapp
    log("🔹 Building webapp at: " + webappPath);
    await execCommand(["install"], webappPath);
    await execCommand(["run", "build"], webappPath, {
      REACT_APP_FUNCTION_URL: process.env.REACT_APP_FUNCTION_URL,
    });

    // Zip the build folder
    const buildPath = path.join(webappPath, "build");
    log("🔹 Zipping build folder: " + buildPath);
    const zip = new AdmZip();
    zip.addLocalFolder(buildPath);
    zip.writeZip(finalZipPath);
    log("🔹 Final zip created at: " + finalZipPath);

    // Upload to Azure Blob Storage
    log("🔹 Uploading zip to Azure Blob Storage...");
    await uploadFileToBlobWithSAS(
      "webapp-v1.0.zip",
      finalZipPath,
      storageAccountName,
      containerName,
      sasToken
    );

    // Upload log file itself
    log("🔹 Uploading build log...");
    await uploadFileToBlobWithSAS(
      "webapp-build.log",
      logFilePath,
      storageAccountName,
      containerName,
      sasToken
    );

    log("✅ Webapp build uploaded successfully!");
    context.res = { status: 200, body: "Webapp build uploaded successfully!" };
  } catch (err) {
    log("❌ Error: " + err);
    context.res = { status: 500, body: err.toString() };
  }
};

// Safe delete helper
function safeDelete(targetPath) {
  try {
    if (fs.existsSync(targetPath)) {
      const stat = fs.lstatSync(targetPath);
      if (stat.isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
        log(`🗑️ Deleted old folder: ${targetPath}`);
      } else {
        fs.unlinkSync(targetPath);
        log(`🗑️ Deleted old file: ${targetPath}`);
      }
    }
  } catch (err) {
    log(`⚠️ Failed to delete ${targetPath}: ${err}`);
  }
}

// Download + extract
async function downloadAndExtractZip(zipUrl, zipPath, extractPath) {
  log(`🔹 Downloading ZIP from ${zipUrl}...`);

  safeDelete(extractPath);
  fs.mkdirSync(extractPath, { recursive: true });

  const res = await fetch(zipUrl);
  if (!res.ok) throw new Error(`Failed to download ZIP: ${res.statusText}`);
  const buffer = await res.buffer();
  fs.writeFileSync(zipPath, buffer);

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(extractPath, true);
  safeDelete(zipPath);

  // find the actual extracted folder
  const entries = fs.readdirSync(extractPath);
  let rootPath = extractPath;
  if (entries.length === 1) {
    const candidate = path.join(extractPath, entries[0]);
    if (fs.lstatSync(candidate).isDirectory()) {
      rootPath = candidate;
    }
  }

  log("🔹 Using root path: " + rootPath);
  log("🔹 Files in root path: " + fs.readdirSync(rootPath).join(", "));
  return rootPath;
}

// Run npm
function execCommand(args, cwd, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    try {
      const binPath = path.join(cwd, "node_modules", ".bin");
      if (fs.existsSync(binPath)) {
        for (const file of fs.readdirSync(binPath)) {
          fs.chmodSync(path.join(binPath, file), 0o755);
        }
      }
    } catch (err) {
      log("⚠️ Failed to chmod .bin files: " + err);
    }

    const env = { ...process.env, ...extraEnv };

    log(
      `🔹 Running npm ${args.join(" ")} with env: ${JSON.stringify(extraEnv)}`
    );

    const child = spawn("npm", args, { cwd, env, shell: true });
    child.stdout.on("data", (data) => log(data.toString().trim()));
    child.stderr.on("data", (data) => log(data.toString().trim()));
    child.on("error", reject);
    child.on("close", (code) =>
      code !== 0
        ? reject(new Error(`npm ${args.join(" ")} failed with ${code}`))
        : resolve()
    );
  });
}

// Upload to Azure Blob
async function uploadFileToBlobWithSAS(
  blobName,
  filePath,
  accountName,
  containerName,
  sasToken
) {
  const blobServiceUrl = `https://${accountName}.blob.core.windows.net/?${sasToken}`;
  const blobServiceClient = new BlobServiceClient(blobServiceUrl);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadFile(filePath, {
    blobHTTPHeaders: { blobContentType: "application/zip" },
  });
  log(`🔹 Upload of ${blobName} completed`);
}
