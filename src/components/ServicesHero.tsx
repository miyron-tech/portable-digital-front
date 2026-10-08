'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Container } from './Container';

const scenes = [
  { video: '/videos/services-engineering.mp4', image: '/videos/services-engineering.jpg', name: 'Engineering what comes next', label: '01 / ENGINEERING' },
  { video: '/videos/services-development.mp4', image: '/videos/services-development.jpg', name: 'Software, built around you', label: '02 / DEVELOPMENT' },
  { video: '/videos/services-infrastructure.mp4', image: '/videos/services-infrastructure.jpg', name: 'Infrastructure that keeps moving', label: '03 / INFRASTRUCTURE' },
];
export function ServicesHero() {
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches || paused) return;
    const timer = setInterval(() => setScene(s => (s + 1) % scenes.length), 12000);
    return () => clearInterval(timer);
  }, [paused]);
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    videos.current.forEach((video, index) => {
      if (!video) return;
      video.muted = true;
      if (index === scene && !paused && !reduce.matches) video.play().catch(() => undefined);
      else video.pause();
    });
  }, [scene, paused]);
  return <section className={`services-cinema${paused ? ' is-paused' : ''}`} aria-label="Digital services">
    <div className="services-scene-stack" aria-hidden="true">
      {scenes.map((s, i) => <video key={s.video} ref={element => { videos.current[i] = element; }} className={`services-scene${scene === i ? ' is-active' : ''}`} src={s.video} poster={s.image} muted loop playsInline preload={i === 0 ? 'auto' : 'metadata'} />)}
      <div className="services-scanlines" />
    </div>
    <Container className="services-hero-inner">
      <div className="services-hero-top"><span className="store-eyebrow">PORTABLE DIGITAL / SERVICES</span><span className="services-availability"><i /> BUILT TO MOVE YOU FORWARD</span></div>
      <div className="services-hero-copy"><h1><span>Big ideas.</span><span>Built to work.</span></h1><p>From the first line of code to your next big launch.<br />Engineering, design and digital expertise.<br />One team. No loose ends.</p><a href="#catalogue" className="services-hero-button">Explore services <span>↗</span></a></div>
      <div className="services-hero-bottom"><div className="services-reel-control"><div className="services-scene-dots">{scenes.map((s, i) => <button key={s.label} onClick={() => setScene(i)} aria-label={s.name} aria-pressed={scene === i}><span /></button>)}</div><span>{scenes[scene].label}</span><button onClick={() => setPaused(!paused)} className="services-pause" aria-label={paused ? 'Play animation' : 'Pause animation'}>{paused ? '▶' : 'Ⅱ'}</button></div><Link href="/contact" className="services-hero-contact">Something more ambitious?<span>Let’s talk ↗</span></Link></div>
    </Container>
  </section>;
}
