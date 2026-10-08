export async function storeApi<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api/store/${path}`, {
    method, headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(response.status === 401 ? 'Please sign in. Your session may have expired.' : Array.isArray(data.message) ? data.message.join('. ') : data.message || 'We could not complete your request.');
  return data as T;
}
export interface StoreUser { id: string; name: string; email: string; role: string }
export interface StoreOrder { id: string; orderNumber: string; status: string; total: number; currency: string; customer: { name: string; email: string }; items: { title: string; units: number }[] }
export const orderLabels: Record<string, string> = { awaiting_payment: 'Awaiting payment', paid: 'Paid', in_progress: 'In progress', in_review: 'In review', completed: 'Completed', cancelled: 'Cancelled' };
