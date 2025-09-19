const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const simpleGit = require('simple-git');
const { BlobServiceClient } = require('@azure/storage-blob');
const AdmZip = require('adm-zip');
const { Console } = require('console');

module.exports = async function (context, req) {
    try {
        const repoUrl = 'https://github.com/nicowyss/watchtra.git';
        const branch = 'main';
        const localPath = path.join(__dirname, 'repo'); // temporary clone path

        // New env variables
        const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
        const containerName = process.env.STORAGE_CONTAINER_NAME;
        const sasToken = process.env.STORAGE_SAS_TOKEN;

        // 1️⃣ Clone or pull repo
        const git = simpleGit();
        if (fs.existsSync(localPath)) {
            context.log('Repo exists, pulling latest changes...');
            await git.cwd(localPath).pull('origin', branch);
        } else {
            context.log('Cloning repo...');
            await git.clone(repoUrl, localPath, { '--branch': branch });
        }

        // 2️⃣ Build the webapp
        const webappPath = path.join(localPath, 'webapp');
        context.log('Building webapp at:', webappPath);

        context.log('Installing dependencies...');
        await execCommand('npm install', webappPath, context);

        context.log('Running build...');
        await execCommand('npm run build', webappPath, context);

        // 3️⃣ Zip the build folder
        const buildPath = path.join(webappPath, 'build'); // adjust if needed
        const zip = new AdmZip();
        zip.addLocalFolder(buildPath);
        const zipPath = path.join(__dirname, 'webapp-v1.0.zip');
        zip.writeZip(zipPath);

        // 4️⃣ Upload zip to Azure Blob Storage using SAS token
        console.log('Uploading zip to Azure Blob Storage...');
        await uploadFileToBlobWithSAS('webapp-v1.0.zip', zipPath, storageAccountName, containerName, sasToken);

        context.log('✅ Webapp build uploaded successfully!');
        context.res = { status: 200, body: 'Webapp build uploaded successfully!' };
    } catch (err) {
        context.log.error('Error:', err);
        context.res = { status: 500, body: err.toString() };
    }
};

// Helper: execute shell commands with streaming logs
function execCommand(command, cwd, context) {
    return new Promise((resolve, reject) => {
        const isWin = process.platform === 'win32';
        const cmd = isWin ? 'npm.cmd' : 'npm';

        // Split into args
        const args = command.startsWith('npm') ? command.split(' ').slice(1) : command.split(' ');

        const child = spawn(command.startsWith('npm') ? cmd : args[0], args, {
            cwd,
            env: process.env,
            shell: true
        });

        child.stdout.on('data', (data) => {
            context.log(data.toString());
        });

        child.stderr.on('data', (data) => {
            context.log.error(data.toString());
        });

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`${command} failed with exit code ${code}`));
            } else {
                resolve();
            }
        });
    });
}

// Helper: upload file to Azure Blob Storage using SAS token
async function uploadFileToBlobWithSAS(blobName, filePath, accountName, containerName, sasToken) {
    const blobServiceUrl = `https://${accountName}.blob.core.windows.net/?${sasToken}`;
    const blobServiceClient = new BlobServiceClient(blobServiceUrl);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadFile(filePath, {
        blobHTTPHeaders: { blobContentType: 'application/zip' },
    });
}
