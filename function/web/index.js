const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const { BlobServiceClient } = require('@azure/storage-blob');
const AdmZip = require('adm-zip');
const fetch = require('node-fetch'); // make sure to add to package.json

module.exports = async function (context, req) {
    try {
        const repoUrl = 'https://github.com/nicowyss/watchtra';
        const branch = 'main';

        // Env variables
        const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
        const containerName = process.env.STORAGE_CONTAINER_NAME;
        const sasToken = process.env.STORAGE_SAS_TOKEN;

        // Use os.tmpdir() for all temporary work
        const tempDir = path.join(os.tmpdir(), 'watchtra_repo');
        console.log('🔹 Temporary directory:', tempDir);

        // 1️⃣ Clean old repo and download fresh ZIP
        const extractedRepoPath = await downloadRepoZip(repoUrl, branch, tempDir);

        // 2️⃣ Build the webapp
        const webappPath = path.join(extractedRepoPath, 'webapp');
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

// Helper: download GitHub repo ZIP
async function downloadRepoZip(repoUrl, branch, targetPath) {
    const zipUrl = `${repoUrl}/archive/refs/heads/${branch}.zip`;
    console.log(`🔹 Downloading repo ZIP from ${zipUrl}...`);

    // Clean target path
    if (fs.existsSync(targetPath)) {
        console.log(`🔹 Cleaning old repo at ${targetPath}...`);
        fs.rmSync(targetPath, { recursive: true, force: true });
    }
    fs.mkdirSync(targetPath, { recursive: true });

    const res = await fetch(zipUrl);
    if (!res.ok) throw new Error(`Failed to download repo: ${res.statusText}`);
    const buffer = await res.buffer();

    const zip = new AdmZip(buffer);
    zip.extractAllTo(targetPath, true);
    console.log('🔹 Repo extracted');

    // GitHub wraps content in "<repo>-<branch>" folder
    const extractedFolder = path.join(targetPath, `watchtra-${branch}`);

    // Move contents directly into targetPath (flatten)
    console.log('🔹 Flattening extracted folder...');
    for (const file of fs.readdirSync(extractedFolder)) {
        fs.renameSync(path.join(extractedFolder, file), path.join(targetPath, file));
    }
    fs.rmSync(extractedFolder, { recursive: true, force: true });

    console.log('🔹 Extraction complete, path ready:', targetPath);
    return targetPath;
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
