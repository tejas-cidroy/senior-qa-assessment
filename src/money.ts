/**
 * Money helpers in integer paise, so expected values never suffer floating-point error.
 * BR-07: tax per rate on the summed net of all lines at that rate, rounded half-up once per rate.
 */

/** "₹2,318.40", "2318.4" or 2318.4 -> 231840 */
export const toPaise = (rupees: string | number): number => {
  const s = String(rupees).replace(/[₹,\s]/g, '');
  const negative = s.startsWith('-');
  const [whole, frac = ''] = s.replace('-', '').split('.');
  const value = parseInt(whole || '0', 10) * 100 + parseInt((frac + '00').slice(0, 2), 10);
  return negative ? -value : value;
};

export const toRupees = (paise: number): string => (paise / 100).toFixed(2);

/** Half-up rounding of netPaise * ratePercent / 100 using integer arithmetic only. */
export const taxPaise = (netPaise: number, ratePercent: number): number =>
  Math.floor((netPaise * ratePercent + 50) / 100);
