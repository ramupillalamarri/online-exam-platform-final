#!/usr/bin/env python3
"""Fix broken import statements"""

import re
from pathlib import Path

def fix_imports(file_path):
    """Fix import * from statements"""
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    original = content
    
    # Fix: import * from 'react' -> import * as React from 'react'
    content = re.sub(
        r"import \* from ['\"](react)['\"]",
        r"import * as React from '\1'",
        content
    )
    
    # Fix: import * from '@radix-ui/react-...' -> import * as RadixUI from '@radix-ui/react-...'
    # But be careful - we need the exact module name
    content = re.sub(
        r"import \* from ['\"]([@\w/\-]*@radix-ui/react-[^'\"]+)['\"]",
        lambda m: f"import * as Radix{m.group(1).split('-')[-1].title()} from '{m.group(1)}'",
        content
    )
    
    # Fix: import * from 'recharts' -> import * as Recharts from 'recharts'
    content = re.sub(
        r"import \* from ['\"](recharts)['\"]",
        r"import * as Recharts from '\1'",
        content
    )
    
    return content if content != original else None

def main():
    # Find all files with broken imports
    root = Path('.')
    files = list(root.rglob('*.jsx')) + list(root.rglob('*.js'))
    
    files = [
        f for f in files 
        if not any(x in str(f) for x in ['node_modules', '.next', '.git'])
    ]
    
    print(f"Fixing imports in {len(files)} files...\n")
    
    fixed_count = 0
    for file_path in files:
        try:
            result = fix_imports(file_path)
            if result:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(result)
                fixed_count += 1
                if fixed_count <= 20:  # Print first 20
                    print(f"✓ Fixed {file_path.name}")
        except Exception as e:
            print(f"✗ Error in {file_path.name}: {e}")
    
    print(f"\nTotal fixed: {fixed_count} files")

if __name__ == '__main__':
    main()
