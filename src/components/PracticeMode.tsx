import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TableSelector } from "./TableSelector";
import { NumberPad } from "./NumberPad";
import { answer, randomQuestion } from "../lib/questions";
import { correctCardMotion, wrongCardMotion } from "../lib/feedbackMotion";
import { playCorrectSound, playWrongSound } from "../lib/feedbackSounds";
import type { MultiplicationQuestion } from "../types";

type Phase = "pick" | "play";

type Props = {
  factors: number[];
  onFactorsChange: (f: number[]) => void;
  onBack: () => void;
  onAnswer: (correct: boolean, factor: number) => void;
  onSessionStart: () => void;
};

export function PracticeMode({
  factors,
  onFactorsChange,
  onBack,
  onAnswer,
  onSessionStart,
}: Props) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [question, setQuestion] = useState<MultiplicationQuestion | null>(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [locked, setLocked] = useState(false);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  const toggle = useCallback(
    (n: number) => {
      if (factors.includes(n)) {
        onFactorsChange(factors.filter((x) => x !== n));
      } else {
        onFactorsChange([...factors, n].sort((a, b) => a - b));
      }
    },
    [factors, onFactorsChange],
  );

  const start = useCallback(() => {
    if (factors.length === 0) return;
    onSessionStart();
    setQuestion(randomQuestion(factors));
    setPhase("play");
    setInput("");
    setFeedback("idle");
    setLocked(false);
  }, [factors, onSessionStart]);

  const goNext = useCallback(() => {
    if (!question || factors.length === 0) return;
    setQuestion(randomQuestion(factors));
    setInput("");
    setFeedback("idle");
    setLocked(false);
  }, [factors, question]);

  const submit = useCallback(() => {
    if (!question || locked) return;
    const expected = answer(question);
    const n = parseInt(input, 10);
    if (Number.isNaN(n)) return;
    setLocked(true);
    const ok = n === expected;
    if (ok) playCorrectSound();
    else playWrongSound();
    setFeedback(ok ? "correct" : "wrong");
    onAnswer(ok, question.factor);
  }, [question, input, locked, onAnswer]);

  useEffect(() => {
    if (feedback === "idle") return;
    const ms = feedback === "correct" ? 900 : 1400;
    const t = window.setTimeout(() => {
      goNext();
    }, ms);
    return () => window.clearTimeout(t);
  }, [feedback, goNext]);

  useEffect(() => {
    if (phase !== "play" || !question || locked) return;
    answerInputRef.current?.focus();
  }, [phase, question?.a, question?.b, locked]);

  return (
    <motion.div
      className="screen practice"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="top-bar">
        <button type="button" className="btn btn--back" onClick={onBack}>
          ← Home
        </button>
        <span className="badge badge--mint">Practice</span>
      </div>

      {phase === "pick" && (
        <div className="panel">
          <TableSelector
            selected={factors}
            onToggle={toggle}
            onSelectAll={() =>
              onFactorsChange([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
            }
            onClear={() => onFactorsChange([])}
          />
          <motion.button
            type="button"
            className="btn btn--xl btn--sun"
            disabled={factors.length === 0}
            onClick={start}
            whileTap={{ scale: factors.length === 0 ? 1 : 0.98 }}
          >
            Let&apos;s go!
          </motion.button>
        </div>
      )}

      {phase === "play" && question && (
        <div className="panel panel--tight">
          <motion.div
            key={`${question.a}-${question.b}`}
            className="question-card"
            initial={
              reduceMotion ? { opacity: 0 } : { scale: 0.92, opacity: 0, x: 0, y: 0, rotate: 0 }
            }
            animate={
              reduceMotion
                ? feedback === "idle"
                  ? { opacity: 1 }
                  : feedback === "correct"
                    ? { opacity: [0.92, 1] }
                    : { opacity: 1, x: [0, -3, 3, 0] }
                : feedback === "correct"
                  ? correctCardMotion.animate
                  : feedback === "wrong"
                    ? wrongCardMotion.animate
                    : { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }
            }
            transition={
              reduceMotion
                ? { duration: 0.25 }
                : feedback === "correct"
                  ? correctCardMotion.transition
                  : feedback === "wrong"
                    ? wrongCardMotion.transition
                    : { duration: 0.3, ease: "easeOut" }
            }
          >
              <p className="question-card__prompt">What is</p>
              <p className="question-card__sum">
                {question.a} × {question.b} = ?
              </p>
              <input
                ref={answerInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                maxLength={4}
                aria-label="Your answer"
                placeholder="·"
                className={`answer-display answer-display__input ${feedback === "correct" ? "answer-display--ok" : ""} ${feedback === "wrong" ? "answer-display--bad" : ""}`}
                value={input}
                disabled={locked}
                onChange={(e) => {
                  if (locked) return;
                  const next = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setInput(next);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submit();
                  }
                }}
              />
              <AnimatePresence>
                {feedback === "correct" && (
                  <motion.p
                    className="feedback feedback--yes"
                    initial={{ opacity: 0, y: 8 }}
                    animate={
                      reduceMotion
                        ? { opacity: 1, y: 0 }
                        : { opacity: 1, y: 0, scale: [1, 1.15, 1] }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0.2 }
                        : { delay: 0.08, duration: 0.4, ease: [0.34, 1.4, 0.64, 1] }
                    }
                    exit={{ opacity: 0 }}
                  >
                    Yay! 🎉
                  </motion.p>
                )}
                {feedback === "wrong" && (
                  <motion.p
                    className="feedback feedback--no"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Answer: {answer(question)}
                  </motion.p>
                )}
              </AnimatePresence>
          </motion.div>

          <NumberPad
            value={input}
            onChange={setInput}
            onSubmit={submit}
            disabled={locked}
          />
        </div>
      )}
    </motion.div>
  );
}
