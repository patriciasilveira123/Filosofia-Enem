import { FormEvent, useEffect, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { Eye, EyeOff, Mail, X, CheckCircle2, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { auth, googleProvider, translateAuthError } from '../firebase';
import { EMAIL_TOKEN_STORAGE_KEY, EmailAccount } from '../services/progressSync';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  isSepia: boolean;
  onEmailAuthenticated: (
    account: EmailAccount,
    options?: {
      welcomeEmailSent?: boolean;
      welcomeEmailError?: string;
      isNewRegistration?: boolean;
    }
  ) => Promise<void>;
}

type AuthMode = 'login' | 'register' | 'forgot';
type ForgotStep = 'request' | 'reset';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthModal({
  isOpen,
  onClose,
  isDark,
  isSepia,
  onEmailAuthenticated,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [forgotStep, setForgotStep] = useState<ForgotStep>('request');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setMode('login');
      setForgotStep('request');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPassword(false);
      setShowNewPassword(false);
      setErrorMsg(null);
      setSuccessMsg(null);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const modalSurface = isDark
    ? 'bg-zinc-800 border-zinc-700 text-white'
    : isSepia
      ? 'bg-[#FEF9C3] border-amber-200 text-slate-900'
      : 'bg-white border-slate-200 text-slate-900';

  const inputClass = isDark
    ? 'w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
    : isSepia
      ? 'w-full rounded-lg border border-amber-300 bg-[#FEFCE8] px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700'
      : 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700';

  const linkClass = isDark
    ? 'text-blue-400 hover:underline cursor-pointer'
    : 'text-blue-700 hover:underline cursor-pointer';

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setForgotStep('request');
    setConfirmPassword('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      try {
        localStorage.removeItem(EMAIL_TOKEN_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
      onClose();
    } catch (err) {
      setErrorMsg(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg('Digite um endereço de e-mail válido.');
      return;
    }
    if (password.length < 6 || password.length > 128) {
      setErrorMsg('A senha deve ter entre 6 e 128 caracteres.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não conferem.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          displayName: mode === 'register' ? name.trim() : undefined,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        token?: string;
        welcomeEmailSent?: boolean;
        welcomeEmailError?: string;
        user?: { uid: string; email: string; displayName: string };
      };

      if (!response.ok || !payload.token || !payload.user) {
        setErrorMsg(payload.error || 'Não foi possível concluir o login. Tente novamente.');
        return;
      }

      try {
        localStorage.setItem(EMAIL_TOKEN_STORAGE_KEY, payload.token);
      } catch {
        // Ignore storage errors
      }

      await onEmailAuthenticated(
        {
          uid: payload.user.uid,
          email: payload.user.email,
          displayName: payload.user.displayName,
          provider: 'email',
          token: payload.token,
        },
        {
          isNewRegistration: mode === 'register',
          welcomeEmailSent: Boolean(payload.welcomeEmailSent),
          welcomeEmailError: payload.welcomeEmailError,
        }
      );

      onClose();
    } catch {
      setErrorMsg('Falha de comunicação com o servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRecoveryCode = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg('Digite um endereço de e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        setErrorMsg(payload.error || 'Não foi possível enviar o código de recuperação.');
        return;
      }

      setSuccessMsg(
        payload.message ||
          'Enviamos um código de 6 dígitos para o seu e-mail. Verifique sua caixa de entrada ou spam.'
      );
      setForgotStep('reset');
    } catch {
      setErrorMsg('Falha de comunicação com o servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);

    const normalizedEmail = email.trim().toLowerCase();
    const cleanedCode = resetCode.replace(/\D/g, '');
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg('Digite um endereço de e-mail válido.');
      return;
    }
    if (!/^\d{6}$/.test(cleanedCode)) {
      setErrorMsg('Digite o código numérico de 6 dígitos enviado para o seu e-mail.');
      return;
    }
    if (newPassword.length < 6 || newPassword.length > 128) {
      setErrorMsg('A nova senha deve ter entre 6 e 128 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('As senhas digitadas não conferem.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          code: cleanedCode,
          newPassword,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        token?: string;
        user?: { uid: string; email: string; displayName: string };
      };

      if (!response.ok || !payload.ok || !payload.token || !payload.user) {
        setErrorMsg(payload.error || 'Não foi possível redefinir a senha. Tente novamente.');
        return;
      }

      try {
        localStorage.setItem(EMAIL_TOKEN_STORAGE_KEY, payload.token);
      } catch {
        // Ignore storage errors
      }

      await onEmailAuthenticated({
        uid: payload.user.uid,
        email: payload.user.email,
        displayName: payload.user.displayName,
        provider: 'email',
        token: payload.token,
      });

      switchMode('login');
      onClose();
    } catch {
      setErrorMsg('Falha de comunicação com o servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className={`w-full max-w-md border rounded-2xl shadow-xl p-6 space-y-5 ${modalSurface}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="auth-modal-title" className="font-display text-xl font-bold">
              {mode === 'forgot' ? 'Recuperar senha' : 'Entrar por E-mail'}
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
              {mode === 'forgot'
                ? 'Enviaremos um código de 6 dígitos para o seu e-mail cadastrado.'
                : 'Salve suas respostas online e retome exatamente da questão onde parou em qualquer dispositivo.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar janela de login"
            className={`p-1.5 rounded-lg disabled:opacity-50 cursor-pointer ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div
            className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs ${
              isDark
                ? 'border-red-800 bg-red-950/60 text-red-200'
                : 'border-red-300 bg-red-50 text-red-900'
            }`}
          >
            <AlertCircle
              className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-700'}`}
            />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs ${
              isDark
                ? 'border-emerald-800 bg-emerald-950/60 text-emerald-200'
                : 'border-emerald-300 bg-emerald-50 text-emerald-900'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}
            />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'forgot' ? (
          <div className="space-y-4">
            {forgotStep === 'request' ? (
              <form onSubmit={handleRequestRecoveryCode} className="space-y-3.5" noValidate>
                <div>
                  <label className="block text-xs font-medium mb-1">E-mail cadastrado</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    autoFocus
                    required
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  {loading ? 'Enviando e-mail...' : 'Enviar código para o e-mail'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5" noValidate>
                <div>
                  <label className="block text-xs font-medium mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium">
                      Código de 6 dígitos (enviado por e-mail)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('request');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`text-[11px] font-semibold ${linkClass}`}
                    >
                      Reenviar código
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    autoFocus
                    required
                    className={`${inputClass} font-mono tracking-widest`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Nova senha</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo de 6 caracteres"
                      autoComplete="new-password"
                      maxLength={128}
                      required
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      aria-label={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 cursor-pointer ${
                        isDark
                          ? 'text-zinc-400 hover:text-zinc-200'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Confirmar nova senha</label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    autoComplete="new-password"
                    maxLength={128}
                    required
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  {loading ? 'Salvando nova senha...' : 'Redefinir senha e entrar'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => switchMode('login')}
              disabled={loading}
              className={`w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold disabled:opacity-50 ${linkClass}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar para o login
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
                isDark
                  ? 'border-zinc-600 bg-zinc-700 text-white hover:bg-zinc-600'
                  : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                />
              </svg>
              Entrar com Google (E-mail)
            </button>

            <div className="flex items-center gap-3">
              <div className={`h-px flex-1 ${isDark ? 'bg-zinc-700' : 'bg-slate-200'}`} />
              <span
                className={`text-[11px] uppercase tracking-wider font-medium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}
              >
                ou use e-mail e senha
              </span>
              <div className={`h-px flex-1 ${isDark ? 'bg-zinc-700' : 'bg-slate-200'}`} />
            </div>

            <div
              className={`grid grid-cols-2 gap-1.5 p-1 rounded-lg border text-xs font-semibold ${
                isDark
                  ? 'bg-zinc-900 border-zinc-700'
                  : isSepia
                    ? 'bg-[#FEFCE8] border-amber-200'
                    : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-1.5 rounded-md transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'bg-blue-700 text-white'
                    : isDark
                      ? 'text-zinc-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Já tenho conta
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-1.5 rounded-md transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'bg-blue-700 text-white'
                    : isDark
                      ? 'text-zinc-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Criar conta
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3.5" noValidate>
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium mb-1">Nome (opcional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    maxLength={80}
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                  autoFocus
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium">Senha</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className={`text-[11px] font-semibold ${linkClass}`}
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    maxLength={128}
                    required
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 cursor-pointer ${
                      isDark
                        ? 'text-zinc-400 hover:text-zinc-200'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium mb-1">Confirmar senha</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita sua senha"
                    autoComplete="new-password"
                    maxLength={128}
                    required
                    className={inputClass}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                {loading
                  ? 'Processando...'
                  : mode === 'register'
                    ? 'Criar conta com e-mail'
                    : 'Entrar com e-mail'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
