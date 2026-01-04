#!/bin/bash
# SalesPro - Complete Installation Script

echo "🚀 SalesPro Installation"
echo "========================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local..."
    cp .env.example .env.local
    echo "⚠️  Please configure .env.local with your credentials"
fi

# Setup Supabase
echo "🔧 Setting up Supabase..."
npx supabase init
npx supabase start
npx supabase db reset

# Run migrations
echo "📊 Running database migrations..."
npx supabase db push

# Generate types
echo "📘 Generating TypeScript types..."
npx supabase gen types typescript --local > src/integrations/supabase/types.ts

# Build
echo "🏗️  Building application..."
npm run build

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Configure .env.local with your Supabase credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. Run 'npm run test' to run tests"
echo "4. Run 'npm run storybook' to view component library"
