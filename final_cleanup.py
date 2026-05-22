#!/usr/bin/env python3
"""
Final TypeScript cleanup - fix remaining patterns that cause parse errors
"""

import os
import re
from pathlib import Path

def final_cleanup(file_path):
    """Apply final passes to fix all remaining TypeScript syntax"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    result = []
    
    for line in lines:
        # Skip entire lines that are TypeScript-only
        if re.match(r'\s*(export\s+)?(interface|type)\s+', line) and '{' in line:
            continue
        
        # Fix: destructured params with Readonly type
        # }: Readonly<{ ... }>) -> })
        line = re.sub(r'\}\s*:\s*Readonly\s*<\s*\{[^}]*\}\s*>\s*\)', '})', line)
        
        # Fix: destructured params with type (generic):
        # }: { target: number; suffix?: string }) -> })
        line = re.sub(r'\}\s*:\s*\{\s*[^}]*\}\s*\)', '})', line)
        
        # Fix: default parameter with type annotation
        # { target, suffix = "" }: { target: number; suffix?: string } =>
        # Becomes: { target, suffix = "" } =>
        line = re.sub(
            r'(\{[^}]*\})\s*:\s*\{\s*[^}]*\s*\}\s*(=>|{)',
            r'\1 \2',
            line
        )
        
        # Fix: React.ReactNode type reference
        line = line.replace('React.ReactNode', '')
        
        # Fix: any type declarations in JSDoc-like comments
        line = re.sub(r':\s*(any|unknown|void)\s*([,;)])', r'\2', line)
        
        result.append(line)
    
    # Second pass - fix edge cases
    result_str = '\n'.join(result)
    
    # Remove empty parameter type annotations
    result_str = re.sub(r'\{([^}]*)\}\s*:\s*\{\s*\}\s*\)', r'{\1})', result_str)
    
    # Remove trailing type annotation colons
    result_str = re.sub(r'}\s*:\s+$', '}', result_str, flags=re.MULTILINE)
    
    return result_str

def main():
    """Process all JS/JSX files"""
    
    root = Path('.')
    files_to_process = list(root.rglob('*.js')) + list(root.rglob('*.jsx'))
    
    # Filter to main source files only
    files_to_process = [
        f for f in files_to_process 
        if not any(x in str(f) for x in ['node_modules', '.next', '.git'])
    ]
    
    print(f"Processing {len(files_to_process)} files...")
    
    fixed_count = 0
    for file_path in files_to_process:
        try:
            original = open(file_path, 'r', encoding='utf-8').read()
            cleaned = final_cleanup(str(file_path))
            
            if cleaned != original:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(cleaned)
                fixed_count += 1
                print(f"✓ Fixed {file_path.name}")
        except Exception as e:
            print(f"✗ Error in {file_path}: {e}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
