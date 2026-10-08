import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
