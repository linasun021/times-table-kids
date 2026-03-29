import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TableSelector } from "./TableSelector";
import { NumberPad } from "./NumberPad";
import { answer, buildQuizDeck } from "../lib/questions";
import { correctCardMotion, wrongCardMotion } from "../lib/feedbackMotion";
import { playCorrectSound, playWrongSound } from "../lib/feedbackSounds";
import type { MultiplicationQuestion } from "../types";

const QUIZ_LEN = 10;

type Phase = "pick" | "play" | "done";

type Props = {
  factors: number[];
  onFactorsChange: (f: number[]) => void;
  onBack: () => void;
  onAnswer: (correct: boolean, factor: number) => void;
  onQuizComplete: (score: number) => void;
};

export function QuizMode({
  factors,
  onFactorsChange,
  onBack,
  onAnswer,
  onQuizComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [deck, setDeck] = useState<MultiplicationQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const reduceMotion = useReducedMotion();

  const question = deck[index] ?? null;

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
    const d = buildQuizDeck(factors, QUIZ_LEN);
    setDeck(d);
    setIndex(0);
    setInput("");
    setScore(0);
    setLocked(false);
    setLastOk(null);
    setPhase("play");
  }, [factors]);

  const finish = useCallback(
    (finalScore: number) => {
      setScore(finalScore);
      setPhase("done");
      onQuizComplete(finalScore);
    },
    [onQuizComplete],
  );

  const submit = useCallback(() => {
    if (!question || locked) return;
    const expected = answer(question);
    const n = parseInt(input, 10);
    if (Number.isNaN(n)) return;
    setLocked(true);
    const ok = n === expected;
    if (ok) playCorrectSound();
    else playWrongSound();
    setLastOk(ok);
    onAnswer(ok, question.factor);
    const nextScore = ok ? score + 1 : score;

    window.setTimeout(() => {
      const next = index + 1;
      if (next >= deck.length) {
        finish(nextScore);
        return;
      }
      if (ok) setScore(nextScore);
      setIndex(next);
      setInput("");
      setLocked(false);
      setLastOk(null);
    }, 700);
  }, [question, locked, input, onAnswer, score, index, deck.length, finish]);

  const dots = useMemo(
    () => Array.from({ length: QUIZ_LEN }, (_, i) => i),
    [],
  );

  return (
    <motion.div
      className="screen quiz"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="top-bar">
        <button type="button" className="btn btn--back" onClick={onBack}>
          ← Home
        </button>
        <span className="badge badge--lavender">Quiz</span>
      </div>

      {phase === "pick" && (
        <div className="panel">
          <p className="quiz__intro">10 quick questions — how many can you get?</p>
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
            className="btn btn--xl btn--coral"
            disabled={factors.length === 0}
            onClick={start}
            whileTap={{ scale: factors.length === 0 ? 1 : 0.98 }}
          >
            Start quiz
          </motion.button>
        </div>
      )}

      {phase === "play" && question && (
        <div className="panel panel--tight">
          <div className="quiz-progress" aria-hidden>
            {dots.map((i) => (
              <span
                key={i}
                className={`quiz-progress__dot ${i < index ? "quiz-progress__dot--done" : ""} ${i === index ? "quiz-progress__dot--current" : ""}`}
              />
            ))}
          </div>
          <p className="quiz__counter">
            Question {index + 1} of {QUIZ_LEN}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${index}-${question.a}-${question.b}`}
              className="question-card"
              initial={{ opacity: 0, y: 10 }}
              animate={
                reduceMotion
                  ? lastOk === true
                    ? { opacity: [0.92, 1], y: 0 }
                    : lastOk === false
                      ? { opacity: 1, x: [0, -4, 4, 0] }
                      : { opacity: 1, y: 0 }
                  : lastOk === true
                    ? correctCardMotion.animate
                    : lastOk === false
                      ? wrongCardMotion.animate
                      : { opacity: 1, y: 0, scale: 1, x: 0, rotate: 0 }
              }
              transition={
                reduceMotion
                  ? { duration: 0.22 }
                  : lastOk === true
                    ? correctCardMotion.transition
                    : lastOk === false
                      ? wrongCardMotion.transition
                      : { duration: 0.28, ease: "easeOut" }
              }
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="question-card__sum">
                {question.a} × {question.b} = ?
              </p>
              <div
                className={`answer-display ${lastOk === true ? "answer-display--ok" : ""} ${lastOk === false ? "answer-display--bad" : ""}`}
              >
                {input || "·"}
              </div>
            </motion.div>
          </AnimatePresence>

          <NumberPad
            value={input}
            onChange={setInput}
            onSubmit={submit}
            disabled={locked}
          />
        </div>
      )}

      {phase === "done" && (
        <motion.div
          className="panel panel--center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <motion.div
            className="trophy"
            animate={{ rotate: [0, -6, 6, 0], y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.2 }}
            aria-hidden
          >
            🏆
          </motion.div>
          <h2 className="quiz-done__title">Quiz complete!</h2>
          <p className="quiz-done__score">
            You got <strong>{score}</strong> out of {QUIZ_LEN}
          </p>
          <p className="quiz-done__msg">
            {score === QUIZ_LEN
              ? "Perfect! You're a multiplication superstar!"
              : score >= 7
                ? "Awesome work — keep practicing!"
                : "Nice try — practice mode can help you level up!"}
          </p>
          <button type="button" className="btn btn--xl btn--sun" onClick={onBack}>
            Back to home
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
