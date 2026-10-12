import { NextResponse, type NextRequest } from 'next/server';
import { API_URL } from '@/lib/env';

/**
 * Проверки, которым нужен честный код ответа. Страницы стримятся: как только
 * ушёл первый байт, статус 200 уже не поменять, и `notFound()` внутри
 * `<Suspense>` даёт «мягкий» 404 — страницу ошибки с кодом 200. Proxy
 * отрабатывает до рендера, поэтому решает здесь.
 *
 * - `/services/<slug>` и `/checkout/<slug>` несуществующей услуги — 404.
 * - `/admin` — только администратору; остальным 404, чтобы не выдавать, что
 *   страница есть. Роль сверяет бэкенд по базе (`/auth/me`), а не по токену.
 *   Данные админки и так закрыты бэкендом — это закрывает саму страницу.
 * - Служебные страницы получают `X-Robots-Tag: noindex`.
 */

const SERVICE_PAGE = /^\/(?:services|checkout)\/([^/]+)\/?$/;
const PRIVATE_PREFIXES = ['/admin', '/account', '/checkout', '/orders'];
const SESSION_COOKIE = 'store_session';
const TIMEOUT_MS = 3000;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (matches(pathname, '/admin') && !(await isAdmin(request))) {
    return notFound(request);
  }

  const service = SERVICE_PAGE.exec(pathname);
  if (service && (await serviceMissing(service[1]))) {
    return notFound(request);
  }

  const response = NextResponse.next();
  if (PRIVATE_PREFIXES.some((prefix) => matches(pathname, prefix))) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Переписываем на несуществующий адрес: Next отрисует not-found с кодом 404. */
function notFound(request: NextRequest) {
  const response = NextResponse.rewrite(new URL('/_not-found-proxy', request.url));
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return false;
    const user = (await res.json()) as { role?: string };
    return user.role === 'admin';
  } catch {
    // Бэкенд недоступен — админку не открываем: закрыто по умолчанию.
    return false;
  }
}

/**
 * `true` только если бэкенд прямо ответил 404. Если он лежит, страницу
 * пропускаем: пусть она сама покажет «каталог недоступен», а не врёт 404-м
 * про существующую услугу.
 */
async function serviceMissing(rawSlug: string): Promise<boolean> {
  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    return true;
  }
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return true;
  try {
    const res = await fetch(`${API_URL}/services/${slug}`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.status === 404;
  } catch {
    return false;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout/:path*', '/orders/:path*', '/services/:slug'],
};
