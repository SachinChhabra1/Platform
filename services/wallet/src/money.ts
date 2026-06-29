/// Money for the Wallet Overview. Integer minor units (paise) only — never
/// floats — so arithmetic is exact (Book V §1.8: boring and correct). The
/// Member market is India; the currency is INR. Formatting (the ₹ glyph, the
/// Member's script digits — Book III §5.3) is an i18n/frontend concern and is
/// NOT done here: this layer is pure data.

export interface Money {
  /** Amount in paise (1 rupee = 100 paise). Always an integer. */
  readonly minor: number;
  readonly currency: 'INR';
}

export const ZERO_INR: Money = { minor: 0, currency: 'INR' };

/** Builds Money from paise (minor units). */
export function paise(minor: number): Money {
  return { minor, currency: 'INR' };
}

/** Builds Money from whole rupees — a convenience for readable call sites and tests. */
export function rupees(amount: number): Money {
  return { minor: Math.round(amount * 100), currency: 'INR' };
}
