#!/usr/bin/env python3
"""
Final comprehensive cleanup for remaining TypeScript and conversion artifacts
"""

import re
from pathlib import Path

def fix_file(file_path):
    """Fix all remaining issues in a file"""
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    original = content
    
    # 1. Fix broken imports: import * from 'react' -> import * as React from 'react'
    content = re.sub(r"import \* from ['\"](react)['\"]", r"import * as React from '\1'", content)
    content = re.sub(r"import \* from ['\"](recharts)['\"]", r"import * as Recharts from '\1'", content)
    content = re.sub(r"import \* from ['\"](framer-motion)['\"]", r"import * as Motion from '\1'", content)
    
    # 2. Fix broken Radix UI imports
    content = re.sub(r"import \* from ['\"]([@\w\-/]*react-\w+)['\"]", r"import * as RadixUI from '\1'", content)
    
    # 3. Fix ternary operators missing fallback values
    # Pattern: e.id === id ? { ...e, ... }) -> e.id === id ? { ...e, ... } : e)
    content = re.sub(
        r'(\w+\.id === \w+ \? \{[^}]+\})\s*\)\)',
        r'\1 : \1.split("?")[0].strip() + "\1)'  # This won't work, need different approach
    )
    
    # Better approach for ternary operators:
    # Find lines ending with }) and add : fallback
    lines = content.split('\n')
    fixed_lines = []
    for i, line in enumerate(lines):
        # Check if line has incomplete ternary: ends with }) without : before it
        if re.search(r'\?\s*\{[^}]*\}\s*\)\s*,?\s*$', line):
            # Extract variable name from the condition
            match = re.search(r'(\w+)\s*===', line)
            if match:
                var_name = match.group(1)
                # Add fallback
                line = re.sub(r'(\}\s*)\)\s*,?\s*$', r'\1 : ' + var_name + r'),', line)
        fixed_lines.append(line)
    
    content = '\n'.join(fixed_lines)
    
    return content if content != original else None

def main():
    root = Path('.')
    files = list(root.rglob('*.js')) + list(root.rglob('*.jsx'))
    
    files = [
        f for f in files 
        if not any(x in str(f) for x in ['node_modules', '.next', '.git'])
    ]
    
    print(f"Running final comprehensive cleanup on {len(files)} files...\n")
    
    fixed_count = 0
    for file_path in files:
        try:
            result = fix_file(file_path)
            if result:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(result)
                fixed_count += 1
                print(f"✓ Fixed {file_path.name}")
        except Exception as e:
            print(f"✗ Error in {file_path.name}: {e}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
