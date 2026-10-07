import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { BASE_URL, PASSWORD, ACCOUNTS, AccountKey } from '../config';

/**
 * Thin wrapper over the WholeCart REST API (docs/openapi.json).
 *
 * Methods return the raw APIResponse and never throw on HTTP errors,
 * so tests can assert on status codes for negative cases.
 *
 * URL NOTE: the app lives under a path prefix (/c/tejas-113cc1). Playwright's
 * baseURL resolution drops that prefix for paths starting with '/', so this
 * client always builds absolute URLs itself.
 */

export type ProductPatch = {
  piece_price?: string | null; // prices are strings in the spec (decimal)
  case_price?: string | null;
  stock?: number | null;       // pieces (BR-01)
  active?: boolean | null;
};

export class ApiClient {
  token?: string;

  constructor(readonly ctx: APIRequestContext) {}

  static async create(): Promise<ApiClient> {
    return new ApiClient(await request.newContext());
  }

  /** New client logged in as one of the FDD §6 accounts. */
  static async as(account: AccountKey): Promise<ApiClient> {
    const c = await ApiClient.create();
    await c.loginOrThrow(ACCOUNTS[account].username);
    return c;
  }

  url(path: string): string {
    return BASE_URL + (path.startsWith('/') ? path : '/' + path);
  }

  private headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  // ---------- generic verbs ----------
  get(path: string, params?: Record<string, string | number>): Promise<APIResponse> {
    return this.ctx.get(this.url(path), { headers: this.headers(), params, failOnStatusCode: false });
  }
  post(path: string, data?: unknown): Promise<APIResponse> {
    return this.ctx.post(this.url(path), { headers: this.headers(), data, failOnStatusCode: false });
  }
  put(path: string, data?: unknown): Promise<APIResponse> {
    return this.ctx.put(this.url(path), { headers: this.headers(), data, failOnStatusCode: false });
  }
  patch(path: string, data?: unknown): Promise<APIResponse> {
    return this.ctx.patch(this.url(path), { headers: this.headers(), data, failOnStatusCode: false });
  }
  delete(path: string, params?: Record<string, string | number>): Promise<APIResponse> {
    return this.ctx.delete(this.url(path), { headers: this.headers(), params, failOnStatusCode: false });
  }

  // ---------- auth ----------
  login(username: string, password = PASSWORD): Promise<APIResponse> {
    return this.post('/api/login', { username, password });
  }

  async loginOrThrow(username: string, password = PASSWORD): Promise<void> {
    const res = await this.login(username, password);
    if (!res.ok()) throw new Error(`Login failed for ${username}: ${res.status()} ${await res.text()}`);
    const body = await res.json();
    // TODO(confirm): token field name. The spec declares no response schema; check samples/.
    const token = body.token ?? body.access_token;
    if (!token) throw new Error(`No token field in login response: ${JSON.stringify(body)}`);
    this.token = token;
  }

  me() { return this.get('/api/me'); }

  // ---------- catalogue ----------
  categories() { return this.get('/api/categories'); }
  /** q searches names and SKUs; category browses one category, 24 per page. */
  products(params: { q?: string; category?: string; page?: number } = {}) {
    const p: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) if (v !== undefined) p[k] = v;
    return this.get('/api/products', p);
  }
  product(pid: number) { return this.get(`/api/products/${pid}`); }

  // ---------- cart ----------
  cart() { return this.get('/api/cart'); }
  cartAdd(product_id: number, unit: string, qty: number) { return this.post('/api/cart/items', { product_id, unit, qty }); }
  cartSet(product_id: number, unit: string, qty: number) { return this.put('/api/cart/items', { product_id, unit, qty }); }
  cartRemove(product_id: number, unit: string) { return this.delete('/api/cart/items', { product_id, unit }); }

  // ---------- slots & orders ----------
  slots(date: string) { return this.get('/api/slots', { date }); }
  orders() { return this.get('/api/orders'); }
  checkout(slot_date: string, slot_start: string) { return this.post('/api/orders', { slot_date, slot_start }); }
  order(oid: number) { return this.get(`/api/orders/${oid}`); }
  changeSlot(oid: number, slot_date: string, slot_start: string) { return this.patch(`/api/orders/${oid}`, { slot_date, slot_start }); }
  cancel(oid: number) { return this.post(`/api/orders/${oid}/cancel`); }
  redelivery(oid: number, slot_date: string, slot_start: string) { return this.post(`/api/orders/${oid}/redelivery`, { slot_date, slot_start }); }
  reorder(oid: number) { return this.post(`/api/orders/${oid}/reorder`); }

  // ---------- refunds & exchanges ----------
  // TODO(confirm): allowed 'type' values and the shape of each entry in 'items' are undocumented.
  requestRefund(oid: number, type: string, items: unknown[] = []) { return this.post(`/api/orders/${oid}/refunds`, { type, items }); }
  refunds(oid: number) { return this.get(`/api/orders/${oid}/refunds`); }

  // ---------- invoices, statements, inquiries ----------
  invoices() { return this.get('/api/invoices'); }
  invoice(iid: number) { return this.get(`/api/invoices/${iid}`); }
  // TODO(confirm): month format (e.g. 2026-10).
  statement(month: string) { return this.get(`/api/statements/${month}`); }
  inquiries() { return this.get('/api/inquiries'); }
  createInquiry(subject: string, body: string, order_id: number | null = null) { return this.post('/api/inquiries', { subject, body, order_id }); }

  // ---------- seller ----------
  sellerOrders(status?: string) { return this.get('/api/seller/orders', status ? { status } : undefined); }
  sellerOrder(oid: number) { return this.get(`/api/seller/orders/${oid}`); }
  // TODO(confirm): action names are a free string in the spec; take them from the seller screen.
  sellerAction(oid: number, action: string) { return this.post(`/api/seller/orders/${oid}/${action}`); }
  sellerProducts(page?: number) { return this.get('/api/seller/products', page ? { page } : undefined); }
  sellerUpdateProduct(pid: number, patch: ProductPatch) { return this.put(`/api/seller/products/${pid}`, patch); }
  sellerImport(csv: string | Buffer, filename = 'products.csv') {
    return this.ctx.post(this.url('/api/seller/products/import'), {
      headers: this.headers(),
      multipart: {
        file: { name: filename, mimeType: 'text/csv', buffer: Buffer.isBuffer(csv) ? csv : Buffer.from(csv, 'utf-8') },
      },
      failOnStatusCode: false,
    });
  }
  sellerRefunds() { return this.get('/api/seller/refunds'); }
  // TODO(confirm): decision values are a free string in the spec.
  sellerRefundDecision(rid: number, decision: string) { return this.post(`/api/seller/refunds/${rid}/${decision}`); }
  sellerProfile() { return this.get('/api/seller/profile'); }
  registerSeller(name: string, gstin: string, email: string) { return this.post('/api/sellers/register', { name, gstin, email }); }

  // ---------- operator ----------
  settings() { return this.get('/api/admin/settings'); }
  /** Free-form body; take the keys from GET /api/admin/settings. */
  updateSettings(patch: Record<string, unknown>) { return this.put('/api/admin/settings', patch); }
  adminSellers() { return this.get('/api/admin/sellers'); }
  approveSeller(sid: number) { return this.post(`/api/admin/sellers/${sid}/approve`); }
  adminBuyers() { return this.get('/api/admin/buyers'); }
  runLogisticsExport() { return this.post('/api/admin/logistics-export'); }
  latestLogisticsExport() { return this.get('/api/admin/logistics-export/latest'); }

  // ---------- monitoring ----------
  metrics() { return this.get('/api/metrics'); }

  async dispose() { await this.ctx.dispose(); }
}

/** Seller partner API (IF-03): X-Api-Key header instead of a Bearer token. */
export class PartnerClient {
  constructor(readonly ctx: APIRequestContext, private apiKey: string | null) {}

  static async create(apiKey: string | null): Promise<PartnerClient> {
    return new PartnerClient(await request.newContext(), apiKey);
  }

  private url(path: string) { return BASE_URL + path; }
  private headers(): Record<string, string> { return this.apiKey ? { 'X-Api-Key': this.apiKey } : {}; }

  orders(page?: number) {
    return this.ctx.get(this.url('/partner/v1/orders'), { headers: this.headers(), params: page ? { page } : undefined, failOnStatusCode: false });
  }
  products(page?: number) {
    return this.ctx.get(this.url('/partner/v1/products'), { headers: this.headers(), params: page ? { page } : undefined, failOnStatusCode: false });
  }
  updateOffer(pid: number, patch: ProductPatch) {
    return this.ctx.put(this.url(`/partner/v1/offers/${pid}`), { headers: this.headers(), data: patch, failOnStatusCode: false });
  }

  async dispose() { await this.ctx.dispose(); }
}
