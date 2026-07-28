import { memo, useEffect, useRef } from 'react';

/**
 * ScrollProgressBar — HAFROSE Design System Phase 2
 * Barre de progression du défilement de page.
 * Hauteur 2px, Rose Gold, calcul GPU zéro-reflow via scaleX et requestAnimationFrame.
 */

const ScrollProgressBar = memo(function ScrollProgressBar() {
  const barRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      if (scrollHeight > 0 && barRef.current) {
        const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
        barRef.current.style.transform = `scaleX(${progress})`;
      } else if (barRef.current) {
        barRef.current.style.transform = 'scaleX(0)';
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    // Calcul initial
    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="scroll-progress-container"
    >
      <div
        ref={barRef}
        className="scroll-progress-bar"
      />
    </div>
  );
});

export default ScrollProgressBar;
