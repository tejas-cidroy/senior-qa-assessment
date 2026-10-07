/**
 * Environment and test accounts (FDD §6).
 * Override with environment variables, e.g. WC_BASE_URL=... npm test
 */
export const BASE_URL = (process.env.WC_BASE_URL ?? 'http://13.200.185.1/c/tejas-113cc1').replace(/\/+$/, '');
export const PASSWORD = process.env.WC_PASSWORD ?? 'Test@123';

export const ACCOUNTS = {
  buyer1: { username: 'buyer1', role: 'buyer', name: 'Spice Route Kitchen' },
  buyer2: { username: 'buyer2', role: 'buyer', name: 'Café Dosa Corner' },
  buyer3: { username: 'buyer3', role: 'buyer', name: 'शर्मा भोजनालय' },
  seller1: { username: 'seller1', role: 'seller', name: 'WholeCart Direct' },
  seller2: { username: 'seller2', role: 'seller', name: 'FreshFarm Foods' },
  seller3: { username: 'seller3', role: 'seller', name: 'Coastal Beverages' },
  operator: { username: 'operator', role: 'operator', name: 'Operator' },
} as const;

export type AccountKey = keyof typeof ACCOUNTS;
