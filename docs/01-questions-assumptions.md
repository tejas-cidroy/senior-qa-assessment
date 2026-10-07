# Questions and assumptions log

**Product:** WholeCart 1.0 marketplace release
**Test basis:** Functional design WC-FDD-1.0-89d9, Release notes WC-RN-1.0-89d9, API reference (OpenAPI 3.1, `/c/tejas-113cc1/openapi.json`), live screens
**Precedence:** Release notes override the functional design where they differ.

No product owner was available during testing. Each entry records the question I would have asked, the assumption I tested against instead, and why. Test cases cite the assumption ID in their expected result, so if an assumption turns out to be wrong, the affected tests are easy to find and re-evaluate.

## Risk if wrong

| Rating | Meaning |
|---|---|
| H | A wrong assumption would hide or invent a defect in money, stock, order state or data access |
| M | A wrong assumption would change expected results for a feature but not core transactions |
| L | Wording, layout or convenience only |

## Questions

| ID | Source | Question | Why it matters | Assumption used | Basis for assumption | Risk if wrong | Affects |
|---|---|---|---|---|---|---|---|
| Q-01 | FDD BR-03; FDD 5.1 Quantity | BR-03 allows 1–99 per cart line, but the cart's quantity dropdown only offers 1–20. How should the cart show and let the buyer change a line with more than 20 (e.g. 45, added from the product page)? | Decides the expected result for every cart test above 20, and whether a buyer can reduce a large line without deleting it | Lines of 21–99 are valid. The cart shows the quantity (e.g. 45) as text with no dropdown; larger quantities are changed from the product page | BR-03 is the business rule and allows up to 99; 5.1 says larger quantities are added from the product page, so the 1–20 dropdown is a screen limit, not a rule limit | M | |
| Q-02 | RN CR-07 (replaces FDD BR-04) | Is a seller sub-order of exactly ₹2,000.00 net accepted, i.e. is the minimum inclusive? | Decides the expected result at the exact boundary, where the risk of an off-by-one error is highest | ₹2,000.00 net is accepted; ₹1,999.99 net is blocked | "Minimum order ₹2,000" normally means ₹2,000 itself meets the minimum | M | |
| Q-03 | FDD BR-24 | When the operator fixes the store clock to a given time, does the clock stay frozen at that time or keep running from it? | All time-based tests (BR-05, BR-06, BR-11, BR-15) depend on how the clock moves; it decides how boundary times such as 5:00 can be hit precisely | The clock keeps running from the fixed time. Boundary tests set the clock just before each action (e.g. place order, then set clock to placed time + 5:00 and cancel at once) | BR-24 does not say the clock stops. To be confirmed in the app by fixing the clock and comparing order timestamps | H | |

*Source* = the exact reference, e.g. `FDD BR-xx`, `FDD 5.x mockup`, `RN CR-xx`, `API /api/...`, `Screen: <page>`.
*Affects* = test case and defect IDs that depend on this assumption.

## Document conflicts

Places where two sources disagree. The resolution column follows the precedence rule above; where the rule doesn't settle it, the conflict also gets a Q-ID.

| ID | Source A says | Source B says | Resolution / which I tested against | Q-ID | Defect ID |
|---|---|---|---|---|---|
| C-01 | FDD BR-03: quantity per cart line is 1 to 99 | FDD 5.1: quantity dropdown 1–20; larger quantities added from the product page | Not settled by precedence (both in the FDD). Tested against BR-03 (1–99 valid), with the cart behaviour assumed in Q-01 | Q-01 | |
| C-02 | FDD BR-04: minimum order ₹1,500 net (before tax) per seller | RN CR-07: minimum raised to ₹2,000 net per seller; operator setting updated | Settled by precedence: release notes win. Tested against ₹2,000 net per seller | Q-02 | |
