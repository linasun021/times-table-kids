import type { MultiplicationQuestion } from "../types";

export function randomQuestion(factors: number[]): MultiplicationQuestion {
  const pick = factors[Math.floor(Math.random() * factors.length)]!;
  const other = 1 + Math.floor(Math.random() * 12);
  const swap = Math.random() < 0.5;
  return swap
    ? { a: pick, b: other, factor: pick }
    : { a: other, b: pick, factor: pick };
}

export function answer(q: MultiplicationQuestion): number {
  return q.a * q.b;
}

/** Build a quiz of `count` unique-ish questions using selected factors */
export function buildQuizDeck(factors: number[], count: number): MultiplicationQuestion[] {
  const deck: MultiplicationQuestion[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (deck.length < count && guard < count * 50) {
    guard += 1;
    const q = randomQuestion(factors);
    const key = `${q.a}x${q.b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deck.push(q);
  }
  while (deck.length < count) {
    deck.push(randomQuestion(factors));
  }
  return deck;
}
