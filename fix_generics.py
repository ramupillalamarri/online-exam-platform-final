#!/usr/bin/env python3
"""
Fix multi-line generic type definitions
"""

import re
from pathlib import Path

def fix_multiline_generics(content):
    """Remove multi-line generic type parameters"""
    
    # Pattern 1: useState<Array<{ ... }>>([])
    # Find lines with useState/create/etc followed by <
    # Then skip everything until the matching >([
    
    lines = content.split('\n')
    result = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check if line has generic opening
        if re.search(r'(useState|create|useMemo|useCallback|useReducer)\s*<', line):
            # Extract the part before the <
            match = re.search(r'(.*?)(useState|create|useMemo|useCallback|useReducer)\s*<', line)
            if match:
                prefix = match.group(1)
                func_name = match.group(2)
                
                # Extract what comes after the <
                after_bracket = line.split('<', 1)[1]
                
                # Count angle brackets to find closing >
                bracket_count = 1
                rest_of_line = after_bracket
                current_i = i
                
                while bracket_count > 0 and current_i < len(lines):
                    for char in rest_of_line:
                        if char == '<':
                            bracket_count += 1
                        elif char == '>':
                            bracket_count -= 1
                            if bracket_count == 0:
                                # Found the closing >
                                # Get what comes after >
                                idx = rest_of_line.index('>')
                                after_close = rest_of_line[idx+1:]
                                result.append(prefix + func_name + '(' + after_close)
                                i = current_i + 1
                                break
                    
                    if bracket_count > 0:
                        current_i += 1
                        if current_i < len(lines):
                            rest_of_line = lines[current_i]
                        else:
                            break
                
                if bracket_count == 0:
                    continue
        
        result.append(line)
        i += 1
    
    return '\n'.join(result)

def fix_inline_generics(content):
    """Fix inline generic types like React.ComponentProps<'div'>"""
    
    # Remove generic parameters from function calls
    content = re.sub(r'useState\s*<[^>]+>\s*\(', 'useState(', content)
    content = re.sub(r'create\s*<[^>]+>\s*\(', 'create(', content)
    content = re.sub(r'useMemo\s*<[^>]+>\s*\(', 'useMemo(', content)
    content = re.sub(r'useCallback\s*<[^>]+>\s*\(', 'useCallback(', content)
    content = re.sub(r'useReducer\s*<[^>]+>\s*\(', 'useReducer(', content)
    
    return content

def main():
    root = Path('.')
    files = list(root.rglob('*.js')) + list(root.rglob('*.jsx'))
    
    files = [
        f for f in files 
        if not any(x in str(f) for x in ['node_modules', '.next', '.git'])
    ]
    
    print(f"Fixing multi-line generics in {len(files)} files...\n")
    
    fixed_count = 0
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            original = content
            
            # Try both approaches
            content = fix_multiline_generics(content)
            content = fix_inline_generics(content)
            
            if content != original:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed_count += 1
                print(f"✓ Fixed {file_path.name}")
        except Exception as e:
            print(f"✗ Error in {file_path.name}: {e}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
