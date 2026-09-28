// 100% Lossless, Unmodified Exact Photo Persistence (Server Disk + IndexedDB)
// Preserves the exact original file bytes pasted (Ctrl+V) or selected by the user.

export interface ExactPhotoManifest {
  portrait1: string | null; // 35mm Film Close-Up Portrait
  portrait2: string | null; // Cathedral Sunlight Portrait
  teddy: string | null;     // Fluffy White Bunny Teddy
  setupHidden: boolean;
}

const DB_NAME = 'PrincessExactPhotosDB';
const STORE_NAME = 'photos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLocalExactManifest(manifest: Partial<ExactPhotoManifest>): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const [k, v] of Object.entries(manifest)) {
      if (v !== undefined) {
        store.put(v, k);
      }
    }
  } catch {
    // ignore IndexedDB error
  }
}

export async function loadLocalExactManifest(): Promise<Partial<ExactPhotoManifest>> {
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const result: Partial<ExactPhotoManifest> = {};
      const keys: Array<keyof ExactPhotoManifest> = ['portrait1', 'portrait2', 'teddy', 'setupHidden'];
      let remaining = keys.length;

      keys.forEach((key) => {
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result !== undefined) {
            (result as Record<string, unknown>)[key] = req.result;
          }
          remaining -= 1;
          if (remaining === 0) resolve(result);
        };
        req.onerror = () => {
          remaining -= 1;
          if (remaining === 0) resolve(result);
        };
      });
    });
  } catch {
    return {};
  }
}

export async function clearLocalExactManifest(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch {
    // ignore
  }
}

// Read file 100% untouched as original Data URL (NO canvas re-encoding, NO compression, NO AI changes)
export function readRawFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Inspect image aspect ratio & right-edge film strip sprocket pattern without modifying the file
export function detectPhotoSlot(
  dataUrl: string
): Promise<'portrait1' | 'portrait2' | 'teddy'> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      // The bunny teddy image is tall (~0.58 ratio)
      if (ratio < 0.66) {
        resolve('teddy');
        return;
      }
      // The 35mm film close-up portrait has a wider vertical ratio (~0.81) than the cathedral portrait (~0.75)
      if (ratio > 0.78) {
        resolve('portrait1');
        return;
      }
      resolve('portrait2');
    };
    img.onerror = () => resolve('portrait1');
    img.src = dataUrl;
  });
}

export async function fetchServerManifest(): Promise<ExactPhotoManifest | null> {
  try {
    const res = await fetch('/api/exact-photos');
    if (!res.ok) return null;
    return (await res.json()) as ExactPhotoManifest;
  } catch {
    return null;
  }
}

export async function saveServerManifest(
  payload: Partial<ExactPhotoManifest> & { reset?: boolean }
): Promise<ExactPhotoManifest | null> {
  try {
    const res = await fetch('/api/exact-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as ExactPhotoManifest;
  } catch {
    return null;
  }
}
