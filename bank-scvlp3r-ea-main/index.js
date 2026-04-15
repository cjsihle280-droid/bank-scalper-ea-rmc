#!/usr/bin/env node

/**
 * Entry point for Electron main process
 * This wrapper makes it compatible with package.json "main" field
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainPath = path.join(__dirname, 'electron', 'main.ts');

// For development, use tsx to run TypeScript
// For production, use compiled electron/main.js
const devEnvironment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

if (devEnvironment) {
  // Development: run with tsx
  import('tsx').then(({ spawn: tsxSpawn }) => {
    tsxSpawn('tsx', [mainPath], { stdio: 'inherit' });
  });
} else {
  // Production: run compiled JS
  const mainJs = path.join(__dirname, 'dist-electron', 'main.js');
  spawn('node', [mainJs], { stdio: 'inherit' });
}
