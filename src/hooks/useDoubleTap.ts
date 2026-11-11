import { useRef } from 'react';

/**
 * Double tap / double click on a card marks it as read, like swiping it to the right.
 * Uses the tap event of the draggable card (fires on mouse and touch, not after a drag).
 */
export function useDoubleTap(onDoubleTap: () => void, delayMs = 350): () => void {
  const last = useRef(0);
  return () => {
    const now = Date.now();
    if (now - last.current < delayMs) {
      last.current = 0;
      onDoubleTap();
    } else {
      last.current = now;
    }
  };
}
