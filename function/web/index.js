const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const { BlobServiceClient } = require('@azure/storage-blob');
const AdmZip = require('adm-zip');
const fetch = require('node-fetch'); // make sure to add to package.json

module.exports = async function (context, req) {
    try {
        const repoUrl = 'https://download-directory.github.io/?url=https://github.com/nicowyss/watchtra/tree/main/webapp&output=zip';

        // Env variables
        const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
        const containerName = process.env.STORAGE_CONTAINER_NAME;
        const sasToken = process.env.STORAGE_SAS_TOKEN;

        // Use os.tmpdir() for all temporary work
        const tempDir = path.join(os.tmpdir(), 'watchtra_repo');
        console.log('🔹 Temporary directory:', tempDir);

        // 1️⃣ Clean old repo and download fresh ZIP
        const webappPath = await downloadRepoZip(repoUrl, tempDir);

        console.log('🔹 Building webapp at:', webappPath);

        console.log('🔹 Installing dependencies...');
        await execCommand(['install'], webappPath);

        console.log('🔹 Running build...');
        await execCommand(['run', 'build'], webappPath);

        // 3️⃣ Zip the build folder
        const buildPath = path.join(webappPath, 'build');
        console.log('🔹 Zipping build folder:', buildPath);
        const zip = new AdmZip();
        zip.addLocalFolder(buildPath);
        const zipPath = path.join(os.tmpdir(), 'webapp-v1.0.zip');
        zip.writeZip(zipPath);
        console.log('🔹 Zip created at:', zipPath);

        // 4️⃣ Upload zip to Azure Blob Storage using SAS token
        console.log('🔹 Uploading zip to Azure Blob Storage...');
        await uploadFileToBlobWithSAS('webapp-v1.0.zip', zipPath, storageAccountName, containerName, sasToken);

        console.log('✅ Webapp build uploaded successfully!');
        context.res = { status: 200, body: 'Webapp build uploaded successfully!' };
    } catch (err) {
        console.error('❌ Error:', err);
        context.res = { status: 500, body: err.toString() };
    }
};

// Helper: download GitHub repo ZIP (handles arbitrary internal folder names)
async function downloadRepoZip(repoUrl, targetPath) {
    console.log(`🔹 Downloading ZIP from ${repoUrl}...`);

    // Clean target path
    if (fs.existsSync(targetPath)) {
        console.log(`🔹 Cleaning old repo at ${targetPath}...`);
        fs.rmSync(targetPath, { recursive: true, force: true });
    }
    fs.mkdirSync(targetPath, { recursive: true });

    // download zip directly from given URL
    const res = await fetch(repoUrl);
    if (!res.ok) throw new Error(`Failed to download repo: ${res.statusText}`);
    const buffer = await res.buffer();

    // Save to temp file and extract
    const zipPath = path.join(targetPath, 'repo.zip');
    fs.writeFileSync(zipPath, buffer);
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(targetPath, true);
    console.log('🔹 Repo extracted to', targetPath);

    // Detect first subfolder (download-directory.github.io creates one)
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    const firstFolder = entries.find(e => e.isDirectory());
    if (!firstFolder) throw new Error('No folder found inside extracted ZIP');
    const webappPath = path.join(targetPath, firstFolder.name);
    console.log('🔹 Using webapp path:', webappPath);

    return webappPath;
}

// Helper: run npm commands with spawn
function execCommand(args, cwd) {
    return new Promise((resolve, reject) => {
        console.log(`🔹 Running command: npm ${args.join(' ')} in ${cwd}`);

        const child = spawn('npm', args, {
            cwd,
            env: process.env,
            shell: true
        });

        child.stdout.on('data', (data) => {
            console.log(data.toString().trim());
        });

        child.stderr.on('data', (data) => {
            console.error(data.toString().trim());
        });

        child.on('error', (err) => reject(err));

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`npm ${args.join(' ')} failed with exit code ${code}`));
            } else {
                console.log(`🔹 Command npm ${args.join(' ')} completed successfully`);
                resolve();
            }
        });
    });
}

// Helper: upload file to Azure Blob Storage using SAS token
async function uploadFileToBlobWithSAS(blobName, filePath, accountName, containerName, sasToken) {
    console.log(`🔹 Uploading ${blobName} to container ${containerName}...`);
    const blobServiceUrl = `https://${accountName}.blob.core.windows.net/?${sasToken}`;
    const blobServiceClient = new BlobServiceClient(blobServiceUrl);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadFile(filePath, {
        blobHTTPHeaders: { blobContentType: 'application/zip' },
    });
    console.log(`🔹 Upload of ${blobName} completed`);
}
