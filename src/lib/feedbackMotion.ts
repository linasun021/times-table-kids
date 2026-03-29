import type { TargetAndTransition, Transition } from "framer-motion";

/** Bouncy celebrate motion for correct answers. */
export const correctCardMotion: {
  animate: TargetAndTransition;
  transition: Transition;
} = {
  animate: {
    scale: [1, 1.12, 0.94, 1.08, 1],
    y: [0, -16, 6, -8, 0],
    rotate: [0, -3, 3, -2, 0],
  },
  transition: {
    duration: 0.55,
    times: [0, 0.2, 0.45, 0.72, 1],
    ease: [0.22, 1.4, 0.36, 1],
  },
};

/** Side-to-side shake for wrong answers. */
export const wrongCardMotion: {
  animate: TargetAndTransition;
  transition: Transition;
} = {
  animate: {
    x: [0, -14, 14, -12, 12, -8, 8, -4, 4, 0],
    rotate: [0, -5, 5, -4, 4, -3, 3, -2, 2, 0],
  },
  transition: { duration: 0.48, ease: "easeInOut" },
};
