export const SWIPE_THRESHOLD = 95;
export const swipeChoice = (dx: number): 'like' | 'pass' | null => Math.abs(dx) < SWIPE_THRESHOLD ? null : dx > 0 ? 'like' : 'pass';
export const exitDuration = (reduced: boolean) => reduced ? 0 : 220;
