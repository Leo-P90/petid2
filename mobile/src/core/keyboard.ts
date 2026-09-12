export type Rect = { y: number; height: number };
// Absolute window coordinates avoid stack-header/safe-area offset guesses.
export function imeOverlap(viewport: Rect, keyboardTop: number | null) {
  return keyboardTop === null ? 0 : Math.max(0, viewport.y + viewport.height - keyboardTop);
}
export function focusScroll(offset: number, field: Rect, viewport: Rect, keyboardTop: number, margin = 16) {
  const top = viewport.y + margin;
  const bottom = Math.min(viewport.y + viewport.height, keyboardTop) - margin;
  // A large accessibility text block may exceed the viewport: keep its input end visible.
  const delta = field.y + field.height > bottom ? field.y + field.height - bottom : field.y < top ? field.y - top : 0;
  return Math.max(0, offset + delta);
}
