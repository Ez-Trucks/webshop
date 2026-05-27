declare global {
  interface Window {
    __EZ_TRUCKS_API_URL__?: string;
  }
}

const configuredApiUrl =
  typeof window !== 'undefined' ? window.__EZ_TRUCKS_API_URL__ : undefined;

const defaultApiUrl =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://webshop-api-m7ko.onrender.com'
    : 'http://localhost:3000';

export const API_BASE_URL = (configuredApiUrl || defaultApiUrl).replace(/\/$/, '');
