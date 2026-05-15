/**
 * Fuzzing Utility for Enterprise Grade Validation
 * Simulates thousands of edge-case inputs for fields, webhooks, and uploads.
 */

export const generateFuzzData = (type: 'string' | 'number' | 'object' | 'email') => {
  switch (type) {
    case 'string':
      return [
        '', // Empty
        ' '.repeat(1000), // Large whitespace
        'null', 'undefined', 'NaN', // Keywords
        '<script>alert("xss")</script>', // XSS
        "'; DROP TABLE users; --", // SQLi
        '👋🌍🚀', // Emojis/Unicode
        'A'.repeat(10000), // Extremely long string
        '\x00\x01\x02', // Control characters
      ];
    case 'number':
      return [
        0, -1, 0.0000000001, 1e20, -1e20,
        NaN, Infinity, -Infinity,
        MAX_SAFE_INTEGER_FUZZ, MIN_SAFE_INTEGER_FUZZ
      ];
    case 'email':
      return [
        'plainaddress', '#@%^%#$@#$@#.com', '@example.com', 'Joe Smith <email@example.com>',
        'email.example.com', 'email@example@example.com', '.email@example.com',
        'email.@example.com', 'email..email@example.com', 'あいうえお@example.com'
      ];
    case 'object':
      return [
        {}, [], null, { a: { b: { c: { d: { e: 1 } } } } }, // Deep nesting
        { constructor: { prototype: { polluted: true } } }, // Prototype pollution
      ];
    default:
      return [];
  }
};

const MAX_SAFE_INTEGER_FUZZ = 9007199254740991;
const MIN_SAFE_INTEGER_FUZZ = -9007199254740991;

export const runFuzzTest = async <T>(fn: (input: any) => Promise<T> | T, type: 'string' | 'number' | 'object' | 'email') => {
  const inputs = generateFuzzData(type);
  const results = [];

  for (const input of inputs) {
    try {
      await fn(input);
      results.push({ input, status: 'passed' });
    } catch (error) {
      results.push({ input, status: 'failed', error: error instanceof Error ? error.message : String(error) });
    }
  }

  return results;
};
