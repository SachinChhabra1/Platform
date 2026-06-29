import { describe, it, expect } from 'vitest';

import { redactPii, REDACTED } from './redact.js';

describe('redactPii', () => {
  it('redacts known personal-identifier keys at any depth', () => {
    const input = {
      phone: '9990001111',
      amount: 5000,
      nested: { aadhaar: '123412341234', keep: 'ok' },
    };

    const out = redactPii(input);

    expect(out.phone).toBe(REDACTED);
    expect(out.nested.aadhaar).toBe(REDACTED);
    expect(out.amount).toBe(5000);
    expect(out.nested.keep).toBe('ok');
  });

  it('matches keys case-insensitively', () => {
    const out = redactPii({ Phone: 'x', DOB: 'y', Other: 'z' });

    expect(out.Phone).toBe(REDACTED);
    expect(out.DOB).toBe(REDACTED);
    expect(out.Other).toBe('z');
  });

  it('redacts inside arrays', () => {
    const out = redactPii({ recipients: [{ phone: 'a' }, { phone: 'b' }] });

    expect(out.recipients[0]?.phone).toBe(REDACTED);
    expect(out.recipients[1]?.phone).toBe(REDACTED);
  });

  it('honours a custom key set', () => {
    const out = redactPii({ ssn: '1', phone: '2' }, { keys: ['ssn'] });

    expect(out.ssn).toBe(REDACTED);
    expect(out.phone).toBe('2');
  });
});
