# Contributing to SalesPro

## Code of Conduct
Be respectful, inclusive, and collaborative.

## How to Contribute

### Reporting Bugs
- Use GitHub Issues
- Include steps to reproduce
- Provide screenshots if applicable

### Suggesting Features
- Open a Feature Request issue
- Explain the use case
- Provide examples

### Pull Requests

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/salespro.git
   cd salespro
   npm install
   ```

2. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Code Standards**
   - TypeScript strict mode
   - ESLint passing
   - Tests for new features
   - 80%+ code coverage

4. **Commit Convention**
   ```
   feat: add new feature
   fix: resolve bug
   docs: update documentation
   test: add tests
   chore: update dependencies
   ```

5. **Submit PR**
   - Link related issues
   - Add screenshots/videos
   - Ensure CI passes

## Development Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test
npm run test:e2e

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## Project Structure

```
src/
├── components/    # React components
├── hooks/         # Custom hooks
├── pages/         # Route pages
├── lib/           # Utilities
├── integrations/  # Supabase/APIs
└── test/          # Test utilities
```

## Questions?
Open a Discussion on GitHub or reach out to maintainers.
