import { describe, it, expect } from 'vitest';

import { createLogger } from './logger.js';

describe('createLogger', () => {
  it('emits one JSON record with level and message', () => {
    const lines: string[] = [];
    const log = createLogger({ sink: (line) => lines.push(line) });

    log.info('wage credited', { amount: 5000 });

    expect(lines).toHaveLength(1);
    const record = JSON.parse(lines[0]!);
    expect(record.level).toBe('info');
    expect(record.msg).toBe('wage credited');
    expect(record.amount).toBe(5000);
  });

  it('redacts personal identifiers before they reach the sink', () => {
    const lines: string[] = [];
    const log = createLogger({ sink: (line) => lines.push(line) });
    // Defined separately so the identifier never appears in a log call site.
    const memberFields = { phone: '9990001111', amount: 5000 };

    log.info('wage credited', memberFields);

    const record = JSON.parse(lines[0]!);
    expect(record.phone).toBe('[redacted]');
    expect(record.amount).toBe(5000);
  });

  it('redacts base fields too', () => {
    const lines: string[] = [];
    const base = { aadhaar: '123412341234', service: 'membership' };
    const log = createLogger({ sink: (line) => lines.push(line), base });

    log.warn('something');

    const record = JSON.parse(lines[0]!);
    expect(record.aadhaar).toBe('[redacted]');
    expect(record.service).toBe('membership');
  });
});
