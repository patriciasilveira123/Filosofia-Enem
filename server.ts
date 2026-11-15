import dotenv from 'dotenv';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';

dotenv.config({ path: path.resolve(import.meta.dirname, '.env') });
dotenv.config({ path: path.resolve(import.meta.dirname, '.env.local'), override: true });

interface FirebaseConfig {
  projectId: string;
  apiKey: string;
  firestoreDatabaseId: string;
}

interface StoredUser {
  accountKey: string;
  uid: string;
  email: string;
  displayName: string;
  passwordSalt: string;
  passwordHash: string;
  sessionHashes: string[];
  resetCodeHash: string;
  resetExpiresAt: number;
  resetAttempts: number;
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

interface SessionUser {
  accountKey: string;
  uid: string;
  email: string;
  displayName: string;
  tokenHash: string;
}

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { timestampValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

interface FirestoreDocument {
  name?: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
}

const FIREBASE_CONFIG_PATH = path.resolve(import.meta.dirname, 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(
  fs.readFileSync(FIREBASE_CONFIG_PATH, 'utf-8')
) as FirebaseConfig;

const FIRESTORE_DOC_PREFIX = `projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents`;
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/${FIRESTORE_DOC_PREFIX}`;

const DIST_DIR = path.resolve(import.meta.dirname, 'dist');
const SERVER_TAG = 'fnm_srv_9f4b2c8e1d7a6035c8e2b91d4a7f6c30e5a1b8d2';
const ACCOUNT_PEPPER =
  process.env.ACCOUNT_PEPPER && process.env.ACCOUNT_PEPPER.length >= 16
    ? process.env.ACCOUNT_PEPPER
    : 'filoenem-firestore-account-pepper-v1-7d3e9a2c4b8f1056';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCOUNT_KEY_REGEX = /^acc_[a-f0-9]{64}$/;
const VALID_ALT_KEYS = new Set(['A', 'B', 'C', 'D', 'E']);
const VALID_UNITS = new Set(['all', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'outros']);
const VALID_DIFFS = new Set(['all', 'Fácil', 'Médio', 'Difícil']);
const VALID_STATUS = new Set(['todas', 'nao_respondidas', 'erradas']);
const VALID_THEMES = new Set(['claro', 'sepia', 'escuro']);

function computeAccountKey(email: string): string {
  const hex = crypto.createHmac('sha256', ACCOUNT_PEPPER).update(`email:${email}`).digest('hex');
  return `acc_${hex}`;
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

function hashSessionSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

function createOpaqueSession(accountKey: string): { token: string; tokenHash: string } {
  const secret = crypto.randomBytes(24).toString('base64url');
  return {
    token: `${accountKey}.${secret}`,
    tokenHash: hashSessionSecret(secret),
  };
}

function constantTimeIncludes(hashes: string[], targetHash: string): boolean {
  const targetBuf = Buffer.from(targetHash, 'utf-8');
  let found = false;
  for (const h of hashes) {
    const hBuf = Buffer.from(h, 'utf-8');
    if (hBuf.length === targetBuf.length && crypto.timingSafeEqual(hBuf, targetBuf)) {
      found = true;
    }
  }
  return found;
}

function hashResetCode(email: string, code: string): string {
  return crypto
    .createHmac('sha256', ACCOUNT_PEPPER)
    .update(`reset:${email}:${code}`)
    .digest('hex');
}

function verifyResetCode(email: string, code: string, expectedHashHex: string): boolean {
  const actual = Buffer.from(hashResetCode(email, code), 'hex');
  const expected = Buffer.from(expectedHashHex, 'hex');
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanEnvSecret(raw: string | undefined, stripAllWhitespace = false): string {
  if (!raw) return '';
  let val = raw.trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1).trim();
  }
  return stripAllWhitespace ? val.replace(/\s+/g, '') : val;
}

function getSmtpConfig(): {
  host: string;
  port: number;
  secure: boolean;
  requireTLS: boolean;
  user: string;
  pass: string;
  from: string;
} | null {
  const gmailUser = cleanEnvSecret(process.env.GMAIL_USER);
  const gmailPass = cleanEnvSecret(process.env.GMAIL_APP_PASSWORD, true);
  if (gmailUser && gmailPass) {
    return {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      requireTLS: true,
      user: gmailUser,
      pass: gmailPass,
      from: cleanEnvSecret(process.env.EMAIL_FROM) || `FiloENEM <${gmailUser}>`,
    };
  }

  const user = cleanEnvSecret(process.env.SMTP_USER);
  const isGmailUser = /@(gmail|googlemail)\.com$/i.test(user);
  const pass = cleanEnvSecret(process.env.SMTP_PASS, isGmailUser);
  const host = cleanEnvSecret(process.env.SMTP_HOST) || (isGmailUser ? 'smtp.gmail.com' : '');
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT) || 465;
  const secure =
    process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : port === 465;
  const requireTLS =
    process.env.SMTP_REQUIRE_TLS !== undefined
      ? process.env.SMTP_REQUIRE_TLS === 'true'
      : secure || port === 587;

  return {
    host,
    port,
    secure,
    requireTLS,
    user,
    pass,
    from: cleanEnvSecret(process.env.EMAIL_FROM) || `FiloENEM <${user}>`,
  };
}

function isEmailDeliveryConfigured(): boolean {
  return Boolean(cleanEnvSecret(process.env.RESEND_API_KEY) || getSmtpConfig());
}

async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resendKey = cleanEnvSecret(process.env.RESEND_API_KEY);
  let lastError: string | undefined;

  if (resendKey) {
    const fromAddress =
      cleanEnvSecret(process.env.EMAIL_FROM) ||
      cleanEnvSecret(process.env.RESEND_FROM_EMAIL) ||
      'FiloENEM <onboarding@resend.dev>';
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          from: fromAddress,
          to: [params.to],
          subject: params.subject,
          text: params.text,
          html: params.html,
        }),
      });
      if (res.ok) {
        return { sent: true };
      }
      const errBody = await res.text().catch(() => '');
      console.error('Resend email error:', res.status, errBody);
      lastError = `Resend retornou erro HTTP ${res.status}.`;
    } catch (err) {
      console.error('Resend request failed:', err);
      lastError = 'Falha de conexão com a API de e-mail (Resend).';
    }
  }

  const smtp = getSmtpConfig();
  if (smtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        requireTLS: smtp.requireTLS,
        auth: {
          user: smtp.user,
          pass: smtp.pass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
      const info = await transporter.sendMail({
        from: smtp.from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      });
      if (Array.isArray(info.rejected) && info.rejected.length > 0) {
        console.error('SMTP rejected recipient:', info.rejected);
        return { sent: false, error: 'O servidor SMTP recusou o endereço de destino.' };
      }
      if (Array.isArray(info.accepted) && info.accepted.length === 0) {
        return { sent: false, error: 'O servidor SMTP não aceitou o envio da mensagem.' };
      }
      return { sent: true };
    } catch (err) {
      console.error('SMTP send error:', err);
      const code = (err as { code?: string; responseCode?: number })?.code;
      const responseCode = (err as { responseCode?: number })?.responseCode;
      if (code === 'EAUTH' || responseCode === 535) {
        return {
          sent: false,
          error: 'Credenciais SMTP recusadas pelo provedor de e-mail (verifique usuário/Senha de App).',
        };
      }
      return { sent: false, error: 'Falha ao enviar e-mail pelo servidor SMTP configurado.' };
    }
  }

  return {
    sent: false,
    error:
      lastError ||
      'Provedor de e-mail não configurado no servidor (defina GMAIL_USER/GMAIL_APP_PASSWORD, SMTP_* ou RESEND_API_KEY).',
  };
}

async function sendWelcomeEmail(params: {
  to: string;
  displayName: string;
  password: string;
}): Promise<{ sent: boolean; error?: string }> {
  const appUrl = cleanEnvSecret(process.env.APP_URL);
  const safeName = escapeHtml(params.displayName);
  const safeEmail = escapeHtml(params.to);
  const safePassword = escapeHtml(params.password);
  const safeUrl = appUrl ? escapeHtml(appUrl) : '';

  const text = [
    `Olá, ${params.displayName}!`,
    '',
    'Seja bem-vindo(a) ao FiloENEM — Simulado Completo de Filosofia (500 Questões TRI).',
    'Sua conta foi criada com sucesso e seu progresso será salvo automaticamente no banco de dados online.',
    '',
    'Seus dados de acesso:',
    `Login (E-mail): ${params.to}`,
    `Senha: ${params.password}`,
    ...(appUrl ? ['', `Acesse o simulado em: ${appUrl}`] : []),
    '',
    'Bons estudos!',
    'Equipe FiloENEM',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="margin: 0 0 12px; color: #1d4ed8;">Bem-vindo(a) ao FiloENEM!</h2>
      <p style="margin: 0 0 16px; line-height: 1.5;">Olá, <strong>${safeName}</strong>! Sua conta foi criada com sucesso no Simulado de Filosofia ENEM (500 Questões TRI).</p>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #475569; font-weight: bold;">SEUS DADOS DE ACESSO</p>
        <p style="margin: 0 0 6px; font-size: 14px;"><strong>Login (E-mail):</strong> ${safeEmail}</p>
        <p style="margin: 0; font-size: 14px;"><strong>Senha:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${safePassword}</code></p>
      </div>
      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5;">Suas respostas e sua última questão acessada ficam salvas automaticamente para você retomar de onde parou em qualquer dispositivo.</p>
      ${safeUrl ? `<p style="margin: 0 0 16px;"><a href="${safeUrl}" style="display: inline-block; background: #1d4ed8; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; font-size: 14px;">Acessar o Simulado</a></p>` : ''}
      <p style="margin: 0; font-size: 12px; color: #64748b;">Por segurança, recomendamos guardar este e-mail ou alterar sua senha quando desejar pela opção "Esqueci minha senha".</p>
    </div>
  `;

  return sendTransactionalEmail({
    to: params.to,
    subject: 'Bem-vindo(a) ao FiloENEM — Seus dados de login e senha',
    text,
    html,
  });
}

async function sendPasswordResetEmail(params: {
  to: string;
  displayName: string;
  code: string;
}): Promise<{ sent: boolean; error?: string }> {
  const safeName = escapeHtml(params.displayName);
  const safeCode = escapeHtml(params.code);

  const text = [
    `Olá, ${params.displayName}!`,
    '',
    'Recebemos uma solicitação para redefinir a senha da sua conta no FiloENEM.',
    `Seu código de verificação de 6 dígitos é: ${params.code}`,
    '',
    'Este código é válido por 15 minutos. Digite-o na tela de recuperação para cadastrar uma nova senha.',
    'Se você não solicitou esta alteração, ignore este e-mail.',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="margin: 0 0 12px; color: #1d4ed8;">Redefinição de senha — FiloENEM</h2>
      <p style="margin: 0 0 16px; line-height: 1.5;">Olá, <strong>${safeName}</strong>! Use o código de 6 dígitos abaixo para redefinir sua senha:</p>
      <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 16px;">
        <span style="font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a;">${safeCode}</span>
      </div>
      <p style="margin: 0 0 8px; font-size: 13px; color: #475569;">Este código expira em <strong>15 minutos</strong>.</p>
      <p style="margin: 0; font-size: 12px; color: #64748b;">Se você não solicitou a alteração de senha, pode ignorar este e-mail com segurança.</p>
    </div>
  `;

  return sendTransactionalEmail({
    to: params.to,
    subject: 'FiloENEM — Código de redefinição de senha',
    text,
    html,
  });
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
    typeof src.selectedUnit === 'string' && VALID_UNITS.has(src.selectedUnit)
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

function getStringField(fields: Record<string, FirestoreValue>, key: string): string {
  const val = fields[key];
  return val && 'stringValue' in val ? val.stringValue : '';
}

function getIntField(fields: Record<string, FirestoreValue>, key: string, fallback = 0): number {
  const val = fields[key];
  if (!val || !('integerValue' in val)) return fallback;
  const parsed = Number(val.integerValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getStringArrayField(fields: Record<string, FirestoreValue>, key: string): string[] {
  const val = fields[key];
  if (!val || !('arrayValue' in val) || !Array.isArray(val.arrayValue.values)) return [];
  return val.arrayValue.values
    .map((item) => ('stringValue' in item ? item.stringValue : ''))
    .filter(Boolean);
}

function getTimestampField(fields: Record<string, FirestoreValue>, key: string): string {
  const val = fields[key];
  return val && 'timestampValue' in val ? val.timestampValue : new Date().toISOString();
}

async function firestoreGetDoc(collection: string, docId: string): Promise<FirestoreDocument | null> {
  const url = `${FIRESTORE_BASE_URL}/${encodeURIComponent(collection)}/${encodeURIComponent(docId)}?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore GET ${collection}/${docId} failed (${res.status}): ${text}`);
  }
  return (await res.json()) as FirestoreDocument;
}

async function firestoreCommitCreate(
  collection: string,
  docId: string,
  fields: Record<string, FirestoreValue>
): Promise<void> {
  const url = `${FIRESTORE_BASE_URL}:commit?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: `${FIRESTORE_DOC_PREFIX}/${collection}/${docId}`,
            fields,
          },
          currentDocument: { exists: false },
          updateTransforms: [
            { fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' },
            { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Firestore CREATE ${collection}/${docId} failed (${res.status}): ${text}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
}

async function firestoreCommitUpdate(
  collection: string,
  docId: string,
  fields: Record<string, FirestoreValue>,
  maskFieldPaths: string[]
): Promise<void> {
  const url = `${FIRESTORE_BASE_URL}:commit?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      writes: [
        {
          update: {
            name: `${FIRESTORE_DOC_PREFIX}/${collection}/${docId}`,
            fields,
          },
          updateMask: {
            fieldPaths: maskFieldPaths,
          },
          currentDocument: { exists: true },
          updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }],
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Firestore UPDATE ${collection}/${docId} failed (${res.status}): ${text}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
}

async function getEmailAccount(accountKey: string): Promise<StoredUser | null> {
  const doc = await firestoreGetDoc('emailAccounts', accountKey);
  if (!doc || !doc.fields) return null;
  const f = doc.fields;
  return {
    accountKey: getStringField(f, 'accountKey'),
    uid: getStringField(f, 'uid'),
    email: getStringField(f, 'email'),
    displayName: getStringField(f, 'displayName'),
    passwordSalt: getStringField(f, 'passwordSalt'),
    passwordHash: getStringField(f, 'passwordHash'),
    sessionHashes: getStringArrayField(f, 'sessionHashes'),
    resetCodeHash: getStringField(f, 'resetCodeHash'),
    resetExpiresAt: getIntField(f, 'resetExpiresAt', 0),
    resetAttempts: getIntField(f, 'resetAttempts', 0),
    createdAt: getTimestampField(f, 'createdAt'),
    updatedAt: getTimestampField(f, 'updatedAt'),
  };
}

async function createEmailAccount(user: Omit<StoredUser, 'createdAt' | 'updatedAt'>): Promise<void> {
  await firestoreCommitCreate('emailAccounts', user.accountKey, {
    accountKey: { stringValue: user.accountKey },
    uid: { stringValue: user.uid },
    email: { stringValue: user.email },
    displayName: { stringValue: user.displayName },
    passwordSalt: { stringValue: user.passwordSalt },
    passwordHash: { stringValue: user.passwordHash },
    sessionHashes: {
      arrayValue:
        user.sessionHashes.length > 0
          ? { values: user.sessionHashes.map((h) => ({ stringValue: h })) }
          : {},
    },
    resetCodeHash: { stringValue: user.resetCodeHash },
    resetExpiresAt: { integerValue: String(user.resetExpiresAt) },
    resetAttempts: { integerValue: String(user.resetAttempts) },
    serverTag: { stringValue: SERVER_TAG },
  });
}

async function updateEmailAccountFields(
  accountKey: string,
  updates: {
    displayName?: string;
    passwordSalt?: string;
    passwordHash?: string;
    sessionHashes?: string[];
    resetCodeHash?: string;
    resetExpiresAt?: number;
    resetAttempts?: number;
  }
): Promise<void> {
  const fields: Record<string, FirestoreValue> = {};
  const mask: string[] = [];

  if (updates.displayName !== undefined) {
    fields.displayName = { stringValue: updates.displayName };
    mask.push('displayName');
  }
  if (updates.passwordSalt !== undefined) {
    fields.passwordSalt = { stringValue: updates.passwordSalt };
    mask.push('passwordSalt');
  }
  if (updates.passwordHash !== undefined) {
    fields.passwordHash = { stringValue: updates.passwordHash };
    mask.push('passwordHash');
  }
  if (updates.sessionHashes !== undefined) {
    fields.sessionHashes = {
      arrayValue:
        updates.sessionHashes.length > 0
          ? { values: updates.sessionHashes.map((h) => ({ stringValue: h })) }
          : {},
    };
    mask.push('sessionHashes');
  }
  if (updates.resetCodeHash !== undefined) {
    fields.resetCodeHash = { stringValue: updates.resetCodeHash };
    mask.push('resetCodeHash');
  }
  if (updates.resetExpiresAt !== undefined) {
    fields.resetExpiresAt = { integerValue: String(updates.resetExpiresAt) };
    mask.push('resetExpiresAt');
  }
  if (updates.resetAttempts !== undefined) {
    fields.resetAttempts = { integerValue: String(updates.resetAttempts) };
    mask.push('resetAttempts');
  }

  await firestoreCommitUpdate('emailAccounts', accountKey, fields, mask);
}

async function getEmailProgress(uid: string): Promise<StoredProgress | null> {
  const doc = await firestoreGetDoc('emailProgress', uid);
  if (!doc || !doc.fields) return null;
  const f = doc.fields;

  const rawAnswers: Record<string, unknown> = {};
  const ansField = f.answers;
  if (ansField && 'mapValue' in ansField && ansField.mapValue.fields) {
    for (const [k, v] of Object.entries(ansField.mapValue.fields)) {
      if ('stringValue' in v) {
        rawAnswers[k] = v.stringValue;
      }
    }
  }

  const sanitized = sanitizeProgressInput({
    answers: rawAnswers,
    currentQuestionId: getIntField(f, 'currentQuestionId', 1),
    selectedUnit: getStringField(f, 'selectedUnit') || 'all',
    selectedDifficulty: getStringField(f, 'selectedDifficulty') || 'all',
    statusFilter: getStringField(f, 'statusFilter') || 'todas',
    pageTheme: getStringField(f, 'pageTheme') || 'claro',
  });
  sanitized.updatedAt = getTimestampField(f, 'updatedAt');
  return sanitized;
}

async function saveEmailProgress(uid: string, cleanState: StoredProgress): Promise<void> {
  const answerFields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(cleanState.answers)) {
    answerFields[k] = { stringValue: v };
  }

  const progressFields: Record<string, FirestoreValue> = {
    ownerId: { stringValue: uid },
    answers: {
      mapValue: Object.keys(answerFields).length > 0 ? { fields: answerFields } : {},
    },
    currentQuestionId: { integerValue: String(cleanState.currentQuestionId) },
    selectedUnit: { stringValue: cleanState.selectedUnit },
    selectedDifficulty: { stringValue: cleanState.selectedDifficulty },
    statusFilter: { stringValue: cleanState.statusFilter },
    pageTheme: { stringValue: cleanState.pageTheme },
    serverTag: { stringValue: SERVER_TAG },
  };

  const existing = await firestoreGetDoc('emailProgress', uid);
  if (!existing) {
    await firestoreCommitCreate('emailProgress', uid, progressFields);
  } else {
    const updateOnlyFields = { ...progressFields };
    delete updateOnlyFields.ownerId;
    delete updateOnlyFields.serverTag;
    await firestoreCommitUpdate('emailProgress', uid, updateOnlyFields, [
      'answers',
      'currentQuestionId',
      'selectedUnit',
      'selectedDifficulty',
      'statusFilter',
      'pageTheme',
    ]);
  }
}

interface AuthenticatedRequest extends Request {
  sessionUser?: SessionUser;
}

async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!match) {
    res.status(401).json({ error: 'Sessão não encontrada. Faça login novamente.' });
    return;
  }

  const token = match[1].trim();
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Entre novamente com seu e-mail.' });
    return;
  }

  const accountKey = token.slice(0, dotIdx);
  const rawSecret = token.slice(dotIdx + 1);
  if (!ACCOUNT_KEY_REGEX.test(accountKey) || rawSecret.length < 16) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Entre novamente com seu e-mail.' });
    return;
  }

  try {
    const account = await getEmailAccount(accountKey);
    if (!account) {
      res.status(401).json({ error: 'Conta não encontrada. Entre novamente com seu e-mail.' });
      return;
    }

    const tokenHash = hashSessionSecret(rawSecret);
    if (!constantTimeIncludes(account.sessionHashes, tokenHash)) {
      res.status(401).json({ error: 'Sessão expirada ou encerrada. Entre novamente com seu e-mail.' });
      return;
    }

    req.sessionUser = {
      accountKey: account.accountKey,
      uid: account.uid,
      email: account.email,
      displayName: account.displayName,
      tokenHash,
    };
    next();
  } catch (err) {
    console.error('Auth verification error:', err);
    res.status(503).json({
      error: 'Não foi possível validar sua sessão no banco de dados agora. Tente novamente.',
    });
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '512kb' }));

  // Prevent serving backend source, rules, or env files in dev mode
  app.use((req, res, next) => {
    if (
      /^\/(server\.ts|firestore\.rules|firebase-blueprint\.json|\.env.*|\.data(\/|$)|eslint\.config\.js)/i.test(
        req.path
      )
    ) {
      res.status(404).end();
      return;
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      database: 'firestore',
      emailConfigured: isEmailDeliveryConfigured(),
    });
  });

  app.post('/api/auth/register', async (req, res) => {
    const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const displayNameRaw =
      typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : '';

    if (!EMAIL_REGEX.test(emailRaw) || emailRaw.length > 254) {
      res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      return;
    }
    if (password.length < 6 || password.length > 128) {
      res.status(400).json({ error: 'A senha precisa ter entre 6 e 128 caracteres.' });
      return;
    }

    const accountKey = computeAccountKey(emailRaw);

    try {
      const existing = await getEmailAccount(accountKey);
      if (existing) {
        res.status(409).json({
          error:
            'Este e-mail já possui uma conta cadastrada. Clique em "Já tenho conta" para entrar.',
        });
        return;
      }

      const uid = `email_${crypto.randomUUID().replace(/-/g, '')}`;
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword(password, salt);
      const displayName = (displayNameRaw || emailRaw.split('@')[0] || 'Estudante').slice(0, 120);
      const { token, tokenHash } = createOpaqueSession(accountKey);

      await createEmailAccount({
        accountKey,
        uid,
        email: emailRaw,
        displayName,
        passwordSalt: salt,
        passwordHash: hash,
        sessionHashes: [tokenHash],
        resetCodeHash: '',
        resetExpiresAt: 0,
        resetAttempts: 0,
      });

      const emailConfigured = isEmailDeliveryConfigured();
      let welcomeEmailSent = false;
      let welcomeEmailError: string | undefined;

      if (emailConfigured) {
        const emailResult = await sendWelcomeEmail({
          to: emailRaw,
          displayName,
          password,
        });
        welcomeEmailSent = emailResult.sent;
        welcomeEmailError = emailResult.error;
      } else {
        welcomeEmailError =
          'Serviço de envio de e-mails ainda não configurado no servidor (defina GMAIL_USER/GMAIL_APP_PASSWORD, SMTP_* ou RESEND_API_KEY).';
      }

      res.status(201).json({
        token,
        emailConfigured,
        welcomeEmailSent,
        ...(welcomeEmailError ? { welcomeEmailError } : {}),
        user: { uid, email: emailRaw, displayName, provider: 'email' },
      });
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        res.status(409).json({
          error:
            'Este e-mail já possui uma conta cadastrada. Clique em "Já tenho conta" para entrar.',
        });
        return;
      }
      console.error('Register error:', err);
      res.status(503).json({
        error: 'Não foi possível criar sua conta no banco de dados online. Tente novamente.',
      });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
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

    const accountKey = computeAccountKey(emailRaw);

    try {
      const existing = await getEmailAccount(accountKey);
      if (!existing || !verifyPassword(password, existing.passwordSalt, existing.passwordHash)) {
        res.status(401).json({
          error:
            'E-mail ou senha incorretos. Confira seus dados ou crie uma conta na aba "Criar conta".',
        });
        return;
      }

      const { token, tokenHash } = createOpaqueSession(accountKey);
      const nextSessions = [...existing.sessionHashes.slice(-9), tokenHash];
      await updateEmailAccountFields(accountKey, { sessionHashes: nextSessions });

      res.json({
        token,
        user: {
          uid: existing.uid,
          email: existing.email,
          displayName: existing.displayName,
          provider: 'email',
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(503).json({
        error: 'Erro ao consultar o banco de dados online. Tente novamente em instantes.',
      });
    }
  });

  app.post('/api/auth/logout', requireAuth, async (req: AuthenticatedRequest, res) => {
    const session = req.sessionUser!;
    try {
      const existing = await getEmailAccount(session.accountKey);
      if (existing) {
        const nextSessions = existing.sessionHashes.filter((h) => h !== session.tokenHash);
        await updateEmailAccountFields(session.accountKey, { sessionHashes: nextSessions });
      }
      res.json({ ok: true });
    } catch {
      res.json({ ok: true });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!EMAIL_REGEX.test(emailRaw) || emailRaw.length > 254) {
      res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      return;
    }

    if (!isEmailDeliveryConfigured()) {
      res.status(503).json({
        error:
          'O envio automático de e-mails ainda não está configurado no servidor (defina GMAIL_USER/GMAIL_APP_PASSWORD, SMTP_HOST/SMTP_USER/SMTP_PASS ou RESEND_API_KEY). Enquanto isso, acesse com "Entrar com Google (E-mail)".',
      });
      return;
    }

    const accountKey = computeAccountKey(emailRaw);

    try {
      const existing = await getEmailAccount(accountKey);
      if (!existing) {
        res.status(404).json({
          error:
            'Nenhuma conta com e-mail e senha foi encontrada para este endereço. Se você acessa pelo Google, use "Entrar com Google (E-mail)" ou crie uma conta na aba "Criar conta".',
        });
        return;
      }

      const code = crypto.randomInt(100000, 1000000).toString();
      await updateEmailAccountFields(accountKey, {
        resetCodeHash: hashResetCode(emailRaw, code),
        resetExpiresAt: Date.now() + 15 * 60 * 1000,
        resetAttempts: 0,
      });

      const resetEmailResult = await sendPasswordResetEmail({
        to: emailRaw,
        displayName: existing.displayName,
        code,
      });
      if (!resetEmailResult.sent) {
        res.status(502).json({
          error:
            resetEmailResult.error ||
            'Não foi possível enviar o código de recuperação para o seu e-mail no momento. Tente novamente em instantes.',
        });
        return;
      }

      res.json({
        ok: true,
        message:
          'Enviamos um código de 6 dígitos para o seu e-mail! Verifique sua caixa de entrada ou spam (válido por 15 minutos).',
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(503).json({
        error: 'Erro ao acessar o banco de dados online. Tente novamente em instantes.',
      });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const emailRaw = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const codeRaw = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!EMAIL_REGEX.test(emailRaw) || emailRaw.length > 254) {
      res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      return;
    }
    if (!/^\d{6}$/.test(codeRaw)) {
      res.status(400).json({ error: 'Digite o código numérico de 6 dígitos enviado para o seu e-mail.' });
      return;
    }
    if (newPassword.length < 6 || newPassword.length > 128) {
      res.status(400).json({ error: 'A nova senha deve ter entre 6 e 128 caracteres.' });
      return;
    }

    const accountKey = computeAccountKey(emailRaw);

    try {
      const existing = await getEmailAccount(accountKey);
      if (!existing || !existing.resetCodeHash || !existing.resetExpiresAt) {
        res.status(400).json({
          error:
            'Nenhuma solicitação de recuperação ativa para este e-mail. Solicite um novo código.',
        });
        return;
      }

      if (Date.now() > existing.resetExpiresAt) {
        await updateEmailAccountFields(accountKey, {
          resetCodeHash: '',
          resetExpiresAt: 0,
          resetAttempts: 0,
        });
        res.status(400).json({
          error: 'O código de recuperação expirou. Solicite um novo código para continuar.',
        });
        return;
      }

      if (!verifyResetCode(emailRaw, codeRaw, existing.resetCodeHash)) {
        const nextAttempts = existing.resetAttempts + 1;
        if (nextAttempts >= 5) {
          await updateEmailAccountFields(accountKey, {
            resetCodeHash: '',
            resetExpiresAt: 0,
            resetAttempts: 0,
          });
          res.status(429).json({
            error: 'Muitas tentativas incorretas. Solicite um novo código de recuperação.',
          });
          return;
        }
        await updateEmailAccountFields(accountKey, { resetAttempts: nextAttempts });
        res
          .status(400)
          .json({ error: 'Código incorreto. Confira os 6 dígitos e tente novamente.' });
        return;
      }

      const newSalt = crypto.randomBytes(16).toString('hex');
      const newHash = hashPassword(newPassword, newSalt);
      const { token, tokenHash } = createOpaqueSession(accountKey);

      await updateEmailAccountFields(accountKey, {
        passwordSalt: newSalt,
        passwordHash: newHash,
        sessionHashes: [tokenHash],
        resetCodeHash: '',
        resetExpiresAt: 0,
        resetAttempts: 0,
      });

      res.json({
        ok: true,
        token,
        user: {
          uid: existing.uid,
          email: existing.email,
          displayName: existing.displayName,
          provider: 'email',
        },
      });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(503).json({
        error: 'Erro ao atualizar sua senha no banco de dados online. Tente novamente.',
      });
    }
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const session = req.sessionUser!;
    res.json({
      user: {
        uid: session.uid,
        email: session.email,
        displayName: session.displayName,
        provider: 'email',
      },
    });
  });

  app.get('/api/progress', requireAuth, async (req: AuthenticatedRequest, res) => {
    const session = req.sessionUser!;
    try {
      const progress = await getEmailProgress(session.uid);
      res.json({
        exists: Boolean(progress),
        state: progress,
      });
    } catch (err) {
      console.error('Load progress error:', err);
      res.status(503).json({
        error: 'Não foi possível carregar seu progresso do banco de dados online.',
      });
    }
  });

  app.put('/api/progress', requireAuth, async (req: AuthenticatedRequest, res) => {
    const session = req.sessionUser!;
    try {
      const cleanState = sanitizeProgressInput(req.body);
      await saveEmailProgress(session.uid, cleanState);
      res.json({ ok: true, state: cleanState });
    } catch (err) {
      console.error('Save progress error:', err);
      res.status(503).json({
        error: 'Não foi possível salvar seu progresso no banco de dados online.',
      });
    }
  });

  app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Corpo da requisição JSON inválido.' });
      return;
    }
    res.status(500).json({ error: 'Erro interno no servidor.' });
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
