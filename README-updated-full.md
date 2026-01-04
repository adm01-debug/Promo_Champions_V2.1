# SalesPro - CRM & Sales Platform

Complete sales management platform with CRM, pipeline, analytics, and AI features.

## 🚀 Features

### Core CRM
- Client management
- Contact history
- Custom fields
- Segmentation

### Sales Pipeline
- Visual pipeline
- Drag & drop
- Custom stages
- Probability tracking

### Analytics
- Revenue reports
- Conversion metrics
- Sales forecast
- Team performance

### AI & Automation
- Lead scoring
- Next best action
- Churn prediction
- Voice assistant

## 🛠️ Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Query
- Shadcn/ui

## 📦 Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npx supabase db push

# Start dev server
npm run dev
```

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Contributing](./CONTRIBUTING.md)

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npx playwright test

# Coverage
npm test -- --coverage
```

## 🚀 Deployment

```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod
```

## 📄 License

MIT
