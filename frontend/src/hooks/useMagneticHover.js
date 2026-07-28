/**
 * HAFROSE v2.1 — useMagneticHover
 * Hook for magnetic button effect — element follows cursor with spring.
 */
import { useRef, useCallback } from 'react';

export default function useMagneticHover(strength = 0.35) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
  }, [strength]);

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0px, 0px)';
    ref.current.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  }, []);

  const onMouseEnter = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
  }, []);

  return { ref, onMouseMove, onMouseLeave, onMouseEnter };
}
