const axios = require('axios');
const { isDev } = require('./config');

const GODADDY_API_URL = process.env.GODADDY_API_URL || 'https://api.ote-godaddy.com';
const API_KEY = process.env.GODADDY_API_KEY;
const API_SECRET = process.env.GODADDY_API_SECRET;

const isMockMode = !API_KEY || !API_SECRET;

// Note: the "mock mode" warning is intentionally deferred to server startup
// logging (server.js checks CRITICAL_VARS), so this module has no side-effects
// on import.

async function checkDomainAvailability(domain) {
  if (isMockMode) {
    if (domain.includes('example') || domain.includes('google')) {
      return { domain, available: false, definitive: true };
    }
    const isAvailable = Math.random() < 0.5;
    return {
      domain,
      available: isAvailable,
      price: isAvailable ? Math.floor(Math.random() * 20) * 1000000 + 1000000 : undefined,
      currency: 'USD',
      definitive: true,
    };
  }

  try {
    if (isDev) {
      console.info(`[DEV] API Call (GoDaddy): GET /v1/domains/available (domain: ${domain})`);
    }
    const response = await axios.get(`${GODADDY_API_URL}/v1/domains/available`, {
      params: { domain },
      headers: {
        Authorization: `sso-key ${API_KEY}:${API_SECRET}`,
        Accept: 'application/json',
      },
    });

    if (isDev) {
      console.info(`[DEV] API Response (GoDaddy): ${JSON.stringify(response.data)}`);
    }
    return response.data;
  } catch (error) {
    if (isDev && error.response) {
      console.info(`[DEV] API Error Response (GoDaddy): ${JSON.stringify(error.response.data)}`);
    }
    console.error(`Error checking domain ${domain}:`, error.response?.data?.message || error.message);
    return { domain, error: true };
  }
}

async function checkDomainsBulk(domains) {
  if (isMockMode) {
    return Promise.all(domains.map(domain => checkDomainAvailability(domain)));
  }

  try {
    if (isDev) {
      console.info(`[DEV] API Call (GoDaddy): POST /v1/domains/available (bulk: ${domains.length} domains)`);
    }
    const response = await axios.post(`${GODADDY_API_URL}/v1/domains/available`, domains, {
      headers: {
        Authorization: `sso-key ${API_KEY}:${API_SECRET}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (isDev) {
      console.info(`[DEV] API Response (GoDaddy Bulk): ${JSON.stringify(response.data)}`);
    }
    return response.data.domains || response.data;
  } catch (error) {
    if (isDev && error.response) {
      console.info(`[DEV] API Error Response (GoDaddy Bulk): ${JSON.stringify(error.response.data)}`);
    }
    console.error(`Error in bulk check:`, error.response?.data?.message || error.message);

    // Fallback to concurrent individual checks (was sequential before)
    const settled = await Promise.allSettled(domains.map(d => checkDomainAvailability(d)));
    return settled.map((r, i) =>
      r.status === 'fulfilled' ? r.value : { domain: domains[i], error: true }
    );
  }
}

module.exports = { checkDomainAvailability, checkDomainsBulk, isMockMode };
