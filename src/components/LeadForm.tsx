'use client';

import { useActionState, useState } from 'react';
import { DataNotice } from './DataNotice';
import { submitLead, type LeadFormState } from '@/app/(site)/contact/actions';

const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const ACCEPT = '.pdf,.zip,.png,.jpg,.jpeg,.webp,.txt,.csv,.doc,.docx';

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const input =
  'w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-fg placeholder:text-muted/70 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25';

export function LeadForm({ service }: { service?: string }) {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitLead, {
    status: 'idle',
  });
  const [fileError, setFileError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center" role="status">
        <p className="text-lg font-semibold">Thank you — your request is in.</p>
        <p className="mt-2 text-sm text-muted">We will get back to you within one business day.</p>
      </div>
    );
  }

  const values = state.status === 'error' ? state.values : {};

  return (
    <form
      action={action}
      className="grid gap-4"
      onSubmit={(event) => {
        const files = (event.currentTarget.elements.namedItem('files') as HTMLInputElement).files;
        const total = Array.from(files ?? []).reduce((sum, file) => sum + file.size, 0);
        const tooMany = (files?.length ?? 0) > MAX_FILES || total > MAX_TOTAL_BYTES;
        setFileError(tooMany ? `Attach up to ${MAX_FILES} files, 20 MB in total.` : null);
        if (tooMany) event.preventDefault();
      }}
    >
      {service ? <input type="hidden" name="service" value={service} /> : null}

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          required
          minLength={2}
          maxLength={120}
          defaultValue={values.name}
          autoComplete="name"
          className={input}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={values.email}
            autoComplete="email"
            className={input}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Phone</span>
          <input
            name="phone"
            type="tel"
            pattern="[+()\d\s\-]{6,32}"
            defaultValue={values.phone}
            autoComplete="tel"
            className={input}
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">About the project</span>
        <textarea
          name="description"
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          defaultValue={values.description}
          placeholder="What are you building, what exists already, what would success look like?"
          className={input}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Timeline, weeks</span>
          <input
            name="timelineWeeks"
            type="number"
            required
            min={1}
            max={52}
            defaultValue={values.timelineWeeks || '8'}
            className={input}
          />
        </label>
        <label className="grid min-w-0 gap-1.5 text-sm">
          <span className="font-medium">Attachments</span>
          {/* Нативный file input не сжимается под колонку и вылезал за карточку:
              сам input скрыт, а видно поле в стиле остальных. */}
          <input
            name="files"
            type="file"
            multiple
            accept={ACCEPT}
            className="peer sr-only"
            onChange={(event) => {
              setFiles(Array.from(event.currentTarget.files ?? []));
              setFileError(null);
            }}
          />
          <span
            className={`${input} flex min-w-0 cursor-pointer items-center gap-2 peer-focus-visible:border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/25`}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 shrink-0 text-muted">
              <path
                d="m13.5 7.5-5.3 5.3a3.2 3.2 0 0 1-4.5-4.5l5.6-5.6a2.1 2.1 0 0 1 3 3L6.7 11.3a1.1 1.1 0 0 1-1.5-1.5l5-5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={`truncate ${files.length ? 'text-fg' : 'text-muted/70'}`}>
              {files.length === 0
                ? 'Attach files'
                : files.length === 1
                  ? files[0].name
                  : `${files.length} files · ${formatSize(files.reduce((sum, file) => sum + file.size, 0))}`}
            </span>
          </span>
        </label>
      </div>

      {fileError || state.status === 'error' ? (
        <p className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger" role="alert">
          {fileError ?? (state.status === 'error' ? state.message : null)}
        </p>
      ) : null}

      <DataNotice className="text-xs leading-5 text-muted" data="your name, email, phone, project description and any attached files" purpose="answer this request and prepare a proposal">. Please do not include passwords or payment card details.</DataNotice>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Send request'}
        </button>
        <p className="text-xs text-muted">Email or phone is enough — we will reach out.</p>
      </div>
    </form>
  );
}
