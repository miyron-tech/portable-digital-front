import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * CSP. `'unsafe-inline'` для скриптов — сознательный компромисс: Next и наши
 * страницы ставят инлайн-скрипты (анимация главной, JSON-LD услуги), а nonce
 * сделал бы каждую страницу динамической и отключил статическую оболочку.
 * Всё остальное закрыто до своего домена: внешние скрипты, фреймы, плагины и
 * отправка форм на чужие адреса не пройдут. `'unsafe-eval'` нужен только dev.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // Видео-ролик главной лежит на CloudFront.
  "media-src 'self' https://d8j0ntlcm91z4.cloudfront.net",
  `connect-src 'self'${isDev ? ' ws:' : ''}`,
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Дублирует frame-ancestors для браузеров, не знающих CSP.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Без includeSubDomains: какие поддомены живут на HTTPS, этот сайт не решает.
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }]),
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Минимальный сервер со своими зависимостями в .next/standalone — под Docker.
  output: 'standalone',
  poweredByHeader: false,
  // Заявка уходит через Server Action вместе с вложениями (до 20 МБ суммарно).
  experimental: {
    serverActions: { bodySizeLimit: '21mb' },
  },
  turbopack: {
    // Чужой package-lock.json выше по дереву иначе сбивает корень проекта.
    root: __dirname,
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
