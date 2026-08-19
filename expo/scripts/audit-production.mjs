import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const acceptedAdvisories = new Map([
  [1138808, 'GHSA-w3rx-r6r6-pgpr'],
  [1138809, 'GHSA-5p2g-fcmc-qvqq'],
]);

function legacyNanoidZeroSizeFixed() {
  try {
    const pkg = JSON.parse(readFileSync('node_modules/nanoid/package.json', 'utf8'));
    const [major, minor, patch] = String(pkg.version || '').split('.').map(Number);
    // Nano ID upstream backported the zero-size infinite-loop fix to 3.3.17.
    return major === 3 && minor === 3 && patch >= 17;
  } catch {
    return false;
  }
}

const result = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024,
});

if (result.error) throw result.error;
if (!result.stdout.trim()) {
  throw new Error(`npm audit returned no JSON. ${result.stderr.trim()}`);
}

const report = JSON.parse(result.stdout);
const advisories = [];
for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vulnerability.via ?? []) {
    if (typeof via === 'object' && via !== null && !advisories.some((item) => item.source === via.source)) {
      advisories.push(via);
    }
  }
}

const acceptedByBackport = [];
const blocking = advisories.filter((advisory) => {
  if (!['high', 'critical'].includes(advisory.severity)) return false;
  const expectedGhsa = acceptedAdvisories.get(advisory.source);
  if (expectedGhsa !== undefined && advisory.url?.endsWith(expectedGhsa)) return false;

  // npm's advisory range can lag a supported maintenance branch. Do not make a
  // global exception: this is allowed only when the installed package itself is
  // Nano ID 3.3.17+ and the advisory is the zero-size loop fixed by that backport.
  if (advisory.url?.endsWith('GHSA-2v37-7h3g-55p8') && legacyNanoidZeroSizeFixed()) {
    acceptedByBackport.push(advisory);
    return false;
  }
  return true;
});

if (blocking.length > 0) {
  for (const advisory of blocking) {
    console.error(`BLOCK ${advisory.severity} ${advisory.url}: ${advisory.title}`);
  }
  process.exit(1);
}

const accepted = advisories.filter((advisory) => acceptedAdvisories.has(advisory.source));
for (const advisory of accepted) {
  console.warn(`ACCEPTED build-time advisory ${advisory.url}: Expo Metro cannot yet consume image-size 2.x; production does not parse user-supplied image assets.`);
}
for (const advisory of acceptedByBackport) {
  console.warn(`ACCEPTED fixed legacy advisory ${advisory.url}: installed Nano ID 3.3.17+ contains the upstream zero-size loop backport.`);
}

const counts = report.metadata?.vulnerabilities ?? {};
console.log(
  `Production dependency audit enforced: ${counts.critical ?? 0} critical, ${counts.high ?? 0} high graph entries, ${accepted.length + acceptedByBackport.length} explicitly evaluated advisories.`,
);
