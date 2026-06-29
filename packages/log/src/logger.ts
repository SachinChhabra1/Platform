/// Structured logger for Nia backend services.
///
/// Emits one JSON object per line, with Member personal identifiers redacted
/// before they reach the sink (see redact.ts; Book V §5.2). Boring by design
/// (Book V §1.8): no transports, no global state, an injectable sink.

import { redactPii } from './redact.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  /** Where serialized lines go. Defaults to stdout. */
  readonly sink?: (line: string) => void;
  /** Fields merged into every record (also redacted). */
  readonly base?: Record<string, unknown>;
}

export interface Logger {
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const sink =
    options.sink ??
    ((line: string) => {
      process.stdout.write(`${line}\n`);
    });
  const base = options.base ?? {};

  function emit(
    level: LogLevel,
    message: string,
    fields?: Record<string, unknown>,
  ): void {
    const record = { level, msg: message, ...base, ...(fields ?? {}) };
    sink(JSON.stringify(redactPii(record)));
  }

  return {
    debug: (m, f) => emit('debug', m, f),
    info: (m, f) => emit('info', m, f),
    warn: (m, f) => emit('warn', m, f),
    error: (m, f) => emit('error', m, f),
  };
}
