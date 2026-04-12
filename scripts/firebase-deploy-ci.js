import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const token = process.env.FIREBASE_TOKEN;
if (!token) {
  console.error('Error: FIREBASE_TOKEN is not set.');
  console.error('Set FIREBASE_TOKEN and run: npm run firebase:deploy:ci');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const result = spawnSync('npx', ['firebase', 'deploy', '--only', 'hosting', '--token', token], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
