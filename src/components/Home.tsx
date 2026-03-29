import { motion } from "framer-motion";
import type { ProgressState } from "../types";
import { countTablesPracticed } from "../lib/progress";
import { formatRelativeTime } from "../lib/time";

type Props = {
  progress: ProgressState;
  onPractice: () => void;
  onQuiz: () => void;
};

export function Home({ progress, onPractice, onQuiz }: Props) {
  const pct =
    progress.totalAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
      : 0;

  const tablesDone = countTablesPracticed(progress.tableStats);
  const lastPracticeLabel = progress.lastPracticeAt
    ? formatRelativeTime(progress.lastPracticeAt)
    : null;

  return (
    <motion.div
      className="screen home"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
    >
      <header className="home__header">
        <motion.h1
          className="home__title"
          animate={{ rotate: [0, -2, 2, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          Times Table Fun
        </motion.h1>
        <p className="home__subtitle">Tap the big buttons to play!</p>
      </header>

      <div className="home__actions">
        <motion.button
          type="button"
          className="btn btn--xl btn--practice"
          onClick={onPractice}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Practice
        </motion.button>
        <motion.button
          type="button"
          className="btn btn--xl btn--quiz"
          onClick={onQuiz}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Quiz
        </motion.button>
      </div>

      <section className="stats-card" aria-label="Your progress">
        <h2 className="stats-card__title">Your stars</h2>
        <div className="stats-card__grid stats-card__grid--six">
          <div className="stat">
            <span className="stat__emoji" aria-hidden>
              ⭐
            </span>
            <span className="stat__value">{progress.totalCorrect}</span>
            <span className="stat__label">correct</span>
          </div>
          <div className="stat">
            <span className="stat__emoji" aria-hidden>
              🎯
            </span>
            <span className="stat__value">{pct}%</span>
            <span className="stat__label">accuracy</span>
          </div>
          <div className="stat">
            <span className="stat__emoji" aria-hidden>
              📚
            </span>
            <span className="stat__value">
              {tablesDone}/12
            </span>
            <span className="stat__label">tables</span>
          </div>
          <div className="stat">
            <span className="stat__emoji" aria-hidden>
              🔥
            </span>
            <span className="stat__value">{progress.currentStreak}</span>
            <span className="stat__label">in a row</span>
          </div>
          <div className="stat">
            <span className="stat__emoji" aria-hidden>
              🏆
            </span>
            <span className="stat__value">{progress.bestStreak}</span>
            <span className="stat__label">best streak</span>
          </div>
          <div className="stat">
            <span className="stat__emoji" aria-hidden>
              📅
            </span>
            <span className="stat__value">{progress.practiceDayStreak}</span>
            <span className="stat__label">day streak</span>
          </div>
        </div>
        <p className="stats-card__meta">
          {lastPracticeLabel ? (
            <>
              Last practice: <strong>{lastPracticeLabel}</strong>
            </>
          ) : (
            <>Start practice to begin your streak!</>
          )}
        </p>
        <p className="stats-card__hint">
          Practice: {progress.practiceSessions} · Quiz runs: {progress.quizSessions}
          {progress.quizBestScore > 0 ? ` · Best quiz: ${progress.quizBestScore}/10` : ""}
        </p>
      </section>
    </motion.div>
  );
}
