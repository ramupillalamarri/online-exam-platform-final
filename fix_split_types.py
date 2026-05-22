#!/usr/bin/env python3
"""Fix split-line type annotations"""

import re
from pathlib import Path

def fix_split_types(file_path):
    """Remove split-line type annotations"""
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    result = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check if line ends with }: 
        if re.search(r'}\s*:\s*$', line):
            # Check next line for type annotation
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                # If next line starts with spaces and contains a type
                if re.match(r'\s*[{[]', next_line) or re.match(r'\s*\w+', next_line):
                    # Skip to next line that ends with )
                    j = i + 1
                    while j < len(lines) and not re.search(r'\)\s*[{]?$', lines[j]):
                        j += 1
                    
                    if j < len(lines):
                        # Replace }: with just }
                        line = re.sub(r'}\s*:\s*$', '} ', line)
                        result.append(line)
                        # Skip all the type lines
                        i = j + 1
                        continue
        
        result.append(line)
        i += 1
    
    content = ''.join(result)
    
    # Second pass: clean up any remaining bare `: ` at end of lines
    content = re.sub(r'}\s*:\s*\n\s*[\w\{\[\|&]+', '}\n  ', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    files_to_fix = [
        'components/ui/badge.jsx',
        'components/ui/button.jsx',
        'components/ui/chart.jsx',
        'components/ui/item.jsx',
        'components/ui/toggle-group.jsx',
        'components/ui/toggle.jsx',
    ]
    
    print("Fixing split-line type annotations...\n")
    
    for file_path in files_to_fix:
        try:
            fix_split_types(file_path)
            print(f"✓ Fixed {file_path}")
        except Exception as e:
            print(f"✗ Error in {file_path}: {e}")

if __name__ == '__main__':
    main()
