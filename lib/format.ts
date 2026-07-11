// Human-friendly relative/absolute date for review timestamps.
// e.g. "Today", "Yesterday", "3 days ago", or "Jul 9, 2026".
export function formatReviewDate(input?: string): string {
  if (!input) return '';
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;

  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / dayMs);

  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days >= 2 && days <= 6) return `${days} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// When a sync last ran, with an actual clock time — e.g. "Today at 3:38 PM",
// "Yesterday at 9:02 AM", or "Jul 9 at 4:15 PM".
export function formatSyncTime(input?: string): string {
  if (!input) return '';
  const d = new Date(input);
  if (isNaN(d.getTime())) return '';

  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / (24 * 60 * 60 * 1000));

  if (days <= 0) return `Today at ${time}`;
  if (days === 1) return `Yesterday at ${time}`;
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${time}`;
}

// Steam reports playtime in minutes. Show "45m" under an hour, else "12h" / "1,204h".
export function formatPlaytime(minutes?: number): string {
  if (!minutes || minutes <= 0) return 'Never played';
  if (minutes < 60) return `${minutes}m`;
  return `${Math.round(minutes / 60).toLocaleString()}h`;
}
