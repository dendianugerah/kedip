export const NOTIFICATION_HEADLINES = [
  "Wrap it up!",
  "Almost time.",
  "Break incoming.",
  "Eyes need rest soon.",
  "Finish that thought.",
  "Nearly there.",
  "Time to step back.",
] as const;

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
