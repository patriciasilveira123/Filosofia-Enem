import { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AlternativeKey, AnswersMap, Difficulty } from '../types/quiz';
import { CURRICULUM } from '../data/curriculum';

export type StatusFilter = 'todas' | 'nao_respondidas' | 'erradas';
export type PageTheme = 'claro' | 'sepia' | 'escuro';

export interface SavedProgressState {
  answers: AnswersMap;
  currentQuestionId: number;
  selectedUnit: string;
  selectedDifficulty: Difficulty | 'all';
  statusFilter: StatusFilter;
  pageTheme: PageTheme;
}

export interface EmailAccount {
  uid: string;
  email: string;
  displayName: string;
  provider: 'email';
  token: string;
}

export interface GoogleAccount {
  uid: string;
  email: string;
  displayName: string;
  provider: 'google';
  firebaseUser: User;
}

export type AppAccount = EmailAccount | GoogleAccount;

export const EMAIL_TOKEN_STORAGE_KEY = 'filoenem_email_token_v1';

const VALID_KEYS = new Set<AlternativeKey>(['A', 'B', 'C', 'D', 'E']);
const VALID_UNITS = new Set<string>(['all', ...CURRICULUM.map((u) => u.id)]);
const VALID_DIFFS = new Set<string>(['all', 'Fácil', 'Médio', 'Difícil']);
const VALID_STATUS = new Set<string>(['todas', 'nao_respondidas', 'erradas']);
const VALID_THEMES = new Set<string>(['claro', 'sepia', 'escuro']);

function sanitizeAnswers(raw: unknown): AnswersMap {
  const clean: AnswersMap = {};
  if (!raw || typeof raw !== 'object') return clean;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = Number(k);
    if (
      Number.isInteger(id) &&
      id >= 1 &&
      id <= 500 &&
      typeof v === 'string' &&
      VALID_KEYS.has(v as AlternativeKey)
    ) {
      clean[id] = v as AlternativeKey;
    }
  }
  return clean;
}

export function sanitizeProgressState(
  raw: Partial<SavedProgressState> | null | undefined,
  maxQuestionId = 500
): SavedProgressState {
  const answers = sanitizeAnswers(raw?.answers);
  const rawQ = Number(raw?.currentQuestionId);
  const currentQuestionId =
    Number.isInteger(rawQ) && rawQ >= 1 && rawQ <= maxQuestionId ? rawQ : 1;

  const selectedUnit =
    typeof raw?.selectedUnit === 'string' && VALID_UNITS.has(raw.selectedUnit)
      ? raw.selectedUnit
      : 'all';

  const selectedDifficulty =
    typeof raw?.selectedDifficulty === 'string' && VALID_DIFFS.has(raw.selectedDifficulty)
      ? (raw.selectedDifficulty as Difficulty | 'all')
      : 'all';

  const statusFilter =
    typeof raw?.statusFilter === 'string' && VALID_STATUS.has(raw.statusFilter)
      ? (raw.statusFilter as StatusFilter)
      : 'todas';

  const pageTheme =
    typeof raw?.pageTheme === 'string' && VALID_THEMES.has(raw.pageTheme)
      ? (raw.pageTheme as PageTheme)
      : 'claro';

  return {
    answers,
    currentQuestionId,
    selectedUnit,
    selectedDifficulty,
    statusFilter,
    pageTheme,
  };
}

function isPermissionError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '').toLowerCase()
      : '';
  return (
    code.includes('permission-denied') ||
    msg.includes('permission-denied') ||
    msg.includes('missing or insufficient permissions')
  );
}

export async function ensurePrivateProfile(user: User): Promise<void> {
  if (!user.emailVerified) return;
  const path = `users/${user.uid}/private/profile`;
  const ref = doc(db, 'users', user.uid, 'private', 'profile');
  const email = (user.email || '').trim().slice(0, 254);
  const displayName = (user.displayName || email.split('@')[0] || 'Estudante').trim().slice(0, 120);

  if (!email || email.length < 3) return;

  let exists = false;
  try {
    const snap = await getDoc(ref);
    exists = snap.exists();
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    return;
  }

  try {
    if (!exists) {
      await setDoc(ref, {
        ownerId: user.uid,
        email,
        displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        email,
        displayName,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, exists ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  }
}

export async function loadAccountProgress(
  account: AppAccount
): Promise<{ exists: boolean; state: SavedProgressState | null }> {
  if (account.provider === 'email') {
    const res = await fetch('/api/progress', {
      headers: {
        Authorization: `Bearer ${account.token}`,
      },
    });
    if (!res.ok) {
      return { exists: false, state: null };
    }
    const data = (await res.json()) as {
      exists?: boolean;
      state?: Partial<SavedProgressState> | null;
    };
    if (!data.exists || !data.state) {
      return { exists: false, state: null };
    }
    return {
      exists: true,
      state: sanitizeProgressState(data.state),
    };
  }

  const user = account.firebaseUser;
  const path = `users/${user.uid}/progress/simulado`;
  const ref = doc(db, 'users', user.uid, 'progress', 'simulado');
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return { exists: false, state: null };
    }
    const data = snap.data() as Partial<SavedProgressState>;
    return {
      exists: true,
      state: sanitizeProgressState(data),
    };
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, OperationType.GET, path);
    }
    return { exists: false, state: null };
  }
}

export async function saveAccountProgress(
  account: AppAccount,
  state: SavedProgressState,
  knownExists: boolean
): Promise<boolean> {
  const clean = sanitizeProgressState(state);

  if (account.provider === 'email') {
    const res = await fetch('/api/progress', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${account.token}`,
      },
      body: JSON.stringify(clean),
    });
    if (!res.ok) {
      throw new Error('Falha ao salvar progresso no servidor.');
    }
    return true;
  }

  const user = account.firebaseUser;
  if (!user.emailVerified) return knownExists;
  const path = `users/${user.uid}/progress/simulado`;
  const ref = doc(db, 'users', user.uid, 'progress', 'simulado');

  let exists = knownExists;
  if (!exists) {
    try {
      const snap = await getDoc(ref);
      exists = snap.exists();
    } catch (error) {
      if (isPermissionError(error)) {
        handleFirestoreError(error, OperationType.GET, path);
      }
      throw error;
    }
  }

  try {
    if (!exists) {
      await setDoc(ref, {
        ownerId: user.uid,
        answers: clean.answers,
        currentQuestionId: clean.currentQuestionId,
        selectedUnit: clean.selectedUnit,
        selectedDifficulty: clean.selectedDifficulty,
        statusFilter: clean.statusFilter,
        pageTheme: clean.pageTheme,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return true;
    }

    await updateDoc(ref, {
      answers: clean.answers,
      currentQuestionId: clean.currentQuestionId,
      selectedUnit: clean.selectedUnit,
      selectedDifficulty: clean.selectedDifficulty,
      statusFilter: clean.statusFilter,
      pageTheme: clean.pageTheme,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    if (isPermissionError(error)) {
      handleFirestoreError(error, exists ? OperationType.UPDATE : OperationType.CREATE, path);
    }
    throw error;
  }
}

export async function restoreEmailSession(): Promise<EmailAccount | null> {
  let token: string | null = null;
  try {
    token = localStorage.getItem(EMAIL_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      try {
        localStorage.removeItem(EMAIL_TOKEN_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
      return null;
    }
    const data = (await res.json()) as {
      user?: { uid: string; email: string; displayName: string };
    };
    if (!data.user?.uid || !data.user?.email) return null;
    return {
      uid: data.user.uid,
      email: data.user.email,
      displayName: data.user.displayName || data.user.email.split('@')[0],
      provider: 'email',
      token,
    };
  } catch {
    return null;
  }
}

export function findFirstUnansweredId(answers: AnswersMap, totalQuestions: number): number {
  for (let id = 1; id <= totalQuestions; id++) {
    if (!answers[id]) return id;
  }
  return 1;
}
