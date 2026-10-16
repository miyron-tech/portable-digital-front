'use client';
import { useState } from 'react';
import type { Service } from '@/lib/types';
import { useSelection } from './SelectionProvider';

export function AddServiceButton({ service }: { service: Service }) {
  const { add, busy } = useSelection();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const rate = service.pricing[0];
  if (!rate) return null;
  return <div className="selection-add">
    <button type="button" className="store-secondary" disabled={busy} onClick={async () => {
      setError('');
      try {
        await add({ serviceId: service.id, model: rate.model, units: rate.minUnits || 1 });
        setAdded(true);
      } catch (e) { setError((e as Error).message); }
    }}>{added ? 'Add again +' : 'Add to selection +'}</button>
    {added && <span className="store-muted" role="status">Added to selected services</span>}
    {error && <p className="store-error" role="alert">{error}</p>}
  </div>;
}
