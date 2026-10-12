import { API_URL } from '@/lib/env';

/**
 * Публичный вход для вебхуков WemoPay: https://<домен>/api/payments/webhook.
 *
 * NestJS наружу не открыт — весь трафик сайта идёт через Next, поэтому вебхук
 * проходит сквозь него. Тело передаём байт в байт: подпись `Signature` — это
 * HMAC сырого тела, и любая пересборка JSON её сломала бы. Код ответа бэкенда
 * отдаём как есть: по нему провайдер решает, повторять ли доставку.
 */
export async function POST(request: Request) {
  const body = await request.arrayBuffer();
  const signature = request.headers.get('signature');
  try {
    const upstream = await fetch(`${API_URL}/payments/webhook`, {
      method: 'POST',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
      headers: {
        'Content-Type': request.headers.get('content-type') ?? 'application/json',
        ...(signature ? { Signature: signature } : {}),
      },
      body,
    });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  } catch {
    // 5xx — провайдер повторит доставку, когда бэкенд поднимется.
    return Response.json({ message: 'Temporarily unavailable' }, { status: 503 });
  }
}
