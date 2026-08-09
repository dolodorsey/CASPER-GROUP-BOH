import { spawnSync } from 'node:child_process';

const acceptedAdvisories = new Map([
  [1138808, 'GHSA-w3rx-r6r6-pgpr'],
  [1138809, 'GHSA-5p2g-fcmc-qvqq'],
]);

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

const blocking = advisories.filter((advisory) => {
  if (!['high', 'critical'].includes(advisory.severity)) return false;
  const expectedGhsa = acceptedAdvisories.get(advisory.source);
  return expectedGhsa === undefined || !advisory.url?.endsWith(expectedGhsa);
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

const counts = report.metadata?.vulnerabilities ?? {};
console.log(
  `Production dependency audit enforced: ${counts.critical ?? 0} critical, ${counts.high ?? 0} high graph entries, ${accepted.length} explicitly accepted root advisories.`,
);

