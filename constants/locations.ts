/**
 * Casper Group — Location Constants (Fallback/Offline)
 * In production, use useLocations() hook from hooks/useSupabaseData.ts
 */
export const LOCATIONS = [
  {
    id: 'atlanta-hq',
    name: 'Atlanta HQ',
    x: '48%',
    y: '58%',
    status: 'open' as const,
    revenue: '$892K',
    address: '123 Peachtree St NE, Atlanta GA',
  },
  {
    id: 'houston-hub',
    name: 'Houston Hub',
    x: '35%',
    y: '68%',
    status: 'open' as const,
    revenue: '$567K',
    address: '456 Main St, Houston TX',
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles Studio',
    x: '12%',
    y: '55%',
    status: 'open' as const,
    revenue: '$456K',
    address: '789 Sunset Blvd, Los Angeles CA',
  },
  {
    id: 'washington-dc',
    name: 'Washington DC',
    x: '52%',
    y: '42%',
    status: 'surge' as const,
    revenue: '$678K',
    address: '321 Pennsylvania Ave, Washington DC',
  },
  {
    id: 'charlotte',
    name: 'Charlotte Outpost',
    x: '50%',
    y: '52%',
    status: 'open' as const,
    revenue: '$234K',
    address: '555 Trade St, Charlotte NC',
  },
];
