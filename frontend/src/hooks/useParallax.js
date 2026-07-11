import { useEffect, useState } from 'react';

/**
 * Returns the current window scroll position, throttled to animation frames.
 * Layers multiply this by different speeds to get the parallax depth effect.
 * Falls back to a timer when the tab is hidden/throttled (rAF suspended).
 */
export default function useParallax() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      setScrollY(window.scrollY);
      ticking = false;
    };
    const schedule = () => {
      if (ticking) return;
      ticking = true;
      if (document.visibilityState === 'visible') {
        requestAnimationFrame(update);
      } else {
        setTimeout(update, 32);
      }
    };
    window.addEventListener('scroll', schedule, { passive: true });
    schedule();
    return () => window.removeEventListener('scroll', schedule);
  }, []);

  return scrollY;
}
