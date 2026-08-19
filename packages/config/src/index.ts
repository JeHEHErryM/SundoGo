export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  MAPBOX_ACCESS_TOKEN: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
  APP_NAME: 'SundoGo',
} as const;
