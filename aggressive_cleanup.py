#!/usr/bin/env python3
"""
Comprehensive TypeScript removal - aggressive pattern matching
"""

import re
from pathlib import Path

def aggressive_cleanup(file_path):
    """Aggressively remove all TypeScript patterns"""
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # 1. Remove 'as const' type assertions
    content = re.sub(r'\s+as\s+const\b', '', content)
    
    # 2. Remove 'as any', 'as unknown', etc.
    content = re.sub(r'\s+as\s+\w+', '', content)
    
    # 3. Remove destructured parameter type annotations
    # Handles: }: TypeName) -> })
    # Handles: }: { prop: Type } ) -> })
    # Handles: }: Type & OtherType ) -> })
    content = re.sub(r'\}\s*:\s*(?:[A-Za-z_][A-Za-z0-9_<>,\s|&]*|React\.ComponentProps<[^>]*>)\s*(?=[,)])', '}', content)
    
    # 4. Remove generic type parameters after destructuring
    # Handles: }: FloatingOrbProps) -> })
    content = re.sub(r'\}\s*:\s*([A-Z][A-Za-z0-9_]*)\s*\)', r'})', content)
    
    # 5. Remove Readonly< >
    content = re.sub(r'Readonly\s*<\s*\{[^}]*\}\s*>', '', content)
    
    # 6. Remove React.ComponentProps< >
    content = re.sub(r'React\.ComponentProps\s*<[^>]*>\s*(&|\|)?', '', content)
    
    # 7. Remove VariantProps< >
    content = re.sub(r'VariantProps\s*<[^>]*>\s*(&|\|)?', '', content)
    
    # 8. Remove trailing & operators left by above
    content = re.sub(r'\s*&\s*\)', ')', content)
    content = re.sub(r'\s*\|\s*\)', ')', content)
    content = re.sub(r'&\s*\{', '{', content)
    
    # 9. Clean up remaining type annotations on new lines
    # }: {
    #   prop: Type
    # }) pattern
    lines = content.split('\n')
    result = []
    skip_until_paren = False
    
    for line in lines:
        if skip_until_paren:
            if ')' in line:
                skip_until_paren = False
                line = line.split(')')[0].rstrip() + ')'
            else:
                continue
        
        if re.search(r'}\s*:\s*\{[^}]*$', line):
            skip_until_paren = True
            line = line.split(':')[0] + ')'
        
        result.append(line)
    
    content = '\n'.join(result)
    
    return content

def main():
    root = Path('.')
    files = list(root.rglob('*.js')) + list(root.rglob('*.jsx'))
    
    # Filter to main source files
    files = [
        f for f in files 
        if not any(x in str(f) for x in ['node_modules', '.next', '.git'])
    ]
    
    print(f"Aggressive cleanup on {len(files)} files...\n")
    
    fixed_count = 0
    for file_path in files:
        try:
            original = open(file_path, 'r', encoding='utf-8', errors='ignore').read()
            cleaned = aggressive_cleanup(str(file_path))
            
            if cleaned != original:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(cleaned)
                fixed_count += 1
                print(f"✓ Fixed {file_path.name}")
        except Exception as e:
            print(f"✗ Error in {file_path.name}: {e}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
