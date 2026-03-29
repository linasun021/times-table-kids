export type AppMode = "home" | "practice" | "quiz";

export interface TableProgress {
  answered: number;
  correct: number;
  practiceSessions: number;
}

export interface ProgressState {
  totalAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  currentStreak: number;
  practiceSessions: number;
  quizSessions: number;
  quizBestScore: number;
  lastPlayed: string | null;
  /** Last time the learner used Practice mode (session start or answer). */
  lastPracticeAt: string | null;
  /** Consecutive local calendar days with at least one practice session. */
  practiceDayStreak: number;
  /** Local date (YYYY-MM-DD) of last practice session for streak logic. */
  lastPracticeDay: string | null;
  /** Per times table (1–12): answer counts and practice session touches. */
  tableStats: Record<string, TableProgress>;
}

export interface MultiplicationQuestion {
  a: number;
  b: number;
  /** The selected table for this question (from the learner’s factor set). */
  factor: number;
}
