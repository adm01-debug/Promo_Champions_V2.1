#!/bin/bash
# Instalação Automatizada - Implementações Reais SalesPro

PROJECT_DIR="${1:-.}"

echo "🚀 INSTALANDO IMPLEMENTAÇÕES REAIS SALESPRO"
echo "============================================"
echo ""

# 1. TypeScript
echo "1️⃣ Instalando TypeScript Strict..."
cp 001-tsconfig-strict.json "$PROJECT_DIR/tsconfig.json"

# 2. Hooks
echo "2️⃣ Instalando Hooks Refatorados..."
mkdir -p "$PROJECT_DIR/src/hooks"
for f in 0*-use*.ts 0*-hook*.ts; do
  [ -f "$f" ] && cp "$f" "$PROJECT_DIR/src/hooks/"
done

# 3. Componentes
echo "3️⃣ Instalando Componentes..."
mkdir -p "$PROJECT_DIR/src/components"/{analytics,gamification,dashboard,shared}

cp *-ABCAnalysis.tsx "$PROJECT_DIR/src/components/analytics/" 2>/dev/null
cp *-Sales*.tsx "$PROJECT_DIR/src/components/analytics/" 2>/dev/null
cp *-Analytics.tsx "$PROJECT_DIR/src/components/analytics/" 2>/dev/null
cp *-Gamification*.tsx "$PROJECT_DIR/src/components/gamification/" 2>/dev/null
cp *-Dashboard*.tsx "$PROJECT_DIR/src/components/dashboard/" 2>/dev/null
cp *-EmptyState*.tsx "$PROJECT_DIR/src/components/shared/" 2>/dev/null

# 4. Performance
echo "4️⃣ Instalando Virtual Scrolling..."
cp 130-virtual-scrolling-complete.tsx "$PROJECT_DIR/src/components/performance/VirtualScrolling.tsx" 2>/dev/null

# 5. Migrations
echo "5️⃣ Instalando Migrations SQL..."
mkdir -p "$PROJECT_DIR/supabase/migrations"
timestamp=$(date +%Y%m%d%H%M%S)
cp 131-2fa-migration-complete.sql "$PROJECT_DIR/supabase/migrations/${timestamp}_2fa_system.sql" 2>/dev/null
sleep 1
timestamp=$(date +%Y%m%d%H%M%S)
cp 132-audit-trail-migration-complete.sql "$PROJECT_DIR/supabase/migrations/${timestamp}_audit_trail.sql" 2>/dev/null

echo ""
echo "✅ INSTALAÇÃO CONCLUÍDA!"
echo ""
echo "📋 Próximos passos:"
echo "  1. cd $PROJECT_DIR"
echo "  2. npm install"
echo "  3. npx tsc --noEmit"
echo "  4. supabase db push"
echo "  5. npm test"
echo ""
