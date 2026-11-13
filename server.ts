import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';

interface StoredUser {
  uid: string;
  email: string;
  displayName: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredProgress {
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
  currentQuestionId: number;
  selectedUnit: string;
  selectedDifficulty: 'all' | 'Fácil' | 'Médio' | 'Difícil';
  statusFilter: 'todas' | 'nao_respondidas' | 'erradas';
  pageTheme: 'claro' | 'sepia' | 'escuro';
  updatedAt: string;
}

interface DataStore {
  usersByEmail: Record<string, StoredUser>;
  progressByUid: Record<string, StoredProgress>;
}

interface SessionPayload {
  uid: string;
  email: string;
  displayName: string;
  exp: number;
}

const DATA_DIR = path.resolve(import.meta.dirname, '.data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const SECRET_PATH = path.join(DATA_DIR, 'session.key');
const DIST_DIR = path.resolve(import.meta.dirname, 'dist');
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ALT_KEYS = new Set(['A', 'B', 'C', 'D', 'E']);
const VALID_DIFFS = new Set(['all', 'Fácil', 'Médio', 'Difícil']);
const VALID_STATUS = new Set(['todas', 'nao_respondidas', 'erradas']);
const VALID_THEMES = new Set(['claro', 'sepia', 'escuro']);

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  ensureDataDir();
  if (fs.existsSync(SECRET_PATH)) {
    const existing = fs.readFileSync(SECRET_PATH, 'utf-8').trim();
    if (existing.length >= 32) return existing;
  }
  const generated = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SECRET_PATH, generated, { mode: 0o600 });
  return generated;
}

const SESSION_SECRET = getSessionSecret();

function readStore(): DataStore {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    return { usersByEmail: {}, progressByUid: {} };
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<DataStore>;
    return {
      usersByEmail: parsed.usersByEmail || {},
      progressByUid: parsed.progressByUid || {},
    };
  } catch {
    return { usersByEmail: {}, progressByUid: {} };
  }
}

function writeStore(store: DataStore): void {
  ensureDataDir();
  const tmpPath = `${STORE_PATH}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), 'utf-8');
  fs.renameSync(tmpPath, STORE_PATH);
}

function hashPassword(password: string, saltHex: string): string {
  return crypto.scryptSync(password, saltHex, 64).toString('hex');
}

function verifyPassword(password: string, saltHex: string, expectedHashHex: string): boolean {
  const actual = Buffer.from(hashPassword(password, saltHex), 'hex');
  const expected = Buffer.from(expectedHashHex, 'hex');
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function signSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifySession(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as SessionPayload;
    if (!parsed.uid || !parsed.email || typeof parsed.exp !== 'number') return null;
    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function sanitizeProgressInput(raw: unknown): StoredProgress {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const cleanAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'> = {};
  if (src.answers && typeof src.answers === 'object') {
    for (const [k, v] of Object.entries(src.answers as Record<string, unknown>)) {
      const id = Number(k);
      if (
        Number.isInteger(id) &&
        id >= 1 &&
        id <= 500 &&
        typeof v === 'string' &&
        VALID_ALT_KEYS.has(v)
      ) {
        cleanAnswers[String(id)] = v as 'A' | 'B' | 'C' | 'D' | 'E';
      }
    }
  }

  const rawQ = Number(src.currentQuestionId);
  const currentQuestionId = Number.isInteger(rawQ) && rawQ >= 1 && rawQ <= 500 ? rawQ : 1;

  const selectedUnit =
    typeof src.selectedUnit === 'string' && src.selectedUnit.length >= 1 && src.selectedUnit.length <= 32
      ? src.selectedUnit
      : 'all';

  const selectedDifficulty =
    typeof src.selectedDifficulty === 'string' && VALID_DIFFS.has(src.selectedDifficulty)
      ? (src.selectedDifficulty as StoredProgress['selectedDifficulty'])
      : 'all';

  const statusFilter =
    typeof src.statusFilter === 'string' && VALID_STATUS.has(src.statusFilter)
      ? (src.statusFilter as StoredProgress['statusFilter'])
      : 'todas';

  const pageTheme =
    typeof src.pageTheme === 'string' && VALID_THEMES.has(src.pageTheme)
      ? (src.pageTheme as StoredProgress['pageTheme'])
      : 'claro';

  return {
    answers: cleanAnswers,
    currentQuestionId,
    selectedUnit,
    selectedDifficulty,
    statusFilter,
    pageTheme,
    updatedAt: new Date().toISOString(),
  };
}

interface AuthenticatedRequest extends Request {
  sessionUser?: SessionPayload;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!match) {
    res.status(401).json({ error: 'Sessão não encontrada. Faça login novamente.' });
    return;
  }
  const session = verifySession(match[1].trim());
  if (!session) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Entre novamente com seu e-mail.' });
    return;
  }
  req.sessionUser = session;
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '512kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/auth/register', (req, res) => {
    const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const displayNameRaw = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : '';

    if (!EMAIL_REGEX.test(emailRaw) || emailRaw.length > 254) {
      res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' });
      return;
    }

    const store = readStore();
    if (store.usersByEmail[emailRaw]) {
      res.status(409).json({
        error: 'Este e-mail já possui uma conta cadastrada. Clique em "Já tenho conta" para entrar.',
      });
      return;
    }

    const uid = `email_${crypto.randomUUID().replace(/-/g, '')}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const now = new Date().toISOString();
    const displayName = (displayNameRaw || emailRaw.split('@')[0] || 'Estudante').slice(0, 120);

    const newUser: StoredUser = {
      uid,
      email: emailRaw,
      displayName,
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: now,
      updatedAt: now,
    };

    store.usersByEmail[emailRaw] = newUser;
    writeStore(store);

    const payload: SessionPayload = {
      uid,
      email: emailRaw,
      displayName,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    const token = signSession(payload);

    res.status(201).json({
      token,
      user: { uid, email: emailRaw, displayName, provider: 'email' },
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!EMAIL_REGEX.test(emailRaw)) {
      res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Digite sua senha para entrar.' });
      return;
    }

    const store = readStore();
    const existing = store.usersByEmail[emailRaw];
    if (!existing || !verifyPassword(password, existing.passwordSalt, existing.passwordHash)) {
      res.status(401).json({
        error: 'E-mail ou senha incorretos. Confira seus dados ou crie uma conta na aba "Criar conta".',
      });
      return;
    }

    const payload: SessionPayload = {
      uid: existing.uid,
      email: existing.email,
      displayName: existing.displayName,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    const token = signSession(payload);

    res.json({
      token,
      user: {
        uid: existing.uid,
        email: existing.email,
        displayName: existing.displayName,
        provider: 'email',
      },
    });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const session = req.sessionUser!;
    const store = readStore();
    const existing = store.usersByEmail[session.email];
    if (!existing || existing.uid !== session.uid) {
      res.status(401).json({ error: 'Conta não encontrada. Entre novamente com seu e-mail.' });
      return;
    }
    res.json({
      user: {
        uid: existing.uid,
        email: existing.email,
        displayName: existing.displayName,
        provider: 'email',
      },
    });
  });

  app.get('/api/progress', requireAuth, (req: AuthenticatedRequest, res) => {
    const session = req.sessionUser!;
    const store = readStore();
    const progress = store.progressByUid[session.uid] || null;
    res.json({
      exists: Boolean(progress),
      state: progress,
    });
  });

  app.put('/api/progress', requireAuth, (req: AuthenticatedRequest, res) => {
    const session = req.sessionUser!;
    const store = readStore();
    const cleanState = sanitizeProgressInput(req.body);
    store.progressByUid[session.uid] = cleanState;
    writeStore(store);
    res.json({ ok: true, state: cleanState });
  });

  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(DIST_DIR);
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(DIST_DIR));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`FiloENEM server running on http://0.0.0.0:${port}`);
  });
}

void startServer();
