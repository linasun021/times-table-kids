import { AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import type { AppMode } from "./types";
import { useProgress } from "./hooks/useProgress";
import { Home } from "./components/Home";
import { PracticeMode } from "./components/PracticeMode";
import { QuizMode } from "./components/QuizMode";

export default function App() {
  const [mode, setMode] = useState<AppMode>("home");
  const [factors, setFactors] = useState<number[]>([1, 2, 3, 4, 5]);
  const { progress, bumpPracticeSession, bumpQuizSession, registerAnswer } =
    useProgress();

  const goHome = useCallback(() => setMode("home"), []);

  return (
    <div className="app-shell">
      <div className="app-shell__blob app-shell__blob--a" aria-hidden />
      <div className="app-shell__blob app-shell__blob--b" aria-hidden />
      <main className="app-main">
        <AnimatePresence mode="wait">
          {mode === "home" && (
            <Home
              key="home"
              progress={progress}
              onPractice={() => setMode("practice")}
              onQuiz={() => setMode("quiz")}
            />
          )}
          {mode === "practice" && (
            <PracticeMode
              key="practice"
              factors={factors}
              onFactorsChange={setFactors}
              onBack={goHome}
              onAnswer={(ok, factor) => registerAnswer(ok, factor, "practice")}
              onSessionStart={() => bumpPracticeSession(factors)}
            />
          )}
          {mode === "quiz" && (
            <QuizMode
              key="quiz"
              factors={factors}
              onFactorsChange={setFactors}
              onBack={goHome}
              onAnswer={(ok, factor) => registerAnswer(ok, factor, "quiz")}
              onQuizComplete={(score) => bumpQuizSession(score)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
