const baseUrl = (process.env.PRODUCTION_URL ?? 'https://casper-group-boh.vercel.app').replace(/\/$/, '');
const requiredRoutes = ['/', '/login', '/command'];
const expectedBundleMarkers = [
  'qhgmukwoennurwuvmbhy',
  'sb_publishable_',
  'cg_reports_daily',
];
const legacyJwtPattern = /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/;

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetry(url, attempts = 4) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await delay(15_000);
    }
  }

  throw new Error(`Unable to fetch ${url}: ${lastError?.message ?? 'unknown error'}`);
}

const routeHtml = new Map();
for (const route of requiredRoutes) {
  const response = await fetchWithRetry(`${baseUrl}${route}`);
  routeHtml.set(route, await response.text());
  console.log(`PASS ${route} -> ${response.status}`);
}

const entryHtml = routeHtml.get('/');
const scriptSources = [...entryHtml.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map((match) => match[1]);
if (scriptSources.length === 0) throw new Error('No deployed JavaScript bundle was found in the production HTML.');

const bundles = await Promise.all(
  scriptSources.map(async (source) => {
    const bundleUrl = new URL(source, `${baseUrl}/`).toString();
    return fetchWithRetry(bundleUrl).then((response) => response.text());
  }),
);
const deployedCode = `${entryHtml}\n${bundles.join('\n')}`;

for (const marker of expectedBundleMarkers) {
  if (!deployedCode.includes(marker)) throw new Error(`Missing production bundle marker: ${marker}`);
  console.log(`PASS bundle marker ${marker}`);
}

if (legacyJwtPattern.test(deployedCode)) throw new Error('A legacy JWT-like Supabase key is present in the deployed bundle.');
console.log('PASS no legacy JWT-like Supabase key in the deployed bundle');
