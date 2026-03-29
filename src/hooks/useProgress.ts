import { useCallback, useEffect, useState } from "react";
import type { ProgressState } from "../types";
import {
  applyPracticeSessionStart,
  applyQuizComplete,
  loadProgress,
  recordAnswer,
  saveProgress,
} from "../lib/progress";
import type { AnswerContext } from "../lib/progress";

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const bumpPracticeSession = useCallback((factors: number[]) => {
    setProgress((p) => applyPracticeSessionStart(p, factors));
  }, []);

  const bumpQuizSession = useCallback((score: number) => {
    setProgress((p) => applyQuizComplete(p, score));
  }, []);

  const registerAnswer = useCallback(
    (correct: boolean, factor: number, mode: AnswerContext) => {
      setProgress((p) => recordAnswer(p, correct, { factor, mode }));
    },
    [],
  );

  return {
    progress,
    bumpPracticeSession,
    bumpQuizSession,
    registerAnswer,
  };
}
