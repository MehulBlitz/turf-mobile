import dotenv from 'dotenv';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentials) {
  console.error('Error: GOOGLE_APPLICATION_CREDENTIALS is not set.');
  console.error('Set the environment variable to the path of your service account JSON file.');
  process.exit(1);
}

const credsPath = path.isAbsolute(credentials) ? credentials : path.resolve(__dirname, '..', credentials);
if (fs.existsSync(credsPath)) {
  try {
    const credsFile = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
    console.log(`Using service account: ${credsFile.client_email}`);
  } catch (readError) {
    console.warn('Could not read service account file for logging:', readError?.message || readError);
  }
} else {
  console.warn(`Service account file not found at ${credsPath}`);
}
const deployFull = () => spawnSync('npx firebase deploy --only hosting,firestore,storage --non-interactive', {
  stdio: 'pipe',
  cwd: path.resolve(__dirname, '..'),
  shell: true,
});

const deployFirestoreHosting = () => spawnSync('npx firebase deploy --only firestore,hosting --non-interactive', {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
  shell: true,
});

const deployHostingOnly = () => spawnSync('npx firebase deploy --only hosting --non-interactive', {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
  shell: true,
});

let result = deployFull();

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

const stderr = result.stderr ? result.stderr.toString() : '';
const stdout = result.stdout ? result.stdout.toString() : '';

const serviceUsageDenied = stderr.includes('Permission denied to get service') || stdout.includes('Permission denied to get service');
const storageBucketDenied = stderr.includes("Permission 'firebasestorage.defaultBucket.get' denied") || stdout.includes("Permission 'firebasestorage.defaultBucket.get' denied");
const storageApiError = stderr.includes('missing required API firebasestorage.googleapis.com') || stdout.includes('missing required API firebasestorage.googleapis.com');
const storageNotSetup = stderr.includes('Firebase Storage has not been set up') || stdout.includes('Firebase Storage has not been set up');

if (result.status !== 0 && serviceUsageDenied) {
  console.warn('Warning: Unable to verify or enable required Firebase APIs due to service account permissions.');
  console.warn('Ensure the service account has Service Usage Consumer or Service Usage Admin role, plus Storage/Admin and Firestore/Admin roles.');
  console.warn('Falling back to hosting-only deploy. Firestore/Storage rules may not be updated.');
  deployHostingOnly();
  process.exit(0);
}

if (result.status !== 0 && (storageBucketDenied || storageApiError || storageNotSetup)) {
  console.warn('Warning: Storage API access is blocked or unconfigured for this Firebase project.');
  console.warn('Falling back to hosting-only deploy. Firestore/Storage rules will not be deployed.');
  deployHostingOnly();
  process.exit(0);
}

if (result.status !== 0) {
  process.stderr.write(stderr);
  process.stdout.write(stdout);
  process.exit(result.status);
}

process.exit(0);
