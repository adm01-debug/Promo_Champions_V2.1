#!/usr/bin/env python3
"""
Script: add-aria-labels.py
Adiciona ARIA labels em componentes
Data: 2024-12-28
"""

import re
from pathlib import Path
import sys

PATTERNS = {
    # Botões sem texto
    'button_icon': (
        r'<Button([^>]*?)>\s*<([A-Z][a-zA-Z]+)\s',
        r'<Button\1 aria-label="ACTION_HERE">\n      <\2 ',
    ),
    
    # Inputs sem label
    'input_no_label': (
        r'<Input\s+(?![^>]*aria-label)(?![^>]*id=)([^>]*?)/>',
        r'<Input aria-label="INPUT_LABEL" \1/>',
    ),
    
    # Cards de stats
    'stat_card': (
        r'<Card([^>]*?)>\s*<CardHeader>',
        r'<Card\1 role="region" aria-label="Estatística">\n  <CardHeader>',
    ),
    
    # Gráficos
    'chart': (
        r'<(LineChart|BarChart|PieChart)([^>]*?)>',
        r'<\1\2 role="img" aria-label="Gráfico de dados">',
    ),
    
    # Modals
    'dialog': (
        r'<Dialog([^>]*?)>',
        r'<Dialog\1 aria-describedby="dialog-description">',
    ),
    
    # Menus dropdown
    'dropdown': (
        r'<DropdownMenuTrigger([^>]*?)>\s*<([A-Z][a-zA-Z]+)',
        r'<DropdownMenuTrigger\1 aria-label="Abrir menu">\n      <\2',
    ),
}

def add_aria_labels(filepath: Path) -> int:
    """Adiciona ARIA labels em arquivo"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        changes = 0
        
        for pattern_name, (search, replace) in PATTERNS.items():
            content, count = re.subn(search, replace, content)
            changes += count
        
        if changes > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✅ {filepath.name}: {changes} ARIA labels adicionados')
        
        return changes
    
    except Exception as e:
        print(f'❌ {filepath.name}: {e}')
        return 0

def main():
    if len(sys.argv) < 2:
        print('Uso: python add-aria-labels.py <dir>')
        sys.exit(1)
    
    search_dir = Path(sys.argv[1])
    total_changes = 0
    total_files = 0
    
    for filepath in search_dir.rglob('*.tsx'):
        if 'node_modules' in str(filepath):
            continue
        
        changes = add_aria_labels(filepath)
        if changes > 0:
            total_changes += changes
            total_files += 1
    
    print('\n' + '='*60)
    print(f'✅ Arquivos processados: {total_files}')
    print(f'✅ ARIA labels adicionados: {total_changes}')
    print('='*60)
    print('\n⚠️  AÇÃO NECESSÁRIA:')
    print('Substitua ACTION_HERE e INPUT_LABEL pelos textos adequados!')

if __name__ == '__main__':
    main()
