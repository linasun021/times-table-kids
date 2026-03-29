/** Human-friendly relative time for an ISO timestamp (local timezone). */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 45) return "just now";
  if (diffSec < 3600) {
    const m = Math.max(1, Math.floor(diffSec / 60));
    return `${m} min ago`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    return `${h} hr ago`;
  }
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSameDay(d, yesterday)) return "yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
