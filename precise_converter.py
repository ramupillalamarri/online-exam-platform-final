#!/usr/bin/env python3
"""
Precise TypeScript to JavaScript converter - removes ONLY TS syntax
"""
import re
import sys

def remove_typescript_carefully(content):
    """Remove TypeScript syntax line by line"""
    lines = content.split('\n')
    result_lines = []
    
    skip_mode = False
    brace_depth = 0
    
    for line in lines:
        # Skip interface and type declarations line by line
        if re.match(r'\s*(export\s+)?(interface|type)\s+\w+', line):
            skip_mode = True
            brace_depth = line.count('{') - line.count('}')
            continue
        
        if skip_mode:
            brace_depth += line.count('{') - line.count('}')
            if brace_depth <= 0:
                skip_mode = False
            continue
        
        # Fix: remove 'import type' -> 'import'
        line = re.sub(r'^import\s+type\s+', 'import ', line)
        
        # Fix: remove type from named imports - ', type Name' -> ', Name'
        line = re.sub(r',\s*type\s+(\w+)', r', \1', line)
        
        # Fix: 'import * from' -> 'import * as React from'
        if re.match(r"\s*import\s+\*\s+from\s+['\"]react['\"]", line):
            line = line.replace('import * from', "import * as React from")
        
        # Fix: remove variable type annotations but KEEP SPACES
        # Pattern: const name: Type = value
        # Only match if there's an '=' sign after (not just a declaration)
        line = re.sub(r'(const\s+\w+)\s*:\s*[A-Za-z_][A-Za-z0-9_\[\]<>, ]*\s*=', r'\1 =', line)
        
        # Fix: remove type from destructured params in function signatures
        # { prop }: { prop: Type } -> { prop }
        # But ONLY in function signatures, not in regular code
        if '=>' in line or 'function' in line or 'constructor' in line:
            line = re.sub(r'(\})\s*:\s*\{[^}]*\}', r'\1', line)
        
        # Fix: remove generic types from create() - create<Type>() -> create()
        line = re.sub(r'create\s*<[^>]*>\s*\(', 'create(', line)
        
        # Fix: remove useState generic - useState<Type> -> useState
        line = re.sub(r'useState\s*<[^>]*>', 'useState', line)
        
        # Fix: remove function return types - ): Type => -> ): => 
        line = re.sub(r'\)\s*:\s*[A-Za-z_][A-Za-z0-9_\[\]<>, ]*\s*(=>|{)', r') \1', line)
        
        # Fix: remove parameter type annotations -, param: Type) -> -, param)
        line = re.sub(r',\s*(\w+)\s*:\s*[A-Za-z_][A-Za-z0-9_\[\]<>, ]*\s*([,\)])', r', \1\2', line)
        line = re.sub(r'\(\s*(\w+)\s*:\s*[A-Za-z_][A-Za-z0-9_\[\]<>, ]*\s*(,|\))', r'(\1\2', line)
        
        result_lines.append(line)
    
    return '\n'.join(result_lines)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python script.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    converted = remove_typescript_carefully(content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(converted)
    
    print(f"Converted: {file_path}")
