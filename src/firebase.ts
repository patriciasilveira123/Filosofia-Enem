import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function translateAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const message = error instanceof Error ? error.message : String(error);

  if (code === 'auth/operation-not-allowed' || message.includes('operation-not-allowed')) {
    return 'O login por E-mail/Senha ainda não foi ativado no Console do Firebase. Use o botão "Entrar com Google (E-mail)" acima ou ative o provedor E-mail/senha em Authentication > Sign-in method.';
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-login-credentials'
  ) {
    return 'E-mail ou senha incorretos. Confira os dados digitados ou use "Esqueci minha senha".';
  }
  if (code === 'auth/email-already-in-use') {
    return 'Este e-mail já possui uma conta cadastrada. Clique em "Entrar" para acessar ou redefina sua senha.';
  }
  if (code === 'auth/weak-password') {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }
  if (code === 'auth/invalid-email') {
    return 'Informe um endereço de e-mail válido.';
  }
  if (code === 'auth/missing-password') {
    return 'Digite sua senha para continuar.';
  }
  if (code === 'auth/popup-blocked') {
    return 'O navegador bloqueou a janela de login do Google. Libere pop-ups para este site e tente novamente.';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'A janela de login foi fechada antes da conclusão. Tente novamente.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Este domínio não está autorizado no Firebase Authentication. Adicione o domínio atual nas configurações do Firebase.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Muitas tentativas em sequência. Aguarde alguns instantes antes de tentar novamente.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Falha de conexão com a rede. Verifique sua internet e tente novamente.';
  }
  if (code === 'auth/user-disabled') {
    return 'Esta conta está temporariamente desativada.';
  }
  if (code === 'auth/requires-recent-login') {
    return 'Por segurança, entre novamente na sua conta para concluir esta operação.';
  }

  return 'Não foi possível concluir o login. Verifique seu e-mail e tente novamente.';
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();
