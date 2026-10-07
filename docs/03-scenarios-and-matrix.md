# Test scenarios and coverage matrix

## 1. End-to-end scenarios

Each scenario is a business journey across at least two roles (buyer, seller, operator). Test cases in the test specification implement the scenario's verification points.

### Scenario format

| Field | Content |
|---|---|
| **ID / title** | SC-xx: _<business outcome in one line>_ |
| **Roles** | Buyer / Seller / Operator |
| **Preconditions** | Accounts, settings, store clock, stock, data |
| **Flow** | Numbered steps, each naming the role acting |
| **Verify (per role)** | What each role should see at the end, on screen and via API |
| **Requirements** | BR / IF / NF / CR IDs exercised |
| **Assumptions** | Q-IDs relied on |
| **Priority** | P1 / P2 / P3 |
| **Test cases** | TC-IDs |

### SC-01: Multi-seller order from checkout to logistics export

| Field | Content |
|---|---|
| **Roles** | Buyer (buyer1), Sellers (seller1 WholeCart Direct, seller2 FreshFarm Foods), Operator |
| **Preconditions** | Both sellers have in-stock products. Cart value for each seller is at least ₹2,000 net (CR-07). Store clock set to a known time |
| **Flow** | 1. Buyer adds products from seller1 and seller2 to the cart. 2. Buyer chooses a delivery slot and places one checkout. 3. Each seller accepts and ships their own part of the order. 4. Operator runs the logistics export |
| **Verify: buyer** | Checkout shows a separate breakdown per seller (BR-22) with tax (BR-07) and delivery fee (BR-08) as specified; order number follows BR-09; order history shows each part's status moving through BR-13 |
| **Verify: sellers** | Each seller sees only their own part of the order (BR-21) on the seller order list (5.5) and can accept and ship it (BR-13) |
| **Verify: operator** | Logistics export contains the shipped orders in the format given in IF-02 |
| **Requirements** | BR-04/CR-07, BR-05, BR-07, BR-08, BR-09, BR-13, BR-21, BR-22, IF-02; screens 5.2, 5.3, 5.5 |
| **Priority** | P1 (money is the top priority area) |

### SC-02: Partial refund after delivery, approved by seller

| Field | Content |
|---|---|
| **Roles** | Buyer (buyer2), Seller (seller2 FreshFarm Foods) |
| **Preconditions** | Buyer has an order from seller2 with at least two lines, in the status that allows refunds (BR-13, BR-17) |
| **Flow** | 1. Buyer requests a refund for part of the order (some lines or part of a quantity). 2. Seller sees the request in their refunds list. 3. Seller approves it |
| **Verify: buyer** | Only eligible lines and quantities can be requested (BR-17); after approval, refund amount includes tax on the refunded part (BR-18) and the refund status is visible |
| **Verify: seller** | Request appears only for the seller who owns the order (BR-21); seller can approve it (BR-18) |
| **Requirements** | BR-13, BR-17, BR-18, BR-21 |
| **Priority** | P1 (money is the top priority area) |

### SC-03: Buyer cancels within 5 minutes; seller sees the cancellation

| Field | Content |
|---|---|
| **Roles** | Buyer (buyer3), Seller (seller3 Coastal Beverages) |
| **Preconditions** | Seller3 has an in-stock product; note its stock level before ordering |
| **Flow** | 1. Buyer places an order with seller3. 2. Within 5 minutes, buyer cancels it. 3. Seller opens their order list |
| **Verify: buyer** | Cancellation is accepted (BR-11); order shows as cancelled in order history (BR-13, 5.3) |
| **Verify: seller** | Order shows as cancelled in the seller order list (5.5) |
| **Verify: stock** | Product stock is back to the level noted before ordering (BR-11, BR-01) |
| **Requirements** | BR-01, BR-11, BR-13; screens 5.3, 5.5 |
| **Assumptions** | Q-03 (store clock); exact 5:00 boundary covered in test cases, not this scenario |
| **Priority** | P1 (time rules are the second priority area) |

### Scenario list

| ID | Title | Roles | Requirements | Priority | Test cases | Result |
|---|---|---|---|---|---|---|
| SC-01 | Multi-seller order from checkout to logistics export | Buyer, Seller, Operator | BR-04/CR-07, BR-05, BR-07, BR-08, BR-09, BR-13, BR-21, BR-22, IF-02 | P1 | | |
| SC-02 | Partial refund after delivery, approved by seller | Buyer, Seller | BR-13, BR-17, BR-18, BR-21 | P1 | | |
| SC-03 | Buyer cancels within 5 minutes; seller sees the cancellation | Buyer, Seller | BR-01, BR-11, BR-13 | P1 | | |

---

## 2. Coverage matrix by business flow

Rows are the business flows in the functional design (§1, "Role / Can do"), with the order lifecycle from BR-13. Each flow lists the rules, screens and interfaces that apply to it, so every requirement in the design is reached through at least one flow.

**Legend:** 📋 planned (not yet run) · ✅ covered and passed · ❌ covered, defect found · ⚠️ partly covered · ⬜ not covered (reason in Notes)

| ID | Role | Business flow (FDD §1) | Existing / new | Rules | Screens / interfaces | Scenarios | Test cases | Automated | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| F-B01 | Buyer | Login | Existing | BR-21 | — | — | | | ⚠️ | Login and role access in regression automation only |
| F-B02 | Buyer | Browse and search | Existing | BR-02, BR-22, NF-02 | Catalogue | — | | | ⚠️ | Search speed covered by load test (NF-02); BR-02 not covered. Open risk |
| F-B03 | Buyer | Cart | Existing | BR-01, BR-03 | 5.1 | — | | | ⬜ | Q-01 / C-01 raised; no scenario. Open risk |
| F-B04 | Buyer | Checkout (multi-seller, one sub-order per seller) | Existing (Direct); New (multi-seller) | BR-01, BR-04/CR-07, BR-05, BR-06, BR-07, BR-08, BR-09, BR-10, BR-22, NF-01 | 5.2 | SC-01 | | | 📋 | BR-06 and BR-10 not in scenario; minimum-order boundary via Q-02; NF-01 via load test |
| F-B05 | Buyer | Order history | Existing | BR-21 | 5.3 | SC-01, SC-03 | | | 📋 |  |
| F-B06 | Buyer | Cancel | New | BR-01, BR-11, BR-13 | 5.3 | SC-03 | | | 📋 | Exact 5:00 boundary in test cases (Q-03) |
| F-B07 | Buyer | Change slot | New | BR-05, BR-06, BR-15 | — | — | | | ⬜ | No scenario (time). Open risk |
| F-B08 | Buyer | Redelivery | New | BR-05, BR-06, BR-13, BR-14 | — | — | | | ⬜ | No scenario (time). Open risk |
| F-B09 | Buyer | Reorder | Not stated | BR-16 | 5.3 | — | | | ⬜ | No scenario (time). Open risk |
| F-B10 | Buyer | Refunds and exchanges | New | BR-17, BR-18 | — | SC-02 | | | ⚠️ | Partial refund only; full refund and exchange not covered |
| F-B11 | Buyer | Invoices | New | BR-07, BR-08, BR-19, CR-09 | 5.4 | — | | | ⬜ | No scenario (time). Open risk |
| F-B12 | Buyer | Monthly statements | New | BR-20, BR-21 | — | — | | | ⬜ | No scenario (time). Open risk |
| F-B13 | Buyer | Inquiries | New | CR-11 (attachments deferred) | — | — | | | ⬜ | No scenario (time). Open risk |
| F-S01 | Seller | Accept, ship, deliver, mark delivery failed, cancel | New | BR-12, BR-13, BR-21 | 5.5 | SC-01, SC-03 | | | ⚠️ | Accept and ship covered; deliver, delivery failed and seller cancel not covered |
| F-S02 | Seller | Manage products and stock (screen) | New | BR-01, BR-02 | Seller screens | — | | | ⬜ | No scenario (time). Open risk |
| F-S03 | Seller | Product CSV import | New | IF-01 | Seller screens | — | | | ⬜ | No scenario (time). Open risk |
| F-S04 | Seller | Partner API (orders, offers) | New | IF-03 | Partner API | — | | | ⬜ | No scenario (time). Open risk |
| F-S05 | Seller | Approve or reject refund and exchange requests | New | BR-18, BR-21 | — | SC-02 | | | ⚠️ | Approve only; reject not covered |
| F-O01 | Operator | Marketplace settings (incl. store clock) | Existing | BR-04/CR-07, BR-05, BR-06, BR-23, BR-24 | — | — | | | ⚠️ | Store clock used as a test tool (Q-03); settings changes not tested |
| F-O02 | Operator | Seller approval | New | — | — | — | | | ⬜ | No scenario (time). Open risk |
| F-O03 | Operator | Logistics export | New | IF-02 | — | SC-01 | | | 📋 |  |
| F-X01 | All | Data access between buyers and sellers | — | BR-21 | All | SC-01, SC-02 | | | ⚠️ | Seller-side checked; buyer-to-buyer and operator endpoints not covered. Open risk |
| F-X02 | All | Performance and rate limit | — | NF-01, NF-02, NF-03 | /api/metrics | Load test | | | 📋 | Load test under 50 req/s |

### Coverage summary

Planned before execution; final figures are filled in after testing.

| Measure | Value |
|---|---|
| Business flows in matrix | 23 |
| Planned (📋) | 5 |
| Partly covered (⚠️) | 7 |
| Not covered (⬜) | 11 |
| Planned coverage % = (planned + partly) ÷ total | 52% |
| New-in-release flows with any coverage | 6 of 15 |
