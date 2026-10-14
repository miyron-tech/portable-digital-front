'use client';
import { useEffect, useRef } from 'react';

export function useUnsavedChanges(dirty: boolean, busy = false) {
  const current = useRef({ dirty, busy });
  useEffect(() => { current.current = { dirty, busy }; }, [dirty, busy]);
  const allowLeave = () => !current.current.busy && (!current.current.dirty || window.confirm('Discard unsaved changes?'));
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (current.current.dirty || current.current.busy) { event.preventDefault(); event.returnValue = ''; }
    };
    const click = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.('a');
      if (!link || link.target === '_blank' || link.hasAttribute('download') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (link.href !== window.location.href && !allowLeave()) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', click, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', click, true); };
  }, []);
  return allowLeave;
}
