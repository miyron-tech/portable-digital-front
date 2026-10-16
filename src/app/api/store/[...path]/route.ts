import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';
import { API_URL } from '@/lib/env';

// За Caddy `request.url` содержит внутренний адрес Next (http://0.0.0.0:3000), и
// Origin браузера с ним никогда не совпадает. Публичный адрес берём из заголовков,
// которые выставляет прокси, а без прокси (локально) — из самого запроса.
function publicOrigin(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? url.host;
  const proto = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(/:$/, '');
  return `${proto.split(',')[0].trim()}://${host.split(',')[0].trim()}`;
}

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const route = path.join('/');
  const method = request.method;
  const allowed = /^(auth\/(login|register|logout|me|password)|services(\/admin\/all|\/[a-z0-9-]+)?|estimate(\/items(\/[a-f0-9]+)?|\/price|\/refresh)?|orders(\/all|\/[a-zA-Z0-9-]+(\/status|\/messages(\/[a-f0-9]{24}\/files\/\d+)?)?)?|payments(\/(initiate|status\/\d{6}|[a-f0-9]{24}\/(refund|resolve)))?)$/;
  if (!allowed.test(route)) return Response.json({ message: 'Not found' }, { status: 404 });
  if (method !== 'GET' && request.headers.get('origin') !== publicOrigin(request)) {
    return Response.json({ message: 'Invalid origin' }, { status: 403 });
  }
  const jar = await cookies();
  const token = jar.get('store_session')?.value;
  let guestToken = jar.get('store_selection')?.value;
  if (route === 'auth/logout') {
    if (token) {
      try {
        const result = await fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) });
        if (!result.ok && result.status !== 401) return Response.json({ message: 'We could not sign you out. Please try again.' }, { status: 502 });
      } catch {
        return Response.json({ message: 'We could not sign you out. Please try again.' }, { status: 502 });
      }
    }
    jar.delete('store_session');
    return Response.json({ success: true });
  }
  try {
    // Keep guest selections in an HttpOnly cookie. The API remains authoritative
    // for contents and prices; no payer or card data is stored in browser storage.
    const selectionRequest = route === 'estimate' || route.startsWith('estimate/') && route !== 'estimate/price';
    if (token && guestToken && (selectionRequest || route === 'orders' && method === 'POST')) {
      const merged = await fetch(`${API_URL}/estimate/merge`, {
        method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${token}`, 'X-Estimate-Token': guestToken },
      });
      if (!merged.ok) {
        // Keep the cookie so a failed merge can be retried without losing services.
        return Response.json({ message: 'Your saved selection could not be restored yet. Please retry.', code: 'SELECTION_SYNC_FAILED' }, { status: merged.status === 401 ? 401 : 409 });
      }
      jar.delete('store_selection');
      guestToken = undefined;
    }
    const contentType = request.headers.get('content-type') ?? 'application/json';
    if (Number(request.headers.get('content-length') ?? 0) > 21 * 1024 * 1024) {
      return Response.json({ message: 'Attachments are too large. Use up to 20 MB in total.' }, { status: 413 });
    }
    const upstream = await fetch(`${API_URL}/${route}${new URL(request.url).search}`, {
      method, cache: 'no-store', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': contentType, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(selectionRequest && guestToken ? { 'X-Estimate-Token': guestToken } : {}) },
      ...(method !== 'GET' ? { body: await request.arrayBuffer() } : {}),
    });
    if (upstream.status >= 500) {
      return Response.json({ message: 'This service is temporarily unavailable. Please try again later.' }, { status: upstream.status, headers: { 'Cache-Control': 'no-store' } });
    }
    if (upstream.ok && /\/messages\/[a-f0-9]{24}\/files\/\d+$/.test(route)) {
      return new Response(upstream.body, { status: upstream.status, headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
        'Content-Disposition': upstream.headers.get('content-disposition') ?? 'attachment',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      } });
    }
    const data = await upstream.json();
    if (upstream.ok && selectionRequest && data.token) {
      jar.set('store_selection', data.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 30 * 24 * 60 * 60 });
      delete data.token;
    }
    if (upstream.ok && route === 'auth/password') jar.delete('store_session');
    if (upstream.ok && (route === 'auth/login' || route === 'auth/register')) {
      jar.set('store_session', data.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: data.expiresIn });
      return Response.json({ user: data.user });
    }
    if (upstream.ok && route.startsWith('services') && method !== 'GET') {
      revalidateTag('catalogue', { expire: 0 });
      revalidatePath('/services', 'layout');
      revalidatePath('/');
    }
    return Response.json(data, { status: upstream.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ message: 'The server is temporarily unavailable. Please try again.' }, { status: 502 });
  }
}
export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
