'use server';

import { headers } from 'next/headers';
import { API_URL } from '@/lib/env';

export type LeadFormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string; values: Record<string, string> };

const FIELDS = ['name', 'email', 'phone', 'description', 'timelineWeeks', 'service'] as const;

/**
 * Отправляет заявку на бекенд от имени сервера Next.js. Лимит запросов на
 * бекенде считается по IP, поэтому реальный адрес клиента передаём в
 * X-Forwarded-For — иначе все посетители делили бы один лимит.
 */
export async function submitLead(
  _previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? '').trim()]),
  );

  if (!values.email && !values.phone) {
    return { status: 'error', message: 'Leave an email address or a phone number.', values };
  }

  // Service, с которой пришли, — часть описания: отдельного поля в API нет.
  const description = values.service
    ? `Service: ${values.service}\n\n${values.description}`
    : values.description;

  const body = new FormData();
  body.set('name', values.name);
  if (values.email) body.set('email', values.email);
  if (values.phone) body.set('phone', values.phone);
  body.set('description', description);
  body.set('timelineWeeks', values.timelineWeeks);
  for (const file of formData.getAll('files')) {
    if (file instanceof File && file.size > 0) body.append('files', file, file.name);
  }

  const incoming = await headers();
  const clientIp =
    incoming.get('x-forwarded-for')?.split(',')[0]?.trim() || incoming.get('x-real-ip') || '';

  try {
    const res = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      body,
      headers: clientIp ? { 'x-forwarded-for': clientIp } : undefined,
    });
    if (res.ok) return { status: 'success' };

    const payload = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message)
      ? payload.message.join('. ')
      : (payload?.message ?? 'Could not send the request. Please try again.');
    return { status: 'error', message, values };
  } catch {
    return {
      status: 'error',
      message: 'The server is unavailable right now. Please try again in a minute.',
      values,
    };
  }
}
