/**
 * k6 load test skeleton: NF-02 search (and NF-01 checkout, to be completed).
 * Run:  k6 run load/checkout-search.js
 *       k6 run -e WC_BASE_URL=http://... load/checkout-search.js
 *
 * Total request rate must stay below 50 req/s (NF-03). Rates below are set so
 * the sum of all scenarios stays under that cap.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = (__ENV.WC_BASE_URL || 'http://13.200.185.1/c/tejas-113cc1').replace(/\/+$/, '');
const PASSWORD = __ENV.WC_PASSWORD || 'Test@123';
const SEARCH_TERMS = (__ENV.SEARCH_TERMS || 'rice,oil,flour,sugar,water').split(',');

export const options = {
  scenarios: {
    search: {
      executor: 'constant-arrival-rate',
      exec: 'search',
      rate: 10,            // 10 searches per second
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 20,
      maxVUs: 40,
    },
    // checkout: { ... }   // NF-01: see TODO in checkout() below; add once the design is decided.
  },
  thresholds: {
    'http_req_duration{scenario:search}': ['p(95)<2000'],   // NF-02
    'http_req_failed{scenario:search}': ['rate<0.01'],
    'http_reqs': ['rate<50'],                                // NF-03 guard on our own load
  },
};

function login(username) {
  const res = http.post(`${BASE}/api/login`, JSON.stringify({ username, password: PASSWORD }), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' },
  });
  check(res, { 'login 200': (r) => r.status === 200 });
  const body = res.json();
  return body.token || body.access_token; // TODO(confirm) field name from samples/
}

export function setup() {
  const before = http.get(`${BASE}/api/metrics`, { tags: { name: 'metrics' } });
  return { token: login('buyer1'), metricsBefore: before.body };
}

export function search(data) {
  const q = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  const res = http.get(`${BASE}/api/products?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${data.token}` },
    tags: { name: 'search' },
  });
  check(res, {
    'search 200': (r) => r.status === 200,
    'not rate limited': (r) => r.status !== 429,
  });
}

export function checkout(data) {
  // TODO(NF-01): 30 buyers checking out at the same time.
  // Open design questions (yours to decide and log):
  //  - only 3 buyer accounts exist; how do you model 30 concurrent buyers?
  //  - each slot takes at most 5 orders (BR-05); 30 checkouts need capacity or many slots.
  //  - every checkout consumes stock; record stock before and restore after.
  sleep(1);
}

export function teardown(data) {
  const after = http.get(`${BASE}/api/metrics`, { tags: { name: 'metrics' } });
  console.log(`metrics before:\n${data.metricsBefore}\nmetrics after:\n${after.body}`);
}
