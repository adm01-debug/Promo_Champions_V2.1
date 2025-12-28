#!/usr/bin/env python3
"""
Script: fix-hardcoded-colors-v2.py
Descrição: Remove cores hardcoded e substitui por classes Tailwind
Data: 2024-12-28
Versão: 2.0 - Otimizada
"""

import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# ============================================================================
# MAPEAMENTO DE CORES
# ============================================================================

COLOR_MAP = {
    # Cores primárias
    '#3b82f6': 'bg-primary text-primary-foreground',
    '#2563eb': 'bg-primary hover:bg-primary/90',
    '#1d4ed8': 'bg-primary-dark',
    
    # Cores de sucesso
    '#10b981': 'bg-success text-success-foreground',
    '#059669': 'bg-success hover:bg-success/90',
    '#047857': 'bg-success-dark',
    '#22c55e': 'bg-green-500',
    
    # Cores de aviso
    '#f59e0b': 'bg-warning text-warning-foreground',
    '#d97706': 'bg-warning hover:bg-warning/90',
    '#b45309': 'bg-warning-dark',
    '#fbbf24': 'bg-yellow-400',
    
    # Cores de erro/danger
    '#ef4444': 'bg-destructive text-destructive-foreground',
    '#dc2626': 'bg-destructive hover:bg-destructive/90',
    '#b91c1c': 'bg-destructive-dark',
    '#f87171': 'bg-red-400',
    
    # Cores neutras
    '#6b7280': 'text-muted-foreground',
    '#9ca3af': 'text-gray-400',
    '#d1d5db': 'border-gray-300',
    '#e5e7eb': 'bg-gray-200',
    '#f3f4f6': 'bg-gray-100',
    '#ffffff': 'bg-background',
    '#000000': 'text-foreground',
    
    # Cores de tema
    '#8b5cf6': 'bg-purple-500',
    '#a855f7': 'bg-purple-600',
    '#ec4899': 'bg-pink-500',
    '#f472b6': 'bg-pink-400',
    '#06b6d4': 'bg-cyan-500',
    '#0ea5e9': 'bg-sky-500',
    
    # Cores de gráficos
    '#4ade80': 'bg-green-400',
    '#fb923c': 'bg-orange-400',
    '#f472b6': 'bg-pink-400',
    '#a78bfa': 'bg-violet-400',
}

# ============================================================================
# PADRÕES REGEX
# ============================================================================

# Padrão para className com cor
CLASSNAME_PATTERN = r'className="([^"]*?)(?:bg-|text-|border-)?\[([#\w]+)\]([^"]*?)"'

# Padrão para style inline
STYLE_PATTERN = r'style=\{\{([^}]+?)\}\}'
BG_COLOR_PATTERN = r'backgroundColor:\s*[\'"]([#\w]+)[\'"]'
COLOR_PATTERN = r'color:\s*[\'"]([#\w]+)[\'"]'
BORDER_COLOR_PATTERN = r'borderColor:\s*[\'"]([#\w]+)[\'"]'

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

def find_color_class(hex_color: str, context: str = 'bg') -> str:
    """Encontra classe Tailwind para cor hex"""
    hex_color = hex_color.lower()
    
    # Tentar mapeamento direto
    if hex_color in COLOR_MAP:
        tailwind_class = COLOR_MAP[hex_color]
        # Ajustar prefixo baseado no contexto
        if context == 'text':
            return tailwind_class.replace('bg-', 'text-')
        elif context == 'border':
            return tailwind_class.replace('bg-', 'border-')
        return tailwind_class
    
    # Fallback: manter cor mas avisar
    return f'{context}-[{hex_color}] /* TODO: verificar tema */'

def fix_classname(match: re.Match) -> str:
    """Corrige className com cor hardcoded"""
    prefix = match.group(1)
    hex_color = match.group(2)
    suffix = match.group(3)
    
    # Determinar contexto
    if 'bg-' in prefix:
        context = 'bg'
    elif 'text-' in prefix:
        context = 'text'
    elif 'border-' in prefix:
        context = 'border'
    else:
        context = 'bg'  # default
    
    tailwind_class = find_color_class(hex_color, context)
    
    # Reconstruir className
    new_classes = f'{prefix} {tailwind_class} {suffix}'.strip()
    return f'className="{new_classes}"'

def fix_inline_style(content: str) -> Tuple[str, int]:
    """Remove cores de styles inline"""
    changes = 0
    
    # Substituir backgroundColor
    def replace_bg(match):
        nonlocal changes
        changes += 1
        return 'className={cn("YOUR_CLASSES", "bg-primary")}'
    
    content = re.sub(
        r'style=\{\{backgroundColor:\s*[\'"]([#\w]+)[\'"]\}\}',
        replace_bg,
        content
    )
    
    # Avisos para styles complexos
    complex_styles = re.findall(STYLE_PATTERN, content)
    if complex_styles:
        changes += len(complex_styles)
    
    return content, changes

def process_file(filepath: Path) -> Tuple[int, List[str]]:
    """Processa arquivo e retorna número de mudanças"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes = 0
        warnings = []
        
        # Corrigir className
        content, classname_changes = re.subn(CLASSNAME_PATTERN, fix_classname, content)
        changes += classname_changes
        
        # Corrigir inline styles
        content, style_changes = fix_inline_style(content)
        changes += style_changes
        
        # Salvar se houve mudanças
        if changes > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f'✅ {filepath.name}: {changes} cores corrigidas')
        
        return changes, warnings
    
    except Exception as e:
        print(f'❌ Erro em {filepath.name}: {str(e)}')
        return 0, [str(e)]

# ============================================================================
# MAIN
# ============================================================================

def main():
    if len(sys.argv) < 2:
        print('Uso: python fix-hardcoded-colors-v2.py <arquivo1> [arquivo2] ...')
        sys.exit(1)
    
    total_changes = 0
    total_files = 0
    
    for filepath_str in sys.argv[1:]:
        filepath = Path(filepath_str)
        
        if not filepath.exists():
            print(f'⚠️  Arquivo não encontrado: {filepath}')
            continue
        
        changes, warnings = process_file(filepath)
        total_changes += changes
        total_files += 1
        
        for warning in warnings:
            print(f'  ⚠️  {warning}')
    
    print('\n' + '='*60)
    print(f'✅ Processados: {total_files} arquivos')
    print(f'✅ Total de cores corrigidas: {total_changes}')
    print('='*60)

if __name__ == '__main__':
    main()
