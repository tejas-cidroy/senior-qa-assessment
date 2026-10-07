import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/api/client';
import { ACCOUNTS, AccountKey } from '../../src/config';

/**
 * Wiring check only: every FDD §6 account can log in and call /api/me.
 * Your role-access and business-rule tests go in their own spec files.
 */
test.describe('smoke: login', () => {
  for (const key of Object.keys(ACCOUNTS) as AccountKey[]) {
    test(`${key} can log in and read /api/me`, async () => {
      const c = await ApiClient.as(key);
      const res = await c.me();
      expect(res.status()).toBe(200);
      await c.dispose();
    });
  }
});
