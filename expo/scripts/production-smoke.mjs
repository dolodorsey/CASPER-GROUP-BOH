const baseUrl = (process.env.PRODUCTION_URL ?? 'https://casper-group-boh.vercel.app').replace(/\/$/, '');
const expectedCommitSha = process.env.EXPECTED_COMMIT_SHA?.trim() ?? '';
const requiredRoutes = ["/","/login","/command"];
const expectedBundleMarkers = ["qhgmukwoennurwuvmbhy","sb_publishable_","cg_reports_daily"];
const expectedSecurityHeaders = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
};
const legacyJwtPattern = /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchRequired(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'cache-control': 'no-cache' },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response;
}

async function readDeployment() {
  const routeHtml = new Map();
  for (const route of requiredRoutes) {
    const response = await fetchRequired(`${baseUrl}${route}`);
    if (response.headers.get('server')?.toLowerCase() !== 'vercel') {
      throw new Error(`${route} is not being served by Vercel.`);
    }
    for (const [name, expected] of Object.entries(expectedSecurityHeaders)) {
      if (response.headers.get(name) !== expected) {
        throw new Error(`${route} has invalid ${name}; expected ${expected}.`);
      }
    }
    if (!response.headers.get('content-security-policy')?.includes('qhgmukwoennurwuvmbhy.supabase.co')) {
      throw new Error(`${route} is missing the project-specific Content-Security-Policy.`);
    }
    routeHtml.set(route, await response.text());
  }

  const entryHtml = routeHtml.get('/');
  const scriptSources = [...entryHtml.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map((match) => match[1]);
  if (scriptSources.length === 0) throw new Error('No deployed JavaScript bundle was found in production HTML.');

  const bundles = await Promise.all(
    scriptSources.map(async (source) => {
      const response = await fetchRequired(new URL(source, `${baseUrl}/`).toString());
      return response.text();
    }),
  );

  return { routeHtml, deployedCode: `${entryHtml}\n${bundles.join('\n')}` };
}

let lastError;
for (let attempt = 1; attempt <= 8; attempt += 1) {
  try {
    const { deployedCode } = await readDeployment();
    for (const marker of expectedBundleMarkers) {
      if (!deployedCode.includes(marker)) throw new Error(`Missing production bundle marker: ${marker}`);
    }
    if (legacyJwtPattern.test(deployedCode)) {
      throw new Error('A legacy JWT-like Supabase key is present in the deployed bundle.');
    }
    if (expectedCommitSha && !deployedCode.includes(expectedCommitSha)) {
      throw new Error(`Production has not promoted expected commit ${expectedCommitSha}.`);
    }

    for (const route of requiredRoutes) console.log(`PASS ${route} -> 200 with security headers`);
    for (const marker of expectedBundleMarkers) console.log(`PASS bundle marker ${marker}`);
    console.log('PASS no legacy JWT-like Supabase key in the deployed bundle');
    if (expectedCommitSha) console.log(`PASS deployed commit ${expectedCommitSha}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < 8) await delay(15_000);
  }
}

throw new Error(`Production verification failed after eight attempts: ${lastError?.message ?? 'unknown error'}`);

