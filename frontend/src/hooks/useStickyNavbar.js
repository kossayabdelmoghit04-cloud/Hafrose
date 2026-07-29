import { useState, useEffect } from 'react';

/**
 * Hook d'ingénierie useStickyNavbar — Maison HAFROSE
 * Découple la logique d'état du défilement pour réduire la charge de rendu de la Navbar.
 * @param {number} threshold - Seuil de déclenchement en pixels (par défaut 50px).
 * @returns {{ scrolled: boolean, scrollY: number }}
 */
export function useStickyNavbar(threshold = 50) {
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(currentScrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialisation au montage

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return { scrolled, scrollY };
}

export default useStickyNavbar;
