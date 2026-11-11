import { useEffect, useRef, useState } from 'react';

/**
 * True only right after `done` turns from false to true while the page is open, so the
 * "אשריך" card is shown once at the moment of finishing and not when coming back later.
 */
export function useJustCompleted(done: boolean): boolean {
  const [show, setShow] = useState(false);
  const prev = useRef(done);
  useEffect(() => {
    if (!prev.current && done) setShow(true);
    if (!done) setShow(false);
    prev.current = done;
  }, [done]);
  return show;
}
