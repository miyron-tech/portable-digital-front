export function Unavailable({ what = 'The service catalogue' }: { what?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
      {what} is temporarily unavailable. Please refresh the page in a minute.
    </div>
  );
}
