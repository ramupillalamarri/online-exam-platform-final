#!/usr/bin/env python3
"""
Complete TypeScript to JavaScript converter for the exam platform
Removes TypeScript syntax while preserving all JavaScript logic
"""

import os
import re
import sys
from pathlib import Path

def convert_typescript_to_javascript(file_path):
    """Convert a single TypeScript file to JavaScript"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    result = []
    in_interface = False
    in_type = False
    interface_depth = 0
    type_depth = 0
    
    for line in lines:
        # Skip entire interface blocks
        if re.match(r'\s*(export\s+)?interface\s+\w+', line):
            in_interface = True
            interface_depth = line.count('{') - line.count('}')
            if interface_depth <= 0:
                in_interface = False
            continue
        
        if in_interface:
            interface_depth += line.count('{') - line.count('}')
            if interface_depth <= 0:
                in_interface = False
            continue
        
        # Skip entire type declarations (but keep type aliases that are constants)
        if re.match(r'\s*(export\s+)?type\s+\w+\s*=', line) and '{' in line:
            in_type = True
            type_depth = line.count('{') - line.count('}')
            if type_depth <= 0:
                in_type = False
            continue
        
        if in_type:
            type_depth += line.count('{') - line.count('}')
            if type_depth <= 0:
                in_type = False
            continue
        
        # Remove 'import type' statements entirely
        if re.match(r'\s*import\s+type\s+', line):
            continue
        
        # Fix: 'import type { ... }' -> 'import { ... }'
        line = re.sub(r'import\s+type\s+\{', 'import {', line)
        
        # Fix: remove ', type VariantProps' from imports
        line = re.sub(r',\s*type\s+(\w+)', r', \1', line)
        
        # Fix: 'import * from react' -> 'import * as React from react'  
        line = re.sub(
            r"import\s+\*\s+from\s+['\"]react['\"]",
            "import * as React from 'react'",
            line
        )
        
        # Fix: generic types from create() - create<ExamStore>() -> create()
        line = re.sub(r'create\s*<[^>]+>\s*\(', 'create(', line)
        
        # Fix: const declarations with types: const x: Type = -> const x =
        line = re.sub(
            r'(const\s+(\w+))\s*:\s+([A-Z]\w*(?:<[^>]*>)?(?:\[\])?)\s*=',
            r'\1 =',
            line
        )
        
        # Fix: let/var declarations with types
        line = re.sub(
            r'((?:let|var)\s+(\w+))\s*:\s+([A-Z]\w*(?:<[^>]*>)?(?:\[\])?)\s*=',
            r'\1 =',
            line
        )
        
        # Fix: Array type annotations in declarations: const arr: Type[] = 
        line = re.sub(
            r'(const\s+(\w+))\s*:\s+(\w+(?:\[\])+)\s*=',
            r'\1 =',
            line
        )
        
        # Fix: destructured params with types: { a, b }: { a: Type; b: Type } =>
        # Only if there's a => after (arrow function)
        if '=>' in line or 'function' in line:
            line = re.sub(r'\}\s*:\s*\{[^}]*\}\s*(?==>|{)', '}', line)
        
        # Fix: useState generic: useState<Type>(initialValue) -> useState(initialValue)
        line = re.sub(r'useState\s*<[^>]+>\s*\(', 'useState(', line)
        
        # Fix: useMemo/useCallback generics
        line = re.sub(r'useMemo\s*<[^>]+>\s*\(', 'useMemo(', line)
        line = re.sub(r'useCallback\s*<[^>]+>\s*\(', 'useCallback(', line)
        
        # Fix: useRef generic: useRef<Type>(initial) -> useRef(initial)
        line = re.sub(r'useRef\s*<[^>]+>\s*\(', 'useRef(', line)
        
        # Fix: function return type annotations
        line = re.sub(
            r'(\))\s*:\s+([A-Z]\w*(?:<[^>]*>)?)\s*(=>|{)',
            r'\1 \3',
            line
        )
        
        # Fix: parameter type annotations - (param: Type, ...) -> (param, ...)
        # Careful to match the full parameter list
        line = re.sub(
            r'([,(])\s*(\w+)\s*:\s+([A-Z]\w*(?:<[^>]*>)?(?:\[\])?)\s*(?=[,)])',
            r'\1 \2',
            line
        )
        
        # Fix: generic function calls - functionName<Type>() -> functionName()
        line = re.sub(r'(\w+)\s*<[^>]+>\s*\(', r'\1(', line)
        
        result.append(line)
    
    return '\n'.join(result)

def process_directory(root_dir):
    """Process all TypeScript files in directory"""
    
    # Define source folders to process
    source_folders = [
        'app',
        'components', 
        'lib',
        'hooks'
    ]
    
    ts_files = []
    
    # Find all .ts and .tsx files
    for folder in source_folders:
        folder_path = Path(root_dir) / folder
        if folder_path.exists():
            for ts_file in folder_path.rglob('*.ts'):
                ts_files.append(ts_file)
            for ts_file in folder_path.rglob('*.tsx'):
                ts_files.append(ts_file)
    
    print(f"Found {len(ts_files)} TypeScript files to convert")
    
    for ts_file in ts_files:
        try:
            # Convert content
            converted = convert_typescript_to_javascript(str(ts_file))
            
            # Determine output file name
            if str(ts_file).endswith('.tsx'):
                js_file = str(ts_file).replace('.tsx', '.jsx')
            else:
                js_file = str(ts_file).replace('.ts', '.js')
            
            # Write converted content
            with open(js_file, 'w', encoding='utf-8') as f:
                f.write(converted)
            
            print(f"✓ {ts_file.name} -> {Path(js_file).name}")
            
        except Exception as e:
            print(f"✗ Error processing {ts_file}: {e}")
    
    print(f"\nConversion complete: {len(ts_files)} files processed")

if __name__ == '__main__':
    root = sys.argv[1] if len(sys.argv) > 1 else '.'
    process_directory(root)
