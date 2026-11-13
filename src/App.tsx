import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  XCircle,
  BookOpen,
  BarChart3,
  ListChecks,
  Filter,
  FileDown,
  Palette,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  Compass,
} from 'lucide-react';
import { ALL_QUESTIONS } from './data/questions';
import { CURRICULUM } from './data/curriculum';
import { AlternativeKey, AnswersMap, Difficulty } from './types/quiz';
import { calculateTriStats } from './utils/tri';
import { downloadQuestionsPdf } from './utils/pdfExport';
import { downloadQuestionsWord } from './utils/wordExport';
import { auth } from './firebase';
import { AuthModal } from './components/AuthModal';
import {
  AppAccount,
  EMAIL_TOKEN_STORAGE_KEY,
  EmailAccount,
  ensurePrivateProfile,
  findFirstUnansweredId,
  loadAccountProgress,
  PageTheme,
  restoreEmailSession,
  sanitizeProgressState,
  saveAccountProgress,
  SavedProgressState,
  StatusFilter,
} from './services/progressSync';

type ViewTab = 'simulado' | 'unidades' | 'desempenho' | 'gabarito';
type SyncState = 'guest' | 'loading' | 'synced' | 'syncing' | 'error';

const STORAGE_KEY = 'filoenem_answers_v2';
const LAST_QUESTION_KEY = 'filoenem_last_q_v2';
const THEME_KEY = 'filoenem_page_theme_v1';

function userStorageKey(uid: string) {
  return `filoenem_user_state_v2_${uid}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('simulado');
  const [answers, setAnswers] = useState<AnswersMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
  const [currentQuestionId, setCurrentQuestionId] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem(LAST_QUESTION_KEY));
      return Number.isInteger(saved) && saved >= 1 && saved <= ALL_QUESTIONS.length ? saved : 1;
    } catch {
      return 1;
    }
  });
  const [showAllComments, setShowAllComments] = useState<boolean>(true);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [authAccount, setAuthAccount] = useState<AppAccount | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [syncState, setSyncState] = useState<SyncState>('guest');
  const [resumeBanner, setResumeBanner] = useState<string | null>(null);

  const hydratedUidRef = useRef<string | null>(null);
  const cloudDocExistsRef = useRef<boolean>(false);
  const latestGuestRef = useRef<{ answers: AnswersMap; currentQuestionId: number }>({
    answers,
    currentQuestionId,
  });

  const [pageTheme, setPageTheme] = useState<PageTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as PageTheme | null;
      return saved === 'sepia' || saved === 'escuro' ? saved : 'claro';
    } catch {
      return 'claro';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, pageTheme);
    } catch {
      // Ignore storage quota errors
    }
    const bgMap: Record<PageTheme, string> = {
      claro: '#f8fafc',
      sepia: '#fef9c3',
      escuro: '#18181b',
    };
    document.body.style.backgroundColor = bgMap[pageTheme];
  }, [pageTheme]);

  const cyclePageTheme = () => {
    setPageTheme((prev) => (prev === 'claro' ? 'sepia' : prev === 'sepia' ? 'escuro' : 'claro'));
  };

  const pageBgClass =
    pageTheme === 'sepia'
      ? 'bg-[#FEFCE8] text-slate-900'
      : pageTheme === 'escuro'
        ? 'bg-zinc-900 text-white'
        : 'bg-slate-50 text-slate-900';

  const surfaceClass =
    pageTheme === 'sepia'
      ? 'bg-[#FEF9C3] border-amber-200 text-slate-900'
      : pageTheme === 'escuro'
        ? 'bg-zinc-800 border-zinc-700 text-white'
        : 'bg-white border-slate-200 text-slate-900';

  const isDark = pageTheme === 'escuro';
  const isSepia = pageTheme === 'sepia';

  const headerClass = isSepia
    ? 'bg-[#FEF9C3] border-amber-200 text-slate-900'
    : isDark
      ? 'bg-zinc-800 border-zinc-700 text-white'
      : 'bg-white border-slate-200 text-slate-900';

  // Keep latest guest or authenticated local cache updated
  useEffect(() => {
    if (!authAccount) {
      latestGuestRef.current = { answers, currentQuestionId };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
        localStorage.setItem(LAST_QUESTION_KEY, String(currentQuestionId));
      } catch {
        // Ignore storage quota errors
      }
    } else if (hydratedUidRef.current === authAccount.uid) {
      try {
        const snapshot: SavedProgressState = {
          answers,
          currentQuestionId,
          selectedUnit,
          selectedDifficulty,
          statusFilter,
          pageTheme,
        };
        localStorage.setItem(userStorageKey(authAccount.uid), JSON.stringify(snapshot));
      } catch {
        // Ignore storage quota errors
      }
    }
  }, [answers, currentQuestionId, selectedUnit, selectedDifficulty, statusFilter, pageTheme, authAccount]);

  const hydrateAccount = useCallback(async (account: AppAccount) => {
    setAuthAccount(account);
    setAuthReady(true);
    setSyncState('loading');
    hydratedUidRef.current = null;

    let localUserState: SavedProgressState | null = null;
    try {
      const rawUser = localStorage.getItem(userStorageKey(account.uid));
      if (rawUser) {
        localUserState = sanitizeProgressState(JSON.parse(rawUser), ALL_QUESTIONS.length);
      }
    } catch {
      localUserState = null;
    }

    const guestSnap = latestGuestRef.current;

    try {
      if (account.provider === 'google' && account.firebaseUser.emailVerified) {
        await ensurePrivateProfile(account.firebaseUser);
      }
      const cloudRes = await loadAccountProgress(account);
      cloudDocExistsRef.current = cloudRes.exists;

      if (cloudRes.exists && cloudRes.state) {
        const mergedAnswers: AnswersMap = {
          ...guestSnap.answers,
          ...(localUserState?.answers || {}),
          ...cloudRes.state.answers,
        };
        const answeredTotal = Object.keys(mergedAnswers).length;
        const targetQ =
          cloudRes.state.currentQuestionId > 1
            ? cloudRes.state.currentQuestionId
            : answeredTotal > 0
              ? findFirstUnansweredId(mergedAnswers, ALL_QUESTIONS.length)
              : guestSnap.currentQuestionId;

        setAnswers(mergedAnswers);
        setCurrentQuestionId(targetQ);
        setSelectedUnit(cloudRes.state.selectedUnit);
        setSelectedDifficulty(cloudRes.state.selectedDifficulty);
        setStatusFilter(cloudRes.state.statusFilter);
        setPageTheme(cloudRes.state.pageTheme);

        if (answeredTotal > 0 || targetQ > 1) {
          setResumeBanner(
            `Bem-vindo(a), ${account.email}! Retomando na questão ${String(targetQ).padStart(3, '0')} (${answeredTotal}/${ALL_QUESTIONS.length} respondidas).`
          );
        } else {
          setResumeBanner(`Conectado como ${account.email}. Seu progresso será salvo automaticamente.`);
        }
      } else {
        const initialAnswers: AnswersMap = {
          ...guestSnap.answers,
          ...(localUserState?.answers || {}),
        };
        const initialQ =
          localUserState?.currentQuestionId && localUserState.currentQuestionId > 1
            ? localUserState.currentQuestionId
            : guestSnap.currentQuestionId > 1
              ? guestSnap.currentQuestionId
              : Object.keys(initialAnswers).length > 0
                ? findFirstUnansweredId(initialAnswers, ALL_QUESTIONS.length)
                : 1;

        setAnswers(initialAnswers);
        setCurrentQuestionId(initialQ);

        const existsNow = await saveAccountProgress(
          account,
          {
            answers: initialAnswers,
            currentQuestionId: initialQ,
            selectedUnit,
            selectedDifficulty,
            statusFilter,
            pageTheme,
          },
          false
        );
        cloudDocExistsRef.current = existsNow;
        setResumeBanner(`Conectado como ${account.email}. Seu progresso será salvo automaticamente.`);
      }

      hydratedUidRef.current = account.uid;
      setSyncState('synced');
    } catch {
      hydratedUidRef.current = account.uid;
      setSyncState('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth listener & initial session restoration
  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (cancelled) return;

      if (user) {
        const googleAcc: AppAccount = {
          uid: user.uid,
          email: user.email || 'usuario@google.com',
          displayName: user.displayName || user.email?.split('@')[0] || 'Estudante',
          provider: 'google',
          firebaseUser: user,
        };
        await hydrateAccount(googleAcc);
        return;
      }

      const emailSession = await restoreEmailSession();
      if (cancelled) return;

      if (emailSession) {
        await hydrateAccount(emailSession);
        return;
      }

      setAuthAccount(null);
      setAuthReady(true);
      hydratedUidRef.current = null;
      cloudDocExistsRef.current = false;
      setSyncState('guest');
      setResumeBanner(null);
      try {
        const savedAns = localStorage.getItem(STORAGE_KEY);
        const savedQ = Number(localStorage.getItem(LAST_QUESTION_KEY));
        setAnswers(savedAns ? JSON.parse(savedAns) : {});
        setCurrentQuestionId(
          Number.isInteger(savedQ) && savedQ >= 1 && savedQ <= ALL_QUESTIONS.length ? savedQ : 1
        );
      } catch {
        setAnswers({});
        setCurrentQuestionId(1);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [hydrateAccount]);

  // Debounced sync whenever state changes for a signed-in user
  useEffect(() => {
    if (!authAccount || hydratedUidRef.current !== authAccount.uid) return;

    setSyncState('syncing');
    const timer = window.setTimeout(async () => {
      try {
        const existsNow = await saveAccountProgress(
          authAccount,
          {
            answers,
            currentQuestionId,
            selectedUnit,
            selectedDifficulty,
            statusFilter,
            pageTheme,
          },
          cloudDocExistsRef.current
        );
        cloudDocExistsRef.current = existsNow;
        setSyncState('synced');
      } catch {
        setSyncState('error');
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [answers, currentQuestionId, selectedUnit, selectedDifficulty, statusFilter, pageTheme, authAccount]);

  const handleEmailAuthenticated = async (account: EmailAccount) => {
    await hydrateAccount(account);
  };

  const handleSignOut = async () => {
    try {
      if (authAccount && hydratedUidRef.current === authAccount.uid) {
        await saveAccountProgress(
          authAccount,
          {
            answers,
            currentQuestionId,
            selectedUnit,
            selectedDifficulty,
            statusFilter,
            pageTheme,
          },
          cloudDocExistsRef.current
        );
      }
    } catch {
      // Proceed with sign out even if offline
    }

    if (authAccount?.provider === 'google') {
      await signOut(auth);
      return;
    }

    try {
      localStorage.removeItem(EMAIL_TOKEN_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setAuthAccount(null);
    hydratedUidRef.current = null;
    cloudDocExistsRef.current = false;
    setSyncState('guest');
    setResumeBanner(null);
    try {
      const savedAns = localStorage.getItem(STORAGE_KEY);
      const savedQ = Number(localStorage.getItem(LAST_QUESTION_KEY));
      setAnswers(savedAns ? JSON.parse(savedAns) : {});
      setCurrentQuestionId(
        Number.isInteger(savedQ) && savedQ >= 1 && savedQ <= ALL_QUESTIONS.length ? savedQ : 1
      );
    } catch {
      setAnswers({});
      setCurrentQuestionId(1);
    }
  };

  const handleJumpToNextUnanswered = () => {
    const nextId = findFirstUnansweredId(answers, ALL_QUESTIONS.length);
    setSelectedUnit('all');
    setSelectedDifficulty('all');
    setStatusFilter('todas');
    setCurrentQuestionId(nextId);
    setActiveTab('simulado');
  };

  const filteredQuestions = useMemo(() => {
    return ALL_QUESTIONS.filter((q) => {
      if (selectedUnit !== 'all' && q.unitId !== selectedUnit) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (statusFilter === 'nao_respondidas' && answers[q.id]) return false;
      if (statusFilter === 'erradas' && (!answers[q.id] || answers[q.id] === q.correct)) return false;
      return true;
    });
  }, [selectedUnit, selectedDifficulty, statusFilter, answers]);

  const currentQuestion = useMemo(() => {
    return (
      filteredQuestions.find((q) => q.id === currentQuestionId) ||
      filteredQuestions[0] ||
      ALL_QUESTIONS[0]
    );
  }, [filteredQuestions, currentQuestionId]);

  const currentIndex = useMemo(() => {
    const idx = filteredQuestions.findIndex((q) => q.id === currentQuestion.id);
    return idx >= 0 ? idx : 0;
  }, [filteredQuestions, currentQuestion]);

  const triStats = useMemo(() => calculateTriStats(ALL_QUESTIONS, answers), [answers]);

  const handleSelectAlternative = (key: AlternativeKey) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: key,
    }));
  };

  const handleRedoQuestion = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentQuestionId(filteredQuestions[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentQuestionId(filteredQuestions[currentIndex - 1].id);
    }
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3500);
      return;
    }
    setAnswers({});
    setConfirmReset(false);
    setCurrentQuestionId(1);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'simulado' || showAuthModal) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      const keyMap: Record<string, AlternativeKey> = {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
        '5': 'E',
        a: 'A',
        b: 'B',
        c: 'C',
        d: 'D',
        e: 'E',
      };
      const mapped = keyMap[e.key.toLowerCase()];
      if (mapped && filteredQuestions.length > 0) handleSelectAlternative(mapped);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const currentUnitObj = CURRICULUM.find((u) => u.id === currentQuestion.unitId);
  const currentChapterObj = currentUnitObj?.chapters.find((c) => c.id === currentQuestion.chapterId);
  const userAnswer = answers[currentQuestion.id];
  const isAnswered = Boolean(userAnswer);

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${pageBgClass} ${isDark ? 'theme-dark' : ''}`}>
      {/* Top Bar Contract */}
      <header className={`border-b sticky top-0 z-30 transition-colors ${headerClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          <button
            onClick={() => setActiveTab('simulado')}
            className="font-display text-xl font-bold tracking-tight whitespace-nowrap shrink-0 cursor-pointer"
          >
            FiloENEM
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium opacity-80">
            <button
              onClick={() => setActiveTab('simulado')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'simulado'
                  ? 'border-blue-700 text-slate-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Simulado
            </button>
            <button
              onClick={() => setActiveTab('unidades')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'unidades'
                  ? 'border-blue-700 text-slate-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Unidades
            </button>
            <button
              onClick={() => setActiveTab('desempenho')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'desempenho'
                  ? 'border-blue-700 text-slate-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Desempenho TRI
            </button>
            <button
              onClick={() => setActiveTab('gabarito')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'gabarito'
                  ? 'border-blue-700 text-slate-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Gabarito
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {authReady && (
              authAccount ? (
                <div className="flex items-center gap-1.5">
                  <div
                    title={authAccount.email || 'Conta conectada'}
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                      isDark
                        ? 'border-zinc-600 bg-zinc-700 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  >
                    {syncState === 'error' ? (
                      <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span className="max-w-[140px] truncate">{authAccount.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    title="Sair da conta"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isDark
                        ? 'border-zinc-600 bg-zinc-700 text-white hover:bg-zinc-600'
                        : 'border-slate-300/80 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Entrar
                </button>
              )
            )}
            <button
              onClick={cyclePageTheme}
              title="Mudar cor da página"
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isDark
                  ? 'border-zinc-600 bg-zinc-700 text-white hover:bg-zinc-600'
                  : isSepia
                    ? 'border-amber-300 bg-[#FEFCE8] text-slate-900 hover:bg-amber-100'
                    : 'border-slate-300/80 bg-white/80 text-slate-800 hover:bg-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-blue-700" />
              {pageTheme === 'claro' ? 'Claro' : pageTheme === 'sepia' ? 'Sépia' : 'Escuro'}
            </button>
            <button
              onClick={handleReset}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                confirmReset
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {confirmReset ? 'Confirmar' : 'Reiniciar'}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center justify-around text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('simulado')}
            className={`px-2 py-1 ${activeTab === 'simulado' ? 'text-blue-700 font-semibold' : ''}`}
          >
            Simulado
          </button>
          <button
            onClick={() => setActiveTab('unidades')}
            className={`px-2 py-1 ${activeTab === 'unidades' ? 'text-blue-700 font-semibold' : ''}`}
          >
            Unidades
          </button>
          <button
            onClick={() => setActiveTab('desempenho')}
            className={`px-2 py-1 ${activeTab === 'desempenho' ? 'text-blue-700 font-semibold' : ''}`}
          >
            TRI
          </button>
          <button
            onClick={() => setActiveTab('gabarito')}
            className={`px-2 py-1 ${activeTab === 'gabarito' ? 'text-blue-700 font-semibold' : ''}`}
          >
            Gabarito
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {resumeBanner && (
          <div className={`mb-6 border rounded-xl px-4 py-3 flex items-center justify-between gap-4 text-xs sm:text-sm ${
            isDark
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{resumeBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setResumeBanner(null)}
              className="text-xs font-semibold underline shrink-0 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        {activeTab === 'simulado' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left / Main Interactive Question Stage */}
            {filteredQuestions.length === 0 ? (
              <section className={`lg:col-span-8 border rounded-xl p-8 text-center space-y-4 transition-colors ${surfaceClass}`}>
                <p className="text-base font-semibold text-slate-900">
                  Nenhuma questão corresponde aos filtros selecionados.
                </p>
                <p className="text-sm text-slate-600">
                  Ajuste a unidade, o nível TRI ou o status para continuar praticando.
                </p>
                <button
                  onClick={() => {
                    setSelectedUnit('all');
                    setSelectedDifficulty('all');
                    setStatusFilter('todas');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  Limpar filtros
                </button>
              </section>
            ) : (
            <section className={`lg:col-span-8 border rounded-xl p-6 sm:p-8 transition-colors ${surfaceClass}`}>
              {/* Unboxed Metadata Line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-4 font-mono tabular-nums">
                <span className="font-semibold text-slate-900">
                  Questão {String(currentQuestion.id).padStart(3, '0')} / {ALL_QUESTIONS.length}
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentUnitObj?.title}</span>
                <span aria-hidden="true">·</span>
                <span>{currentChapterObj?.title}</span>
                <span aria-hidden="true">·</span>
                <span>{currentQuestion.topic}</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-slate-700">
                  Nível {currentQuestion.difficulty} (Peso TRI {currentQuestion.triWeight.toFixed(1)})
                </span>
              </div>

              {/* Base Text */}
              <div
                className={`border rounded-lg p-5 mb-5 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : isSepia
                      ? 'bg-[#FEFCE8] border-amber-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200/80 text-slate-800'
                }`}
              >
                <p className="text-[15px] sm:text-base leading-relaxed whitespace-pre-line text-justify">
                  {currentQuestion.baseText}
                </p>
                <p className={`mt-3 text-xs italic ${isDark ? 'text-white/80' : 'text-slate-500'}`}>
                  {currentQuestion.source}
                </p>
              </div>

              {/* Command */}
              <h1
                className={`font-sans text-base sm:text-lg font-semibold leading-snug mb-6 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {currentQuestion.command}
              </h1>

              {/* Alternatives A-E */}
              <div className="space-y-3">
                {currentQuestion.alternatives.map((alt) => {
                  const isSelected = userAnswer === alt.key;
                  const isCorrectAlt = currentQuestion.correct === alt.key;

                  let containerClass = isDark
                    ? 'border-zinc-600 bg-zinc-700/70 hover:border-zinc-500 hover:bg-zinc-700 text-white'
                    : isSepia
                      ? 'border-amber-200 bg-[#FEFCE8] hover:bg-[#FEF9C3] text-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800';
                  let badgeClass = isDark
                    ? 'bg-zinc-800 text-white border-zinc-500'
                    : 'bg-slate-100 text-slate-700 border-slate-200';
                  let statusText = '';

                  if (isAnswered) {
                    if (isCorrectAlt) {
                      containerClass = isDark
                        ? 'border-emerald-500 bg-emerald-950/60 text-white'
                        : 'border-emerald-600 bg-emerald-50/50';
                      badgeClass = 'bg-emerald-600 text-white border-emerald-600';
                      statusText = isSelected ? 'Sua escolha · Correta' : 'Gabarito Correto';
                    } else if (isSelected && !isCorrectAlt) {
                      containerClass = isDark
                        ? 'border-red-500 bg-red-950/60 text-white'
                        : 'border-red-600 bg-red-50/50';
                      badgeClass = 'bg-red-600 text-white border-red-600';
                      statusText = 'Sua escolha · Incorreta';
                    } else {
                      containerClass = isDark
                        ? 'border-zinc-700 bg-zinc-800/60 text-white opacity-90'
                        : 'border-slate-200 bg-white opacity-90';
                    }
                  }

                  return (
                    <button
                      key={alt.key}
                      onClick={() => handleSelectAlternative(alt.key)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors cursor-pointer ${containerClass}`}
                    >
                      <div className="flex items-start gap-3.5">
                        <span
                          className={`w-7 h-7 rounded-md border text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5 ${badgeClass}`}
                        >
                          {alt.key}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm sm:text-[15px] leading-relaxed text-justify">
                              {alt.text}
                            </p>
                            {isAnswered && isCorrectAlt && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            )}
                            {isAnswered && isSelected && !isCorrectAlt && (
                              <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                            )}
                          </div>

                          {statusText && (
                            <p
                              className={`mt-1.5 text-xs font-semibold ${
                                isCorrectAlt ? 'text-emerald-700' : 'text-red-700'
                              }`}
                            >
                              {statusText}
                            </p>
                          )}

                          {/* Gabarito Comentado for every alternative when answered */}
                          {isAnswered && (showAllComments || isSelected || isCorrectAlt) && (
                            <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 text-xs sm:text-sm text-slate-600 leading-relaxed">
                              <span className="font-semibold text-slate-800">Comentário: </span>
                              {alt.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer Controls */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex >= filteredQuestions.length - 1}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {isAnswered && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleRedoQuestion}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Refazer questão
                    </button>
                    <button
                      onClick={() => setShowAllComments((v) => !v)}
                      className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
                    >
                      {showAllComments
                        ? 'Mostrar apenas selecionada e correta'
                        : 'Mostrar comentários de todas as 5 alternativas'}
                    </button>
                  </div>
                )}
              </div>
            </section>
            )}

            {/* Right / Control & Navigator Deck */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Account & Cloud Resume Card */}
              <div className={`border rounded-xl p-5 space-y-3 transition-colors ${surfaceClass}`}>
                {authAccount ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500">Conta Conectada</span>
                      <span
                        className={`text-[11px] font-medium ${
                          syncState === 'error' ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {syncState === 'syncing'
                          ? 'Salvando...'
                          : syncState === 'error'
                            ? 'Salvo localmente'
                            : 'Progresso salvo'}
                      </span>
                    </div>
                    <p className="text-xs font-mono truncate">{authAccount.email}</p>
                    <button
                      type="button"
                      onClick={handleJumpToNextUnanswered}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Ir para próxima não respondida
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold">Retome onde parou</div>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-white/75' : 'text-slate-600'}`}>
                      Entre com seu e-mail para salvar suas respostas e continuar o simulado de onde parou.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Entrar por E-mail
                    </button>
                  </>
                )}
              </div>

              {/* Live TRI Score Card */}
              <div className={`border rounded-xl p-5 transition-colors ${surfaceClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500">Estimativa TRI</span>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {triStats.answeredCount}/{ALL_QUESTIONS.length} respondidas
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                    {triStats.triScore}
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    {triStats.coherenceLabel}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-slate-500">Fácil</div>
                    <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {triStats.byDifficulty.Fácil.correct}/{triStats.byDifficulty.Fácil.total}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Médio</div>
                    <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {triStats.byDifficulty.Médio.correct}/{triStats.byDifficulty.Médio.total}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Difícil</div>
                    <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {triStats.byDifficulty.Difícil.correct}/{triStats.byDifficulty.Difícil.total}
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Full PDF & Word Card in Simulado */}
              <div className={`border rounded-xl p-5 space-y-3 transition-colors ${surfaceClass}`}>
                <div>
                  <div className="text-sm font-semibold">Caderno Completo</div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-white/75' : 'text-slate-600'}`}>
                    {ALL_QUESTIONS.length} questões por capítulos + gabarito oficial
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => downloadQuestionsPdf(ALL_QUESTIONS)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Baixar PDF
                  </button>
                  <button
                    onClick={() => downloadQuestionsWord(ALL_QUESTIONS)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Baixar Word
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className={`border rounded-xl p-5 space-y-4 transition-colors ${surfaceClass}`}>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Filter className="w-4 h-4 text-slate-500" />
                  Filtros do Caderno
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unidade</label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800"
                  >
                    <option value="all">Todas as Unidades ({ALL_QUESTIONS.length})</option>
                    {CURRICULUM.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nível TRI
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) =>
                        setSelectedDifficulty(e.target.value as Difficulty | 'all')
                      }
                      className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-800"
                    >
                      <option value="all">Todos</option>
                      <option value="Fácil">Fácil</option>
                      <option value="Médio">Médio</option>
                      <option value="Difícil">Difícil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-800"
                    >
                      <option value="todas">Todas</option>
                      <option value="nao_respondidas">Não respondidas</option>
                      <option value="erradas">Erradas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Question Grid Navigator */}
              <div className={`border rounded-xl p-5 transition-colors ${surfaceClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-900">
                    Navegador ({filteredQuestions.length})
                  </span>
                  <span className="text-xs text-slate-500">Atalhos: A–E, ← →</span>
                </div>

                {filteredQuestions.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    Nenhuma questão encontrada com esses filtros.
                  </p>
                ) : (
                  <div className="grid grid-cols-8 gap-1.5 max-h-64 overflow-y-auto pr-1">
                    {filteredQuestions.map((q) => {
                      const ans = answers[q.id];
                      const isCurrent = q.id === currentQuestion.id;
                      let btnStyle = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
                      if (ans) {
                        btnStyle =
                          ans === q.correct
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-red-100 text-red-900 border-red-300';
                      }
                      if (isCurrent) {
                        btnStyle += ' ring-2 ring-blue-700 ring-offset-1';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionId(q.id)}
                          className={`h-8 text-xs font-mono font-medium rounded border transition-colors cursor-pointer tabular-nums ${btnStyle}`}
                        >
                          {q.id}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'unidades' && (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Conteúdo Programático
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Selecione qualquer unidade para filtrar o simulado e praticar os temas do 3º ano do
                Ensino Médio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CURRICULUM.map((unit) => {
                const unitQuestions = ALL_QUESTIONS.filter((q) => q.unitId === unit.id);
                const answeredInUnit = unitQuestions.filter((q) => answers[q.id]).length;
                return (
                  <div
                    key={unit.id}
                    className={`border rounded-xl p-6 flex flex-col justify-between transition-colors ${surfaceClass}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-blue-700" />
                        <span className="text-xs font-mono text-slate-500 tabular-nums">
                          {answeredInUnit}/{unitQuestions.length} respondidas
                        </span>
                      </div>
                      <h2 className="font-display text-lg font-bold text-slate-900 mb-3">
                        {unit.title}
                      </h2>
                      <div className="space-y-3">
                        {unit.chapters.map((cap) => (
                          <div key={cap.id}>
                            <h3 className="text-xs font-semibold text-slate-800">{cap.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {cap.topics.join(' · ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedUnit(unit.id);
                        setSelectedDifficulty('all');
                        setStatusFilter('todas');
                        if (unitQuestions[0]) setCurrentQuestionId(unitQuestions[0].id);
                        setActiveTab('simulado');
                      }}
                      className="mt-6 w-full py-2.5 px-4 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Praticar esta Unidade
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'desempenho' && (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Desempenho e Análise TRI
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                A Teoria de Resposta ao Item (TRI) valoriza a coerência pedagógica: acertar questões
                fáceis e médias sustenta sua nota nas questões difíceis.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className={`border rounded-xl p-5 transition-colors ${surfaceClass}`}>
                <div className="text-xs text-slate-500">Nota TRI Estimada</div>
                <div className="font-mono text-3xl font-bold text-slate-900 mt-1 tabular-nums">
                  {triStats.triScore}
                </div>
              </div>
              <div className={`border rounded-xl p-5 transition-colors ${surfaceClass}`}>
                <div className="text-xs text-slate-500">Questões Respondidas</div>
                <div className="font-mono text-3xl font-bold text-slate-900 mt-1 tabular-nums">
                  {triStats.answeredCount} / {ALL_QUESTIONS.length}
                </div>
              </div>
              <div className={`border rounded-xl p-5 transition-colors ${surfaceClass}`}>
                <div className="text-xs text-slate-500">Acertos Totais</div>
                <div className="font-mono text-3xl font-bold text-emerald-700 mt-1 tabular-nums">
                  {triStats.correctCount} ({triStats.accuracyPercent}%)
                </div>
              </div>
              <div className={`border rounded-xl p-5 transition-colors ${surfaceClass}`}>
                <div className="text-xs text-slate-500">Padrão de Coerência</div>
                <div className="text-sm font-semibold text-slate-900 mt-2 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-700" />
                  {triStats.coherenceLabel}
                </div>
              </div>
            </div>

            <div className={`border rounded-xl p-6 transition-colors ${surfaceClass}`}>
              <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
                Desempenho por Unidade
              </h2>
              <div className="space-y-4">
                {CURRICULUM.map((unit) => {
                  const qs = ALL_QUESTIONS.filter((q) => q.unitId === unit.id);
                  const answered = qs.filter((q) => answers[q.id]).length;
                  const correct = qs.filter((q) => answers[q.id] === q.correct).length;
                  const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0;
                  return (
                    <div key={unit.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-800">{unit.title}</span>
                        <span className="font-mono text-xs text-slate-600 tabular-nums">
                          {correct}/{answered} acertos ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-700 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gabarito' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Gabarito Oficial Comentado
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Consulte rapidamente a resposta correta e o comentário de cada uma das{' '}
                  {ALL_QUESTIONS.length} questões.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
                  <ListChecks className="w-4 h-4 text-blue-700" />
                  {ALL_QUESTIONS.length} questões
                </span>
                <button
                  onClick={() => downloadQuestionsPdf(ALL_QUESTIONS)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Baixar PDF
                </button>
                <button
                  onClick={() => downloadQuestionsWord(ALL_QUESTIONS)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Baixar Word
                </button>
              </div>
            </div>

            <div className={`border rounded-xl divide-y transition-colors ${surfaceClass} ${isSepia ? 'divide-amber-200' : 'divide-slate-200'}`}>
              {ALL_QUESTIONS.map((q) => {
                const correctAlt = q.alternatives.find((a) => a.key === q.correct);
                const userAns = answers[q.id];
                return (
                  <div key={q.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                        <span className="font-semibold text-slate-900">
                          Questão {String(q.id).padStart(3, '0')}
                        </span>
                        <span>·</span>
                        <span>{q.topic}</span>
                        <span>·</span>
                        <span>{q.difficulty}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{q.command}</p>
                      <p className="text-xs sm:text-sm text-emerald-800">
                        <span className="font-semibold">Gabarito {q.correct}: </span>
                        {correctAlt?.comment}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {userAns && (
                        <span
                          className={`text-xs font-mono font-semibold ${
                            userAns === q.correct ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          Sua: {userAns}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedUnit('all');
                          setSelectedDifficulty('all');
                          setStatusFilter('todas');
                          setCurrentQuestionId(q.id);
                          setActiveTab('simulado');
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        Abrir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Print-only Complete PDF Layout */}
      <section className="hidden print:block p-8 text-slate-900 bg-white">
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="font-display text-2xl font-bold">
            FiloENEM — Simulado Completo de Filosofia ({ALL_QUESTIONS.length} Questões TRI)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            3º Ano do Ensino Médio · Estilo ENEM · Gabarito oficial ao final do caderno
          </p>
        </div>

        <div className="space-y-6">
          {ALL_QUESTIONS.map((q) => (
            <article key={q.id} className="break-inside-avoid pb-4 border-b border-slate-200">
              <div className="text-xs font-mono font-semibold text-slate-700 mb-1">
                Questão {String(q.id).padStart(3, '0')} · {q.topic} · Nível {q.difficulty}
              </div>
              <p className="text-xs leading-relaxed text-justify mb-1.5">{q.baseText}</p>
              <p className="text-[11px] text-slate-500 italic mb-2">{q.source}</p>
              <p className="text-xs font-semibold mb-2">{q.command}</p>
              <div className="space-y-1">
                {q.alternatives.map((alt) => (
                  <p key={alt.key} className="text-xs leading-snug text-justify">
                    <span className="font-mono font-semibold">{alt.key}) </span>
                    {alt.text}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="break-before-page pt-6">
          <h2 className="font-display text-xl font-bold mb-4">Gabarito Oficial</h2>
          <div className="grid grid-cols-5 gap-2 text-xs font-mono">
            {ALL_QUESTIONS.map((q) => (
              <div key={q.id} className="border border-slate-300 px-2 py-1">
                {String(q.id).padStart(3, '0')}: <strong>{q.correct}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isDark={isDark}
        isSepia={isSepia}
        onEmailAuthenticated={handleEmailAuthenticated}
      />
    </div>
  );
}
