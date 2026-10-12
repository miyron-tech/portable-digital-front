'use client';
import { useEffect, useRef, type ReactNode } from 'react';

export function ServiceReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const cards = Array.from(element.querySelectorAll<HTMLElement>('.practice-card'));
    const revealAll = () => cards.forEach(card => card.classList.remove('reveal-waiting'));
    if (media.matches) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-waiting');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    cards.forEach(card => {
      if (card.getBoundingClientRect().top > window.innerHeight) card.classList.add('reveal-waiting');
      observer.observe(card);
    });
    const onMotionChange = () => { if (media.matches) { revealAll(); observer.disconnect(); } };
    media.addEventListener('change', onMotionChange);
    return () => { observer.disconnect(); revealAll(); media.removeEventListener('change', onMotionChange); };
  }, [children]);
  return <div className="practice-grid" ref={root}>{children}</div>;
}
