export async function storeApi<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api/store/${path}`, {
    method, headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' }, cache: 'no-store',
    ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new StoreError(response.status >= 500 ? 'This service is temporarily unavailable. Please try again later.' : response.status === 401 ? 'Please sign in. Your session may have expired.' : Array.isArray(data.message) ? data.message.join('. ') : data.message || 'We could not complete your request.', response.status, data.code, data.missing);
  return data as T;
}
/** Ошибка API с кодом ответа: оплате нужно отличать «не хватает данных плательщика» от прочих отказов. */
export class StoreError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string, readonly missing?: string[]) { super(message); this.name = 'StoreError'; }
}
export interface StoreBilling { addressLine1: string; city: string; postalCode: string; countryCode: string }
export interface StoreUser { id: string; name: string; email: string; role: string; billingAddress?: StoreBilling | null; createdAt?: string }
export interface StoreOrder { id: string; orderNumber: string; status: string; total: number; subtotal?: number; discountAmount?: number; currency: string; customer: { name: string; email: string; phone?: string | null; company?: string | null }; billing?: { company?: string; taxId?: string; address?: string; country?: string }; items: { title: string; units: number; slug?: string; model?: string; notes?: string | null; pricing?: { total: number } }[]; termsAcceptance?: { version: string; acceptedAt: string } | null; createdAt?: string; updatedAt?: string; note?: string | null; unreadCount?: number; payment?: { status: StorePayment['status']; isPaid: boolean; paidAt?: string | null } | null }
export interface StoreMessage { id: string; authorRole: 'customer' | 'admin'; authorName: string; body: string; createdAt: string; readByAdminAt?: string | null; attachments: { index: number; originalName: string; mimeType: string; size: number }[] }
/** «Terms edition 12 October 2026, accepted 12 Oct 2026, 10:41» — для заказа. */
export function termsLine(order: StoreOrder): string | null {
  const terms = order.termsAcceptance;
  if (!terms) return null;
  return `Terms edition ${terms.version}, accepted ${new Date(terms.acceptedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`;
}
export const orderLabels: Record<string, string> = { awaiting_payment: 'Awaiting payment', paid: 'Paid', in_progress: 'In progress', in_review: 'In review', completed: 'Completed', cancelled: 'Cancelled' };
export interface StorePayment { status: 'created' | 'pending' | 'awaiting_approval' | 'authorized' | 'paid' | 'declined' | 'cancelled' | 'refunded'; isPaid: boolean; amount: number; currency: string; paidAt: string | null; redirectUrl: string | null }
