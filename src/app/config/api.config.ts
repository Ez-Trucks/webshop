declare global {
  interface Window {
    __EZ_TRUCKS_API_URL__?: string;
  }
}

const configuredApiUrl =
  typeof window !== 'undefined' ? window.__EZ_TRUCKS_API_URL__ : undefined;

export const API_BASE_URL = (configuredApiUrl || 'http://localhost:3000').replace(/\/$/, '');

