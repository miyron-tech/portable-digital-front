'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Brand } from '@/components/Brand';

/**
 * Фоновые ролики по кругу: сначала оригинальный, затем роботы. Каждый крутится
 * `SLOT_MS`, после чего следующий въезжает шторкой. LED-эффект у роботов запечён
 * в файлы (scripts/led-video.sh), исходники — Mixkit, бесплатная лицензия.
 */
const REEL = [
  {
    src: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4',
    poster: '/videos/vantage.jpg',
  },
  { src: '/videos/rocket-launch.mp4', poster: '/videos/rocket-launch.jpg' },
  { src: '/videos/robot-portrait.mp4', poster: '/videos/robot-portrait.jpg' },
  { src: '/videos/robot-arm.mp4', poster: '/videos/robot-arm.jpg' },
];

const SLOT_MS = 25_000;
/** Держать в паре с `transition` у `.background.is-active` в CSS. */
const SWIPE_MS = 1200;

const NAV = [
  { href: '/', label: 'Home', current: true },
  { href: '/#about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

declare global {
  interface Window {
    __vantageMotionTimer?: ReturnType<typeof setTimeout>;
  }
}

function endMotion() {
  document.documentElement.classList.remove('motion-pending');
  clearTimeout(window.__vantageMotionTimer);
}

export function Vantage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCollapsible, setMenuCollapsible] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Свёрнутое меню — только когда виден гамбургер (планшет и телефон).
  useEffect(() => {
    const toggle = toggleRef.current;
    if (!toggle) return;
    const update = () => {
      const collapsible = getComputedStyle(toggle).display !== 'none';
      setMenuCollapsible(collapsible);
      if (!collapsible) setMenuOpen(false);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    actionsRef.current?.querySelector<HTMLElement>('.nav a')?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu(true);
    };
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeMenu();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [menuOpen, closeMenu]);

  const goToContact = () => {
    closeMenu();
    router.push('/services');
  };

  return (
    <main className="viewport">
      <section className="screen" id="screen">
        <BackgroundReel />

        <header ref={headerRef} className={`header${menuOpen ? ' menu-open' : ''}`}>
          <Link className="brand" href="/" aria-label="Portable digital — home">
            <Brand />
          </Link>

          <div
            ref={actionsRef}
            className="header-actions"
            id="tablet-navigation"
            inert={menuCollapsible && !menuOpen}
          >
            <nav className="nav" aria-label="Primary">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={item.current ? 'page' : undefined}
                  onClick={() => closeMenu()}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="time-panel">
              <span className="time-label">Timezone</span>
              <span className="time-value">9:47 PM&nbsp; • &nbsp;14 July 2026</span>
            </div>
            <button type="button" className="sign-up" onClick={() => router.push('/account')}>
              Account
            </button>
          </div>

          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="tablet-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path className="bar-top" d="M4 9h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path className="bar-bottom" d="M4 15h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="line line-one">
                <span className="line-reveal">Hard Problems.</span>
              </span>
              <span className="line line-two">
                <span className="line-reveal">Quiet Delivery.</span>
              </span>
            </h1>
            <p className="hero-copy">
              {/* Пробел перед <br>: на телефоне переносы скрыты, и слова иначе слиплись бы. */}
              Legacy systems, tangled integrations, tight deadlines.{' '}
              <br />
              We take on the parts others avoid and ship them{' '}
              <br />
              without the noise, the drama or the surprises.
            </p>
            <button
              type="button"
              className="primary-cta"
              onClick={goToContact}
              // Кнопка появляется последней — по концу её анимации вступление окончено.
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) endMotion();
              }}
            >
              <span className="label">Get Started</span>
              <span className="arrow-box" aria-hidden="true">
                <svg viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7h9M7.75 3.25 11.5 7l-3.75 3.75"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

/**
 * Два слоя `<video>`: пока играет один, второй уже загружает следующий ролик.
 * Раз в `SLOT_MS` второй слой запускается с начала и шторкой перекрывает
 * первый; освободившийся слой затем берёт ролик через один.
 */
function BackgroundReel() {
  const first = useRef<HTMLVideoElement>(null);
  const second = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [swiped, setSwiped] = useState(false);

  useEffect(() => {
    if (!first.current || !second.current) return;
    const videos = [first.current, second.current];
    const [initial] = videos;

    // React не выводит `muted` в серверный HTML, а без него браузер блокирует
    // автозапуск. Выставляем свойство и запускаем первый ролик сами.
    for (const video of videos) video.muted = true;
    initial.play().catch(() => undefined);
    if (REEL.length < 2) return;

    const reel = { active: 0, clips: [0, 1] };
    let cleanupTimer: ReturnType<typeof setTimeout> | undefined;

    const swipe = () => {
      const previous = videos[reel.active];
      const nextLayer = 1 - reel.active;
      const next = videos[nextLayer];
      next.currentTime = 0;
      next.play().catch(() => undefined);
      reel.active = nextLayer;
      setActive(nextLayer);
      setSwiped(true);

      cleanupTimer = setTimeout(() => {
        previous.pause();
        const upcoming = (reel.clips[nextLayer] + 1) % REEL.length;
        reel.clips[1 - nextLayer] = upcoming;
        previous.poster = REEL[upcoming].poster;
        previous.src = REEL[upcoming].src;
        previous.load();
      }, SWIPE_MS);
    };

    const interval = setInterval(swipe, SLOT_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(cleanupTimer);
    };
  }, []);

  // Слой под активным — уходящий ролик: виден, пока новый въезжает поверх.
  // Шторка только при смене: первый ролик при загрузке появляется сразу.
  const layer = (index: number) => ({
    className: `background ${active === index ? `is-active${swiped ? ' is-swiping' : ''}` : 'is-previous'}`,
    src: REEL[index % REEL.length].src,
    poster: REEL[index % REEL.length].poster,
    preload: 'auto',
    loop: true,
    muted: true,
    playsInline: true,
    disablePictureInPicture: true,
    'aria-hidden': true,
  });

  return (
    <>
      <video ref={first} {...layer(0)} />
      <video ref={second} {...layer(1)} />
    </>
  );
}
