/// Redaction of Member personal identifiers before anything is logged.
///
/// Book V §5.2: "a log line that contains a personal identifier without
/// redaction is a log line that fails the lint." This is the runtime companion
/// to the static `no-pii-in-logs` gate — defense in depth.

/** Keys whose values are treated as personal identifiers and masked. */
export const DEFAULT_PII_KEYS: readonly string[] = [
  'phone',
  'aadhaar',
  'aadhar',
  'otp',
  'dob',
  'date_of_birth',
  'home_address',
  'address',
  'biometric',
  'recipient_phone',
  'email',
];

export const REDACTED = '[redacted]';

export interface RedactOptions {
  /** Override the default set of personal-identifier keys. */
  readonly keys?: readonly string[];
}

/**
 * Deep-redacts values whose key matches a personal-identifier key
 * (case-insensitive). Structure is preserved; only matched leaf values become
 * [redacted].
 */
export function redactPii<T>(value: T, options: RedactOptions = {}): T {
  const keys = new Set(
    (options.keys ?? DEFAULT_PII_KEYS).map((k) => k.toLowerCase()),
  );
  return redactValue(value, keys) as T;
}

function redactValue(value: unknown, keys: Set<string>): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => redactValue(v, keys));
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = keys.has(k.toLowerCase()) ? REDACTED : redactValue(v, keys);
    }
    return out;
  }
  return value;
}
