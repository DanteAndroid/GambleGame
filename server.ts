import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import { GAMBLE_RECORDS, MANGA_SERIES, UPCOMING_MANGA_SHELF } from './src/data/gambles';
import {
  detectImageFormat,
  EMPTY_OVERRIDES,
  isSafeLocalImagePath,
  isStrictLocalhostRequest,
  sanitizeCopyPatch,
  type ApprovedOverrides,
  type ContentSubmission,
  type SubmissionType,
} from './src/utils/submissions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT ?? 3000);
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const STORE_PATH = path.resolve(DATA_DIR, 'store.json');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PENDING_SUBMISSIONS = 120;

interface PersistentStore {
  overrides: ApprovedOverrides;
  submissions: ContentSubmission[];
}

const VALID_SERIES_TARGETS = new Map<string, string>();
for (const s of MANGA_SERIES) {
  VALID_SERIES_TARGETS.set(s.id, `《${s.title}》`);
}
for (const u of UPCOMING_MANGA_SHELF) {
  VALID_SERIES_TARGETS.set(u.id, `《${u.title}》`);
}

const VALID_GAMBLE_TARGETS = new Map<string, string>();
for (const g of GAMBLE_RECORDS) {
  const seriesName = VALID_SERIES_TARGETS.get(g.seriesId) ?? '';
  VALID_GAMBLE_TARGETS.set(g.id, `${seriesName} ${g.title}`.trim());
}

function ensureDataDirs(): void {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function cloneEmptyOverrides(): ApprovedOverrides {
  return {
    seriesCovers: { ...EMPTY_OVERRIDES.seriesCovers },
    gambleArtworks: { ...EMPTY_OVERRIDES.gambleArtworks },
    gambleGalleries: { ...EMPTY_OVERRIDES.gambleGalleries },
    gambleCopies: { ...EMPTY_OVERRIDES.gambleCopies },
  };
}

function loadStore(): PersistentStore {
  ensureDataDirs();
  if (!fs.existsSync(STORE_PATH)) {
    return { overrides: cloneEmptyOverrides(), submissions: [] };
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PersistentStore>;
    const overrides: ApprovedOverrides = {
      seriesCovers:
        parsed.overrides && typeof parsed.overrides.seriesCovers === 'object'
          ? parsed.overrides.seriesCovers
          : {},
      gambleArtworks:
        parsed.overrides && typeof parsed.overrides.gambleArtworks === 'object'
          ? parsed.overrides.gambleArtworks
          : {},
      gambleGalleries:
        parsed.overrides && typeof parsed.overrides.gambleGalleries === 'object'
          ? parsed.overrides.gambleGalleries
          : {},
      gambleCopies:
        parsed.overrides && typeof parsed.overrides.gambleCopies === 'object'
          ? parsed.overrides.gambleCopies
          : {},
    };
    const submissions = Array.isArray(parsed.submissions) ? parsed.submissions : [];
    return { overrides, submissions };
  } catch {
    return { overrides: cloneEmptyOverrides(), submissions: [] };
  }
}

function saveStore(store: PersistentStore): void {
  ensureDataDirs();
  const tmpPath = `${STORE_PATH}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tmpPath, STORE_PATH);
}

function isRequestLocalhost(req: Request): boolean {
  return isStrictLocalhostRequest({
    remoteAddress: req.socket.remoteAddress,
    host: req.headers.host,
    forwardedFor: req.headers['x-forwarded-for'],
    forwarded: req.headers.forwarded,
    realIp: req.headers['x-real-ip'],
    cfConnectingIp: req.headers['cf-connecting-ip'],
    origin: typeof req.headers.origin === 'string' ? req.headers.origin : null,
    method: req.method,
  });
}

function requireLocalhost(req: Request, res: Response, next: NextFunction): void {
  if (!isRequestLocalhost(req)) {
    res.status(403).json({ error: '仅限本机（localhost）访问审核功能' });
    return;
  }
  next();
}

function isImageStillReferenced(store: PersistentStore, imageUrl: string): boolean {
  if (Object.values(store.overrides.seriesCovers).includes(imageUrl)) return true;
  if (Object.values(store.overrides.gambleArtworks).includes(imageUrl)) return true;
  for (const list of Object.values(store.overrides.gambleGalleries)) {
    if (list.includes(imageUrl)) return true;
  }
  return store.submissions.some(
    (s) => s.status === 'pending' && s.imageUrl === imageUrl
  );
}

function safeUnlinkUpload(imageUrl: string | undefined, store: PersistentStore): void {
  if (!imageUrl || !isSafeLocalImagePath(imageUrl)) return;
  if (!imageUrl.startsWith('/api/uploads/')) return;
  if (isImageStillReferenced(store, imageUrl)) return;

  const filename = imageUrl.slice('/api/uploads/'.length);
  if (!/^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/.test(filename)) return;
  const resolved = path.resolve(UPLOADS_DIR, filename);
  if (!resolved.startsWith(UPLOADS_DIR + path.sep)) return;
  try {
    if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved);
    }
  } catch {
    // Ignore cleanup errors
  }
}

function decodeAndSaveUploadedImage(dataUrl: unknown): { imageUrl: string } | { error: string } {
  if (typeof dataUrl !== 'string') {
    return { error: '请先选择要上传的图片文件' };
  }
  const match = /^data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=\s]+)$/.exec(
    dataUrl.trim()
  );
  if (!match) {
    return { error: '仅支持 PNG、JPG、WebP 或 GIF 格式的图片' };
  }

  const base64Body = match[2].replace(/\s+/g, '');
  const estimatedBytes = Math.floor((base64Body.length * 3) / 4);
  if (estimatedBytes === 0 || estimatedBytes > MAX_IMAGE_BYTES) {
    return { error: '图片体积不能超过 5 MB' };
  }

  const buffer = Buffer.from(base64Body, 'base64');
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    return { error: '图片体积不能超过 5 MB' };
  }

  const detected = detectImageFormat(buffer);
  if (!detected) {
    return { error: '无法识别的图片文件头，仅支持真实 PNG/JPG/WebP/GIF 图片' };
  }

  ensureDataDirs();
  const filename = `${crypto.randomUUID()}.${detected.ext}`;
  const targetPath = path.resolve(UPLOADS_DIR, filename);
  if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
    return { error: '文件存储路径校验失败' };
  }

  fs.writeFileSync(targetPath, buffer);
  return { imageUrl: `/api/uploads/${filename}` };
}

let store = loadStore();

async function createServer(): Promise<void> {
  const app = express();
  app.disable('x-powered-by');

  // Public: Read approved overrides
  app.get('/api/overrides', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(store.overrides);
  });

  // Public: Serve validated uploaded raster images with strict confinement
  app.get('/api/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    if (!/^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/.test(filename)) {
      res.status(400).json({ error: '无效的图片路径' });
      return;
    }

    const resolved = path.resolve(UPLOADS_DIR, filename);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(resolved)) {
      res.status(404).json({ error: '图片不存在' });
      return;
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(resolved);
  });

  // Public: Submit a cover replacement, gamble image upload, or copy edit for review
  app.post('/api/submissions', express.json({ limit: '8mb' }), (req, res) => {
    const pendingCount = store.submissions.filter((s) => s.status === 'pending').length;
    if (pendingCount >= MAX_PENDING_SUBMISSIONS) {
      res.status(429).json({ error: '待审核队列已满，请稍后再试' });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const type = body.type as SubmissionType;
    const targetId = typeof body.targetId === 'string' ? body.targetId.trim() : '';
    const submittedByRaw =
      typeof body.submittedBy === 'string' ? body.submittedBy.trim() : '';
    const noteRaw = typeof body.note === 'string' ? body.note.trim() : '';

    const submittedBy = (submittedByRaw || '匿名读者').slice(0, 32);
    const note = noteRaw.slice(0, 240);

    const validTypes: readonly SubmissionType[] = [
      'series-cover',
      'gamble-artwork',
      'gamble-gallery',
      'gamble-copy',
    ];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: '不支持的投稿类型' });
      return;
    }

    let targetLabel = '';
    if (type === 'series-cover') {
      const label = VALID_SERIES_TARGETS.get(targetId);
      if (!label) {
        res.status(400).json({ error: '无效的作品目标' });
        return;
      }
      targetLabel = label;
    } else {
      const label = VALID_GAMBLE_TARGETS.get(targetId);
      if (!label) {
        res.status(400).json({ error: '无效的赌局目标' });
        return;
      }
      targetLabel = label;
    }

    const submission: ContentSubmission = {
      id: crypto.randomUUID(),
      type,
      targetId,
      targetLabel,
      submittedBy,
      note,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    if (type === 'gamble-copy') {
      const patch = sanitizeCopyPatch(body.copyPatch);
      if (!patch) {
        res.status(400).json({ error: '请至少修改一项有效文案内容' });
        return;
      }
      submission.copyPatch = patch;
    } else {
      const saved = decodeAndSaveUploadedImage(body.imageDataUrl);
      if ('error' in saved) {
        res.status(400).json({ error: saved.error });
        return;
      }
      submission.imageUrl = saved.imageUrl;
    }

    store.submissions.unshift(submission);
    saveStore(store);

    res.status(201).json({
      id: submission.id,
      status: submission.status,
      message: '已提交至待审核队列，本机管理员审核通过后将自动生效',
    });
  });

  // Public check: tells UI whether current request is genuine localhost
  app.get('/api/moderation/status', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const canModerate = isRequestLocalhost(req);
    const pendingCount = canModerate
      ? store.submissions.filter((s) => s.status === 'pending').length
      : 0;
    res.json({ canModerate, pendingCount });
  });

  // Localhost-only: List all submissions & current overrides
  app.get('/api/moderation/submissions', requireLocalhost, (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      submissions: store.submissions,
      overrides: store.overrides,
    });
  });

  // Localhost-only: Approve a pending submission
  app.post(
    '/api/moderation/submissions/:id/approve',
    requireLocalhost,
    express.json({ limit: '64kb' }),
    (req, res) => {
      const id = req.params.id;
      const item = store.submissions.find((s) => s.id === id);
      if (!item) {
        res.status(404).json({ error: '未找到该审核项' });
        return;
      }
      if (item.status !== 'pending') {
        res.status(409).json({ error: '该条目已处理，请勿重复操作' });
        return;
      }

      const reviewNote =
        typeof req.body?.reviewNote === 'string'
          ? req.body.reviewNote.trim().slice(0, 160)
          : '';

      if (item.type === 'series-cover' && item.imageUrl && isSafeLocalImagePath(item.imageUrl)) {
        const previous = store.overrides.seriesCovers[item.targetId];
        store.overrides.seriesCovers[item.targetId] = item.imageUrl;
        if (previous && previous !== item.imageUrl) {
          safeUnlinkUpload(previous, store);
        }
      } else if (
        item.type === 'gamble-artwork' &&
        item.imageUrl &&
        isSafeLocalImagePath(item.imageUrl)
      ) {
        const previous = store.overrides.gambleArtworks[item.targetId];
        store.overrides.gambleArtworks[item.targetId] = item.imageUrl;
        if (previous && previous !== item.imageUrl) {
          safeUnlinkUpload(previous, store);
        }
      } else if (
        item.type === 'gamble-gallery' &&
        item.imageUrl &&
        isSafeLocalImagePath(item.imageUrl)
      ) {
        const current = store.overrides.gambleGalleries[item.targetId] ?? [];
        if (!current.includes(item.imageUrl)) {
          store.overrides.gambleGalleries[item.targetId] = [...current, item.imageUrl];
        }
      } else if (item.type === 'gamble-copy' && item.copyPatch) {
        const existing = store.overrides.gambleCopies[item.targetId] ?? {};
        store.overrides.gambleCopies[item.targetId] = {
          ...existing,
          ...item.copyPatch,
        };
      } else {
        res.status(400).json({ error: '投稿内容无效，无法通过' });
        return;
      }

      item.status = 'approved';
      item.reviewedAt = new Date().toISOString();
      if (reviewNote) item.reviewNote = reviewNote;

      saveStore(store);
      res.json({ submission: item, overrides: store.overrides });
    }
  );

  // Localhost-only: Reject a pending submission
  app.post(
    '/api/moderation/submissions/:id/reject',
    requireLocalhost,
    express.json({ limit: '64kb' }),
    (req, res) => {
      const id = req.params.id;
      const item = store.submissions.find((s) => s.id === id);
      if (!item) {
        res.status(404).json({ error: '未找到该审核项' });
        return;
      }
      if (item.status !== 'pending') {
        res.status(409).json({ error: '该条目已处理，请勿重复操作' });
        return;
      }

      const reviewNote =
        typeof req.body?.reviewNote === 'string'
          ? req.body.reviewNote.trim().slice(0, 160)
          : '';

      item.status = 'rejected';
      item.reviewedAt = new Date().toISOString();
      if (reviewNote) item.reviewNote = reviewNote;

      safeUnlinkUpload(item.imageUrl, store);
      saveStore(store);

      res.json({ submission: item, overrides: store.overrides });
    }
  );

  // Localhost-only: Revert an approved override back to canonical default
  app.post(
    '/api/moderation/revert',
    requireLocalhost,
    express.json({ limit: '64kb' }),
    (req, res) => {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const type = body.type as SubmissionType;
      const targetId = typeof body.targetId === 'string' ? body.targetId.trim() : '';

      if (type === 'series-cover') {
        const previous = store.overrides.seriesCovers[targetId];
        delete store.overrides.seriesCovers[targetId];
        safeUnlinkUpload(previous, store);
      } else if (type === 'gamble-artwork') {
        const previous = store.overrides.gambleArtworks[targetId];
        delete store.overrides.gambleArtworks[targetId];
        safeUnlinkUpload(previous, store);
      } else if (type === 'gamble-gallery') {
        const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl : '';
        const list = store.overrides.gambleGalleries[targetId] ?? [];
        const next = imageUrl ? list.filter((u) => u !== imageUrl) : [];
        if (next.length === 0) {
          delete store.overrides.gambleGalleries[targetId];
        } else {
          store.overrides.gambleGalleries[targetId] = next;
        }
        if (imageUrl) safeUnlinkUpload(imageUrl, store);
      } else if (type === 'gamble-copy') {
        delete store.overrides.gambleCopies[targetId];
      } else {
        res.status(400).json({ error: '无效的还原类型' });
        return;
      }

      saveStore(store);
      res.json({ overrides: store.overrides });
    }
  );

  // Localhost-only: Directly replace a manga series cover from the local admin panel
  app.post(
    '/api/moderation/series-cover',
    requireLocalhost,
    express.json({ limit: '8mb' }),
    (req, res) => {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const seriesId = typeof body.seriesId === 'string' ? body.seriesId.trim() : '';
      if (!VALID_SERIES_TARGETS.has(seriesId)) {
        res.status(400).json({ error: '无效的作品目标' });
        return;
      }

      const saved = decodeAndSaveUploadedImage(body.imageDataUrl);
      if ('error' in saved) {
        res.status(400).json({ error: saved.error });
        return;
      }

      const previous = store.overrides.seriesCovers[seriesId];
      store.overrides.seriesCovers[seriesId] = saved.imageUrl;
      if (previous && previous !== saved.imageUrl) {
        safeUnlinkUpload(previous, store);
      }

      saveStore(store);
      res.json({ overrides: store.overrides, imageUrl: saved.imageUrl });
    }
  );

  // Serve Vite middleware in development or built dist/ in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
