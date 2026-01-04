# Testing Guide

## Unit Tests
\`\`\`bash
npm test
\`\`\`

## E2E Tests
\`\`\`bash
npx playwright test
\`\`\`

## Coverage
\`\`\`bash
npm test -- --coverage
\`\`\`

## Writing Tests
Use Vitest + React Testing Library for unit tests
Use Playwright for E2E tests