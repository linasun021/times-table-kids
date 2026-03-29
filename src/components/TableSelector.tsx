import { motion, useReducedMotion } from "framer-motion";

const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/** Distinct kid-friendly gradients — one per times table */
const TABLE_STYLE: Record<
  number,
  { gradient: string; activeGradient: string; ink: string }
> = {
  1: {
    gradient: "linear-gradient(145deg, #ff8a8a 0%, #ff5252 100%)",
    activeGradient: "linear-gradient(145deg, #ffb3b3 0%, #ff6b6b 100%)",
    ink: "#fff",
  },
  2: {
    gradient: "linear-gradient(145deg, #5eead4 0%, #14b8a6 100%)",
    activeGradient: "linear-gradient(145deg, #7ff5e1 0%, #2dd4bf 100%)",
    ink: "#0f172a",
  },
  3: {
    gradient: "linear-gradient(145deg, #fde047 0%, #eab308 100%)",
    activeGradient: "linear-gradient(145deg, #fef08a 0%, #facc15 100%)",
    ink: "#422006",
  },
  4: {
    gradient: "linear-gradient(145deg, #86efac 0%, #22c55e 100%)",
    activeGradient: "linear-gradient(145deg, #bbf7d0 0%, #4ade80 100%)",
    ink: "#14532d",
  },
  5: {
    gradient: "linear-gradient(145deg, #f9a8d4 0%, #ec4899 100%)",
    activeGradient: "linear-gradient(145deg, #fbcfe8 0%, #f472b6 100%)",
    ink: "#fff",
  },
  6: {
    gradient: "linear-gradient(145deg, #c4b5fd 0%, #7c3aed 100%)",
    activeGradient: "linear-gradient(145deg, #ddd6fe 0%, #8b5cf6 100%)",
    ink: "#fff",
  },
  7: {
    gradient: "linear-gradient(145deg, #93c5fd 0%, #2563eb 100%)",
    activeGradient: "linear-gradient(145deg, #bfdbfe 0%, #3b82f6 100%)",
    ink: "#fff",
  },
  8: {
    gradient: "linear-gradient(145deg, #fdba74 0%, #ea580c 100%)",
    activeGradient: "linear-gradient(145deg, #fed7aa 0%, #f97316 100%)",
    ink: "#431407",
  },
  9: {
    gradient: "linear-gradient(145deg, #67e8f9 0%, #0891b2 100%)",
    activeGradient: "linear-gradient(145deg, #a5f3fc 0%, #06b6d4 100%)",
    ink: "#083344",
  },
  10: {
    gradient: "linear-gradient(145deg, #a78bfa 0%, #6366f1 100%)",
    activeGradient: "linear-gradient(145deg, #c4b5fd 0%, #818cf8 100%)",
    ink: "#fff",
  },
  11: {
    gradient: "linear-gradient(145deg, #f472b6 0%, #db2777 100%)",
    activeGradient: "linear-gradient(145deg, #f9a8d4 0%, #ec4899 100%)",
    ink: "#fff",
  },
  12: {
    gradient: "linear-gradient(145deg, #34d399 0%, #059669 100%)",
    activeGradient: "linear-gradient(145deg, #6ee7b7 0%, #10b981 100%)",
    ink: "#022c22",
  },
};

type Props = {
  selected: number[];
  onToggle: (n: number) => void;
  onSelectAll: () => void;
  onClear: () => void;
};

export function TableSelector({ selected, onToggle, onSelectAll, onClear }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="table-selector">
      <p className="table-selector__label">Choose a times table (1–12)</p>
      <p className="table-selector__hint">Tap the big buttons — pick one or many!</p>
      <div className="table-selector__grid" role="group" aria-label="Times tables 1 through 12">
        {TABLES.map((n, i) => {
          const active = selected.includes(n);
          const s = TABLE_STYLE[n];
          return (
            <motion.button
              key={n}
              type="button"
              className={`table-chip ${active ? "table-chip--on" : "table-chip--off"}`}
              style={{
                background: active ? s.activeGradient : s.gradient,
                color: s.ink,
              }}
              onClick={() => onToggle(n)}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 10 }}
              animate={
                reduceMotion
                  ? { opacity: 1, scale: 1, y: 0 }
                  : {
                      opacity: 1,
                      scale: active ? 1.07 : 1,
                      y: active ? -5 : 0,
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      opacity: { delay: i * 0.03, duration: 0.2 },
                      scale: { type: "spring", stiffness: 420, damping: 26 },
                      y: { type: "spring", stiffness: 420, damping: 26 },
                    }
              }
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: active ? -7 : -2 }
              }
              whileTap={{ scale: active ? 0.98 : 0.94 }}
              aria-pressed={active}
              aria-label={`${n} times table${active ? ", selected" : ""}`}
            >
              {active && (
                <span className="table-chip__check" aria-hidden>
                  ✓
                </span>
              )}
              <span className="table-chip__num">{n}</span>
              <span className="table-chip__times" aria-hidden>
                ×
              </span>
            </motion.button>
          );
        })}
      </div>
      <div className="table-selector__row">
        <motion.button
          type="button"
          className="btn btn--ghost btn--table-action"
          onClick={onSelectAll}
          whileTap={{ scale: 0.97 }}
        >
          All tables
        </motion.button>
        <motion.button
          type="button"
          className="btn btn--ghost btn--table-action"
          onClick={onClear}
          whileTap={{ scale: 0.97 }}
        >
          Clear
        </motion.button>
      </div>
    </div>
  );
}
