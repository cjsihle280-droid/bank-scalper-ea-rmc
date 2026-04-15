import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import isDev from 'electron-is-dev';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null;

// Configure auto-updater
if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window events
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle navigation for SPA
  mainWindow.webContents.on('will-navigate', (event) => {
    if (!isDev) return;
  });

  // Allow navigation within the app domain only
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
};

app.on('ready', () => {
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Create application menu
const createMenu = () => {
  const isMac = process.platform === 'darwin';

  const template: any[] = [
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About BANK SCALPER EA',
          click: () => {
            // Create about window
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// IPC handlers for auto-update
ipcMain.handle('check-for-updates', async () => {
  if (isDev) return { available: false };
  try {
    const result = await autoUpdater.checkForUpdates();
    return result?.updateInfo;
  } catch (err) {
    console.error('Update check failed:', err);
    return null;
  }
});

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall();
});

// Handle app ready
app.on('web-contents-created', (event, contents) => {
  // CSP header for security
  contents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['default-src \'self\''],
      },
    });
  });
});
