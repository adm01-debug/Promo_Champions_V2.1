export interface MockDetectionResult {
  file: string;
  line: number;
  type: 'hardcoded-array' | 'fake-data' | 'placeholder' | 'mock-function';
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export const mockPatterns = {
  hardcodedArrays: /const\s+\w+\s*=\s*\[[\s\S]*?\];/g,
  loremIpsum: /lorem|ipsum|dolor|sit\s+amet/gi,
  placeholder: /placeholder|example|demo|test/gi,
  fakeEmails: /@example\.com|@test\.com/gi,
  mockFunctions: /mock\w+|fake\w+/gi,
};

export function detectMocks(code: string): MockDetectionResult[] {
  const results: MockDetectionResult[] = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    if (mockPatterns.hardcodedArrays.test(line)) {
      results.push({
        file: 'unknown',
        line: index + 1,
        type: 'hardcoded-array',
        severity: 'high',
        suggestion: 'Replace with API call or database query',
      });
    }

    if (mockPatterns.loremIpsum.test(line)) {
      results.push({
        file: 'unknown',
        line: index + 1,
        type: 'placeholder',
        severity: 'medium',
        suggestion: 'Replace with real content',
      });
    }

    if (mockPatterns.fakeEmails.test(line)) {
      results.push({
        file: 'unknown',
        line: index + 1,
        type: 'fake-data',
        severity: 'high',
        suggestion: 'Use real email addresses from database',
      });
    }
  });

  return results;
}
