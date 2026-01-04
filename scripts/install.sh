#!/bin/bash
# Complete installation script

set -e

echo "🚀 Installing SalesPro..."

# Install dependencies
echo "📦 Installing npm packages..."
npm install

# Setup environment
if [ ! -f .env ]; then
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update .env with your credentials"
fi

# Setup database
echo "🗄️ Setting up database..."
npx supabase db push

# Build
echo "🔨 Building project..."
npm run build

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your credentials"
echo "2. Run: npm run dev"
