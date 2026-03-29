import type { ProgressState, TableProgress } from "../types";

const STORAGE_KEY = "times-table-kids-progress";

const emptyTable = (): TableProgress => ({
  answered: 0,
  correct: 0,
  practiceSessions: 0,
});

const defaultTableStats = (): Record<string, TableProgress> => {
  const out: Record<string, TableProgress> = {};
  for (let n = 1; n <= 12; n += 1) {
    out[String(n)] = emptyTable();
  }
  return out;
};

const defaultState = (): ProgressState => ({
  totalAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  currentStreak: 0,
  practiceSessions: 0,
  quizSessions: 0,
  quizBestScore: 0,
  lastPlayed: null,
  lastPracticeAt: null,
  practiceDayStreak: 0,
  lastPracticeDay: null,
  tableStats: defaultTableStats(),
});

function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mergeTableStats(raw: unknown): Record<string, TableProgress> {
  const base = defaultTableStats();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, Partial<TableProgress>>;
  for (let n = 1; n <= 12; n += 1) {
    const k = String(n);
    const t = o[k];
    if (!t || typeof t !== "object") continue;
    base[k] = {
      answered: typeof t.answered === "number" ? t.answered : 0,
      correct: typeof t.correct === "number" ? t.correct : 0,
      practiceSessions:
        typeof t.practiceSessions === "number" ? t.practiceSessions : 0,
    };
  }
  return base;
}

/** After a practice session starts: bump per-table session counts and day streak. */
export function applyPracticeSessionStart(
  prev: ProgressState,
  factors: number[],
): ProgressState {
  const now = new Date();
  const iso = now.toISOString();
  const todayStr = localDateString(now);

  const tableStats = { ...prev.tableStats };
  for (const f of factors) {
    if (f < 1 || f > 12) continue;
    const k = String(f);
    const t = tableStats[k] ?? emptyTable();
    tableStats[k] = { ...t, practiceSessions: t.practiceSessions + 1 };
  }

  const last = prev.lastPracticeDay;
  let practiceDayStreak = prev.practiceDayStreak;
  let lastPracticeDay = last;

  if (last === todayStr) {
    /* multiple sessions same day — keep streak as-is */
  } else if (last === null) {
    practiceDayStreak = 1;
    lastPracticeDay = todayStr;
  } else {
    const lastDate = new Date(last + "T12:00:00");
    const todayDate = new Date(todayStr + "T12:00:00");
    const diffDays = Math.round(
      (todayDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000),
    );
    if (diffDays === 1) {
      practiceDayStreak = prev.practiceDayStreak + 1;
    } else {
      practiceDayStreak = 1;
    }
    lastPracticeDay = todayStr;
  }

  return {
    ...prev,
    practiceSessions: prev.practiceSessions + 1,
    lastPlayed: iso,
    lastPracticeAt: iso,
    practiceDayStreak,
    lastPracticeDay,
    tableStats,
  };
}

export type AnswerContext = "practice" | "quiz";

export function recordAnswer(
  prev: ProgressState,
  correct: boolean,
  opts: { factor: number; mode: AnswerContext },
): ProgressState {
  const now = new Date().toISOString();
  const factor = opts.factor;
  const k = String(factor);
  const prevT = prev.tableStats[k] ?? emptyTable();

  const next: ProgressState = {
    ...prev,
    totalAnswered: prev.totalAnswered + 1,
    totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
    lastPlayed: now,
    tableStats: {
      ...prev.tableStats,
      [k]: {
        ...prevT,
        answered: prevT.answered + 1,
        correct: prevT.correct + (correct ? 1 : 0),
      },
    },
  };

  if (opts.mode === "practice") {
    next.lastPracticeAt = now;
  }

  if (correct) {
    next.currentStreak = prev.currentStreak + 1;
    next.bestStreak = Math.max(prev.bestStreak, next.currentStreak);
  } else {
    next.currentStreak = 0;
  }

  return next;
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const merged = { ...defaultState(), ...parsed };
    merged.tableStats = mergeTableStats(parsed.tableStats);
    if (typeof merged.practiceDayStreak !== "number") merged.practiceDayStreak = 0;
    if (merged.lastPracticeDay !== null && typeof merged.lastPracticeDay !== "string") {
      merged.lastPracticeDay = null;
    }
    return merged;
  } catch {
    return defaultState();
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}

export function applyQuizComplete(prev: ProgressState, score: number): ProgressState {
  const now = new Date().toISOString();
  return {
    ...prev,
    quizSessions: prev.quizSessions + 1,
    quizBestScore: Math.max(prev.quizBestScore, score),
    lastPlayed: now,
  };
}

/** Tables with at least one practice session touch or answered question. */
export function countTablesPracticed(tableStats: Record<string, TableProgress>): number {
  let n = 0;
  for (let i = 1; i <= 12; i += 1) {
    const t = tableStats[String(i)];
    if (t && (t.answered > 0 || t.practiceSessions > 0)) n += 1;
  }
  return n;
}
