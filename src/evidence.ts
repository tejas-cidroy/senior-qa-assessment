import { test, APIResponse } from '@playwright/test';

/**
 * Attach a request/response pair to the Playwright report (and trace),
 * so a failing API test already carries the evidence a defect needs.
 * Authorization headers are never recorded.
 *
 * Usage:
 *   const body = { slot_date: '2026-10-07', slot_start: '14:00' };
 *   const res = await buyer.checkout(body.slot_date, body.slot_start);
 *   await evidence('checkout', 'POST /api/orders', body, res);
 */
export async function evidence(name: string, request: string, requestBody: unknown, res: APIResponse) {
  const text = await res.text();
  let body: unknown = text;
  try { body = JSON.parse(text); } catch { /* not JSON */ }
  const record = {
    request,
    requestBody: requestBody ?? null,
    url: res.url(),
    status: res.status(),
    responseBody: body,
    at: new Date().toISOString(),
  };
  await test.info().attach(`${name}.json`, {
    body: JSON.stringify(record, null, 2),
    contentType: 'application/json',
  });
  return body;
}
