import { cacheLife } from 'next/cache';

/** Год в футере кэшируется: `new Date()` без кэша делал бы всю страницу динамической. */
export async function Year() {
  'use cache';
  cacheLife('days');
  return <>{new Date().getFullYear()}</>;
}
