import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.join(__dirname, 'public', 'exact-photos');
const MANIFEST_PATH = path.join(STORAGE_DIR, 'manifest.json');

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function readManifest() {
  ensureStorageDir();
  if (!fs.existsSync(MANIFEST_PATH)) {
    return {
      portrait1: null,
      portrait2: null,
      teddy: null,
      setupHidden: false,
    };
  }
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      portrait1: null,
      portrait2: null,
      teddy: null,
      setupHidden: false,
    };
  }
}

function writeManifest(data: Record<string, unknown>) {
  ensureStorageDir();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  ensureStorageDir();

  // Support large uncompressed exact PNG/JPEG uploads up to 50MB
  app.use(express.json({ limit: '50mb' }));

  // Serve saved exact photos statically
  app.use('/exact-photos', express.static(STORAGE_DIR));

  // API: Get saved exact photos manifest
  app.get('/api/exact-photos', (_req, res) => {
    const manifest = readManifest();
    res.json(manifest);
  });

  // API: Save exact unmodified photo(s) to disk
  app.post('/api/exact-photos', (req, res) => {
    try {
      const current = readManifest();
      const { portrait1, portrait2, teddy, setupHidden, reset } = req.body || {};

      if (reset) {
        const empty = {
          portrait1: null,
          portrait2: null,
          teddy: null,
          setupHidden: false,
        };
        writeManifest(empty);
        res.json(empty);
        return;
      }

      const saveDataUrlToFile = (slot: string, dataUrl: string): string => {
        const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (!match) {
          return dataUrl;
        }
        const mime = match[1];
        const base64Data = match[2];
        const ext = mime.includes('png')
          ? 'png'
          : mime.includes('webp')
          ? 'webp'
          : 'jpg';
        const filename = `${slot}-${Date.now()}.${ext}`;
        const filePath = path.join(STORAGE_DIR, filename);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        return `/exact-photos/${filename}`;
      };

      if (typeof portrait1 === 'string' && portrait1.length > 0) {
        current.portrait1 = portrait1.startsWith('data:image/')
          ? saveDataUrlToFile('portrait1', portrait1)
          : portrait1;
      }
      if (typeof portrait2 === 'string' && portrait2.length > 0) {
        current.portrait2 = portrait2.startsWith('data:image/')
          ? saveDataUrlToFile('portrait2', portrait2)
          : portrait2;
      }
      if (typeof teddy === 'string' && teddy.length > 0) {
        current.teddy = teddy.startsWith('data:image/')
          ? saveDataUrlToFile('teddy', teddy)
          : teddy;
      }
      if (typeof setupHidden === 'boolean') {
        current.setupHidden = setupHidden;
      }

      writeManifest(current);
      res.json(current);
    } catch (err) {
      console.error('Error saving exact photo:', err);
      res.status(500).json({ error: 'Failed to save photo on server' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
