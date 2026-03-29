import { motion } from "framer-motion";

type Props = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];

export function NumberPad({ value, onChange, onSubmit, disabled }: Props) {
  const handleKey = (key: string) => {
    if (disabled) return;
    if (key === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "✓") {
      onSubmit();
      return;
    }
    if (value.length >= 4) return;
    onChange(value + key);
  };

  return (
    <div className="number-pad" aria-label="Number pad">
      {KEYS.map((key) => (
        <motion.button
          key={key}
          type="button"
          className={`number-pad__key ${key === "✓" ? "number-pad__key--enter" : ""}`}
          onClick={() => handleKey(key)}
          disabled={disabled}
          whileTap={{ scale: disabled ? 1 : 0.94 }}
        >
          {key}
        </motion.button>
      ))}
    </div>
  );
}
