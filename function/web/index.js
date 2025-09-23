const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const { BlobServiceClient } = require('@azure/storage-blob');
const AdmZip = require('adm-zip');
const fetch = require('node-fetch');

module.exports = async function (context, req) {
    try {
        // Raw URL of your ZIP in GitHub
        const zipUrl = 'https://github.com/nicowyss/watchtra/raw/main/releases/webapp-v1.0.zip';

        // Env variables
        const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
        const containerName = process.env.STORAGE_CONTAINER_NAME;
        const sasToken = process.env.STORAGE_SAS_TOKEN;

        // Temp paths
        const tempDir = path.join(os.tmpdir(), 'watchtra');
        const downloadedZipPath = path.join(os.tmpdir(), 'webapp-v1.0.zip');
        const finalZipPath = path.join(os.tmpdir(), 'webapp-v1.0.zip');

        console.log('🔹 Temporary extraction directory:', tempDir);

        // Download, extract, and clean zip
        const webappPath = await downloadAndExtractZip(zipUrl, downloadedZipPath, tempDir);

        // Build the webapp
        console.log('🔹 Building webapp at:', webappPath);
        await execCommand(['install'], webappPath);
        await execCommand(['run', 'build'], webappPath);

        // Zip the build folder
        const buildPath = path.join(webappPath, 'build');
        console.log('🔹 Zipping build folder:', buildPath);
        const zip = new AdmZip();
        zip.addLocalFolder(buildPath);
        zip.writeZip(finalZipPath);
        console.log('🔹 Final zip created at:', finalZipPath);

        // Upload to Azure Blob Storage
        console.log('🔹 Uploading zip to Azure Blob Storage...');
        await uploadFileToBlobWithSAS('webapp-v1.0.zip', finalZipPath, storageAccountName, containerName, sasToken);

        console.log('✅ Webapp build uploaded successfully!');
        context.res = { status: 200, body: 'Webapp build uploaded successfully!' };
    } catch (err) {
        console.error('❌ Error:', err);
        context.res = { status: 500, body: err.toString() };
    }
};

// Helper: download, extract, and remove zip
async function downloadAndExtractZip(zipUrl, zipPath, extractPath) {
    console.log(`🔹 Downloading ZIP from ${zipUrl}...`);

    // Ensure clean extraction dir
    if (fs.existsSync(extractPath)) {
        console.log(`🔹 Cleaning old folder at ${extractPath}...`);
        fs.rmSync(extractPath, { recursive: true, force: true });
    }
    fs.mkdirSync(extractPath, { recursive: true });

    // Download zip to /tmp
    const res = await fetch(zipUrl);
    if (!res.ok) throw new Error(`Failed to download ZIP: ${res.statusText}`);
    const buffer = await res.buffer();
    fs.writeFileSync(zipPath, buffer);
    console.log('🔹 Zip downloaded to', zipPath);

    // Extract zip
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);
    console.log('🔹 Zip extracted to', extractPath);

    // Delete the downloaded zip
    fs.unlinkSync(zipPath);
    console.log('🔹 Removed downloaded zip:', zipPath);

    // Return extracted root path
    return extractPath;
}

// Helper: run npm commands
function execCommand(args, cwd) {
    return new Promise((resolve, reject) => {
        const child = spawn('npm', args, { cwd, env: process.env, shell: true });
        child.stdout.on('data', data => console.log(data.toString().trim()));
        child.stderr.on('data', data => console.error(data.toString().trim()));
        child.on('error', reject);
        child.on('close', code => code !== 0 ? reject(new Error(`npm ${args.join(' ')} failed with ${code}`)) : resolve());
    });
}

// Helper: upload to Azure Blob Storage
async function uploadFileToBlobWithSAS(blobName, filePath, accountName, containerName, sasToken) {
    const blobServiceUrl = `https://${accountName}.blob.core.windows.net/?${sasToken}`;
    const blobServiceClient = new BlobServiceClient(blobServiceUrl);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadFile(filePath, { blobHTTPHeaders: { blobContentType: 'application/zip' } });
    console.log(`🔹 Upload of ${blobName} completed`);
}
