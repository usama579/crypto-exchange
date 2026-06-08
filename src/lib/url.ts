// Resolves the public base URL used in user-facing links (verification emails,
// password resets, etc.).
//
// Why this exists: on the Hostinger deployment the platform injects its own
// NEXTAUTH_URL pointing at the temporary "*.hostingersite.com" preview host,
// which overrides our committed .env.production. We never want that preview
// host in emails, so we explicitly reject it and fall back to the real domain.
const PRODUCTION_FALLBACK = 'https://coindexy.com';
const DEV_FALLBACK = 'http://localhost:3000';

export function getAppBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || '').trim();

  // Use the configured URL only if it isn't the throwaway Hostinger preview host.
  if (raw && !raw.includes('hostingersite.com')) {
    return raw.replace(/\/+$/, '');
  }

  return process.env.NODE_ENV === 'production' ? PRODUCTION_FALLBACK : DEV_FALLBACK;
}
