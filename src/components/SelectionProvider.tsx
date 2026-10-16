'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { storeApi, type StoreOrder } from '@/lib/store-client';
import type { Selection, ServiceSelection } from '@/lib/selection';

interface SelectionContextValue {
  selection: Selection | null;
  loading: boolean;
  busy: boolean;
  error: string;
  refresh: () => Promise<Selection>;
  add: (item: ServiceSelection) => Promise<Selection>;
  update: (id: string, units: number) => Promise<Selection>;
  remove: (id: string) => Promise<Selection>;
  refreshPrices: () => Promise<Selection>;
  createOrder: (details: unknown) => Promise<StoreOrder>;
}

const Context = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState('');
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const channel = useRef<BroadcastChannel | null>(null);

  // Serialize the first guest add and auth merge, including other browser tabs.
  const exclusive = useCallback(<T,>(work: () => Promise<T>): Promise<T> => {
    const run = async (): Promise<T> => {
      if (navigator.locks) return await navigator.locks.request('portable-selection', work);
      return await work();
    };
    const next = queue.current.then(run, run);
    queue.current = next.catch(() => undefined);
    return next;
  }, []);

  const request = useCallback(async (path = 'estimate', method = 'GET', body?: unknown) => {
    setPending(value => value + 1);
    try {
      return await exclusive(async () => {
        const result = await storeApi<Selection>(path, method, body);
        setSelection(result);
        setError('');
        if (method !== 'GET') channel.current?.postMessage('changed');
        return result;
      });
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setLoading(false);
      setPending(value => value - 1);
    }
  }, [exclusive]);

  const refresh = useCallback(() => request(), [request]);
  useEffect(() => {
    const reload = () => { void refresh().catch(() => undefined); };
    const authChanged = () => { setSelection(null); reload(); channel.current?.postMessage('changed'); };
    if ('BroadcastChannel' in window) {
      channel.current = new BroadcastChannel('portable-selection');
      channel.current.onmessage = reload;
    }
    reload();
    window.addEventListener('focus', reload);
    window.addEventListener('portable-auth-changed', authChanged);
    return () => {
      window.removeEventListener('focus', reload);
      window.removeEventListener('portable-auth-changed', authChanged);
      channel.current?.close();
      channel.current = null;
    };
  }, [refresh]);

  const createOrder = useCallback(async (details: unknown) => {
    setPending(value => value + 1);
    try {
      return await exclusive(async () => {
        const order = await storeApi<StoreOrder>('orders', 'POST', details);
        // The server converts the estimate into this order. Clear only after success.
        setSelection(null);
        setError('');
        channel.current?.postMessage('changed');
        return order;
      });
    } finally { setPending(value => value - 1); }
  }, [exclusive]);

  return <Context.Provider value={{ selection, loading, busy: pending > 0, error, refresh, createOrder,
    add: item => request('estimate/items', 'POST', item),
    update: (id, units) => request(`estimate/items/${id}`, 'PATCH', { units }),
    remove: id => request(`estimate/items/${id}`, 'DELETE'),
    refreshPrices: () => request('estimate/refresh', 'POST'),
  }}>{children}</Context.Provider>;
}

export function useSelection() {
  const value = useContext(Context);
  if (!value) throw new Error('SelectionProvider is missing');
  return value;
}
