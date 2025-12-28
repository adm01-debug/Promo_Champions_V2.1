#!/usr/bin/env python3
"""
Script: remove-console-logs.py
Remove console.logs e substitui por Logger em desenvolvimento
Data: 2024-12-28
"""

import re
import sys
from pathlib import Path
from typing import Tuple

def process_file(filepath: Path) -> Tuple[int, int]:
    """Processa arquivo removendo console.logs"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        removed = 0
        converted = 0
        
        # Padrão 1: console.log simples
        simple_pattern = r'^\s*console\.log\([^)]*\);\s*$'
        content, count = re.subn(simple_pattern, '', content, flags=re.MULTILINE)
        removed += count
        
        # Padrão 2: console.log comentado
        commented_pattern = r'^\s*//\s*console\.log\([^)]*\).*$'
        content, count = re.subn(commented_pattern, '', content, flags=re.MULTILINE)
        removed += count
        
        # Padrão 3: Converter para Logger em DEV
        dev_pattern = r'console\.(log|info|warn|error)\('
        def replace_with_logger(match):
            nonlocal converted
            converted += 1
            level = match.group(1)
            if level == 'log':
                level = 'debug'
            return f'if (import.meta.env.DEV) Logger.{level}('
        
        content = re.sub(dev_pattern, replace_with_logger, content)
        
        # Salvar se mudou
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✅ {filepath.name}: {removed} removidos, {converted} convertidos')
        
        return removed, converted
    
    except Exception as e:
        print(f'❌ Erro em {filepath.name}: {e}')
        return 0, 0

def main():
    if len(sys.argv) < 2:
        print('Uso: python remove-console-logs.py <dir>')
        print('Exemplo: python remove-console-logs.py src/')
        sys.exit(1)
    
    search_dir = Path(sys.argv[1])
    
    if not search_dir.exists():
        print(f'❌ Diretório não existe: {search_dir}')
        sys.exit(1)
    
    total_removed = 0
    total_converted = 0
    total_files = 0
    
    # Processar todos os arquivos .ts e .tsx
    for filepath in search_dir.rglob('*.ts*'):
        if 'node_modules' in str(filepath):
            continue
        
        removed, converted = process_file(filepath)
        total_removed += removed
        total_converted += converted
        if removed > 0 or converted > 0:
            total_files += 1
    
    print('\n' + '='*60)
    print(f'✅ Arquivos processados: {total_files}')
    print(f'✅ Console.logs removidos: {total_removed}')
    print(f'✅ Console.logs convertidos para Logger: {total_converted}')
    print('='*60)

if __name__ == '__main__':
    main()
