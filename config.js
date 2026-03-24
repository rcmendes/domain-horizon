/**
 * Shared configuration module.
 * Single source of truth for runtime flags and settings.
 */

const isDev =
  process.env.ENV_FILE === '.env.dev' || process.env.NODE_ENV === 'development';

const PORT = parseInt(process.env.PORT, 10) || 3001;

/** Origin(s) allowed to call the API. Comma-separated in env. */
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3001'];

module.exports = { isDev, PORT, ALLOWED_ORIGINS };
