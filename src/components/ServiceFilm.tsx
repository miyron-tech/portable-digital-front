'use client';
import { useEffect, useRef, useState } from 'react';

export function ServiceFilm({ scene, title }: { scene: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => {
      if (visible && !paused && !motion.matches && !document.hidden) {
        if (!video.getAttribute('src')) video.src = `/videos/services-${scene}.mp4`;
        video.play().catch(() => undefined);
      } else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: .2 });
    observer.observe(video);
    motion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); video.pause(); motion.removeEventListener('change', update); document.removeEventListener('visibilitychange', update); };
  }, [paused, scene]);
  return <div className="service-film"><video ref={ref} poster={`/videos/services-${scene}.jpg`} muted loop playsInline preload="none" aria-label={`${title} animation`} /><button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} className="service-film-control">{paused ? 'Play film' : 'Pause film'}</button></div>;
}
