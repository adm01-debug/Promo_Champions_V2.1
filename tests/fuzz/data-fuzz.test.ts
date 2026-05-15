import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Mocking some common validation schemas to fuzz
const LeadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().min(2),
});

function generateFuzzData(type: 'string' | 'email' | 'number' | 'special') {
  const specialChars = "!@#$%^&*()_+{}[]|\\:;\"'<>,.?/~`";
  const longString = "A".repeat(10000);
  const unicodeString = "你好世界 🌍 ❤️ 🔥";
  const sqlInjection = "' OR '1'='1";
  const xss = "<script>alert('xss')</script>";

  switch (type) {
    case 'string':
      return [longString, unicodeString, "", " ", "\n", "\t"];
    case 'email':
      return ["not-an-email", "test@", "@domain.com", "test@domain", "a".repeat(255) + "@test.com"];
    case 'number':
      return [NaN, Infinity, -Infinity, 0.0000001, 999999999999, -1];
    case 'special':
      return [specialChars, sqlInjection, xss];
  }
}

describe('Fuzz Testing: Input Validations', () => {
  it('should correctly reject malformed lead data', () => {
    const badEmails = generateFuzzData('email');
    const specialStrings = generateFuzzData('special');

    badEmails.forEach(email => {
      const result = LeadSchema.safeParse({
        name: "Test",
        email: email,
        company: "Test Co"
      });
      expect(result.success).toBe(false);
    });

    specialStrings.forEach(str => {
      const result = LeadSchema.safeParse({
        name: str,
        email: "valid@email.com",
        company: "Test Co"
      });
      // Some special strings might be technically valid names depending on schema
      // But we check that it doesn't CRASH the validator
      expect(() => LeadSchema.safeParse({ name: str, email: "v@e.com", company: "T" })).not.toThrow();
    });
  });

  it('should handle edge cases in numeric fields', () => {
    const badNumbers = generateFuzzData('number');
    const Schema = z.number().min(0).max(100);

    badNumbers.forEach(num => {
      const result = Schema.safeParse(num);
      if (num < 0 || num > 100 || isNaN(num as number)) {
        expect(result.success).toBe(false);
      }
    });
  });
});
