/**
 * Records real API responses so tests can be written against actual shapes
 * (docs/openapi.json declares no response schemas).
 *
 * READ-ONLY: only POST /api/login and GET requests. It changes no data,
 * places no orders and does not touch settings or the store clock.
 * Sequential with a delay: about 4 requests per second, far below the 50 req/s limit (NF-03).
 *
 * Run:  npm run capture
 * Output: samples/<account>__<name>.json  ({ request, status, contentType, body })
 *
 * Review the output before committing: it contains your test environment's data.
 * Authorization headers and tokens are not written to disk.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { APIResponse } from '@playwright/test';
import { ApiClient, PartnerClient } from '../src/api/client';
import { AccountKey, BASE_URL } from '../src/config';

const OUT = join(__dirname, '..', 'samples');
const DELAY_MS = 250;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Today's date in IST (YYYY-MM-DD). The store clock may differ if the operator fixed it (BR-24). */
const todayIST = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const monthIST = () => todayIST().slice(0, 7);

async function save(file: string, label: string, res: APIResponse) {
  const contentType = res.headers()['content-type'] ?? '';
  const text = await res.text();
  let body: unknown = text;
  if (contentType.includes('json')) {
    try { body = JSON.parse(text); } catch { /* keep text */ }
  }
  // Never persist tokens.
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    for (const k of ['token', 'access_token']) if (k in (body as any)) (body as any)[k] = '<redacted>';
  }
  writeFileSync(join(OUT, `${file}.json`), JSON.stringify({ request: label, status: res.status(), contentType, body }, null, 2));
  console.log(`${String(res.status()).padEnd(4)} ${label}`);
  await sleep(DELAY_MS);
}

async function capture(account: AccountKey, calls: [string, (c: ApiClient) => Promise<APIResponse>][]) {
  const c = await ApiClient.create();
  const loginRes = await c.login(account);
  await save(`${account}__login`, `POST /api/login (${account})`, loginRes);
  if (!loginRes.ok()) { console.error(`  login failed for ${account}, skipping`); return c; }
  const body = await loginRes.json();
  c.token = body.token ?? body.access_token;
  for (const [name, fn] of calls) {
    try { await save(`${account}__${name}`, `${name} (${account})`, await fn(c)); }
    catch (e) { console.error(`  ${name} failed: ${(e as Error).message}`); }
  }
  return c;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log(`Capturing from ${BASE_URL}\n`);

  // Unauthenticated
  const anon = await ApiClient.create();
  await save('anon__products', 'GET /api/products (no token)', await anon.products());
  await save('anon__metrics', 'GET /api/metrics (no token)', await anon.metrics());

  // Buyer
  const buyerCalls: [string, (c: ApiClient) => Promise<APIResponse>][] = [
    ['me', (c) => c.me()],
    ['categories', (c) => c.categories()],
    ['products', (c) => c.products()],
    ['products_page2', (c) => c.products({ page: 2 })],
    ['cart', (c) => c.cart()],
    ['slots_today', (c) => c.slots(todayIST())],
    ['orders', (c) => c.orders()],
    ['invoices', (c) => c.invoices()],
    ['statement_this_month', (c) => c.statement(monthIST())],
    ['inquiries', (c) => c.inquiries()],
  ];
  const b1 = await capture('buyer1', buyerCalls);
  // One product detail, if we can find an id in the product list
  try {
    const list = await (await b1.products()).json();
    const items = Array.isArray(list) ? list : list.items ?? list.products ?? list.results ?? [];
    if (items[0]?.id !== undefined) await save('buyer1__product_detail', `GET /api/products/${items[0].id} (buyer1)`, await b1.product(items[0].id));
  } catch { /* shape unknown; fine */ }

  // Seller
  const s2 = await capture('seller2', [
    ['me', (c) => c.me()],
    ['profile', (c) => c.sellerProfile()],
    ['orders', (c) => c.sellerOrders()],
    ['products', (c) => c.sellerProducts()],
    ['refunds', (c) => c.sellerRefunds()],
  ]);

  // Partner API, if the seller profile exposes a key
  try {
    const profile = await (await s2.sellerProfile()).json();
    const key = Object.entries(profile ?? {}).find(([k, v]) => /key/i.test(k) && typeof v === 'string')?.[1] as string | undefined;
    const partner = await PartnerClient.create(key ?? null);
    await save('seller2__partner_products', `GET /partner/v1/products (key ${key ? 'from profile' : 'MISSING'})`, await partner.products());
    await save('seller2__partner_orders', `GET /partner/v1/orders (key ${key ? 'from profile' : 'MISSING'})`, await partner.orders());
  } catch (e) { console.error(`  partner capture failed: ${(e as Error).message}`); }

  // Operator
  await capture('operator', [
    ['me', (c) => c.me()],
    ['settings', (c) => c.settings()],
    ['sellers', (c) => c.adminSellers()],
    ['buyers', (c) => c.adminBuyers()],
    ['logistics_latest', (c) => c.latestLogisticsExport()],
    ['metrics', (c) => c.metrics()],
  ]);

  console.log(`\nDone. Files in ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
