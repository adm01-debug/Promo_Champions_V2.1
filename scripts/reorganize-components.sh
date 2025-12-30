#!/bin/bash
# Script: reorganize-components.sh
# Reorganiza estrutura de componentes
# Data: 2024-12-28

echo "🔄 Iniciando reorganização de componentes..."

# Criar nova estrutura
mkdir -p src/components/{features,domain,shared,providers}
mkdir -p src/components/features/{analytics,sales,gamification,goals,teams}
mkdir -p src/components/features/sales/{pipeline,deals,cadences}
mkdir -p src/components/domain/{clients,products,activities,suppliers,leads}
mkdir -p src/components/shared/{ui,layout,forms,data-display,feedback}
mkdir -p src/components/providers/{auth,theme,notifications,gamification}

# Mover componentes de features
echo "📦 Movendo features..."
mv src/components/analytics/* src/components/features/analytics/ 2>/dev/null || true
mv src/components/pipeline/* src/components/features/sales/pipeline/ 2>/dev/null || true
mv src/components/deals/* src/components/features/sales/deals/ 2>/dev/null || true
mv src/components/cadences/* src/components/features/sales/cadences/ 2>/dev/null || true
mv src/components/gamification/* src/components/features/gamification/ 2>/dev/null || true
mv src/components/goals/* src/components/features/goals/ 2>/dev/null || true
mv src/components/teams/* src/components/features/teams/ 2>/dev/null || true

# Mover componentes de domínio
echo "📦 Movendo domínio..."
mv src/components/clients/* src/components/domain/clients/ 2>/dev/null || true
mv src/components/products/* src/components/domain/products/ 2>/dev/null || true
mv src/components/activities/* src/components/domain/activities/ 2>/dev/null || true
mv src/components/suppliers/* src/components/domain/suppliers/ 2>/dev/null || true
mv src/components/leads/* src/components/domain/leads/ 2>/dev/null || true

# Mover componentes compartilhados
echo "📦 Movendo shared..."
mv src/components/ui/* src/components/shared/ui/ 2>/dev/null || true

# Criar index files
echo "📝 Criando index files..."

cat > src/components/features/index.ts << 'EOF'
// Features barrel export
export * from './analytics';
export * from './sales';
export * from './gamification';
export * from './goals';
export * from './teams';
EOF

cat > src/components/domain/index.ts << 'EOF'
// Domain barrel export
export * from './clients';
export * from './products';
export * from './activities';
export * from './suppliers';
export * from './leads';
EOF

cat > src/components/shared/index.ts << 'EOF'
// Shared barrel export
export * from './ui';
export * from './layout';
export * from './forms';
export * from './data-display';
export * from './feedback';
EOF

echo "✅ Reorganização completa!"
echo "📊 Nova estrutura:"
tree src/components -L 2 -d

# Atualizar imports (basic find/replace)
echo "🔄 Atualizando imports..."
find src -type f -name "*.tsx" -o -name "*.ts" | while read file; do
  sed -i 's|@/components/analytics|@/components/features/analytics|g' "$file"
  sed -i 's|@/components/pipeline|@/components/features/sales/pipeline|g' "$file"
  sed -i 's|@/components/clients|@/components/domain/clients|g' "$file"
done

echo "✅ Imports atualizados!"
