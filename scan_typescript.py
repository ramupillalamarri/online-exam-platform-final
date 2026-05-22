#!/usr/bin/env python3
"""Find all remaining TypeScript patterns in JS/JSX files"""

import re
from pathlib import Path

def scan_for_typescript(file_path):
    """Scan a file for TypeScript patterns"""
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    issues = []
    
    for i, line in enumerate(lines, 1):
        # Check for destructured params with types: }: { ... }
        if re.search(r'}\s*:\s*\{[^}]*\}[,)]', line):
            issues.append((i, 'Destructured type annotation', line.strip()))
        
        # Check for Readonly type
        if 'Readonly<' in line or 'Readonly {' in line:
            issues.append((i, 'Readonly type', line.strip()))
        
        # Check for function return type annotations
        if re.search(r'\)\s*:\s*[A-Z]\w*\s*({|=>)', line):
            issues.append((i, 'Return type annotation', line.strip()))
        
        # Check for type-only imports
        if 'import type' in line or 'import {' in line and 'type ' in line:
            issues.append((i, 'Type import', line.strip()))
        
        # Check for generic function calls
        if re.search(r'\w+\s*<[^>]*>\s*\(', line) and 'React' not in line:
            issues.append((i, 'Generic function call', line.strip()))
        
        # Check for React.ReactNode
        if 'React.ReactNode' in line:
            issues.append((i, 'React.ReactNode type reference', line.strip()))
    
    return issues

def main():
    root = Path('.')
    files = list(root.rglob('*.js')) + list(root.rglob('*.jsx'))
    
    # Filter to main source files only
    files = [
        f for f in files 
        if not any(x in str(f) for x in ['node_modules', '.next', '.git'])
    ]
    
    print(f"Scanning {len(files)} files for TypeScript patterns...\n")
    
    all_issues = {}
    for file_path in files:
        issues = scan_for_typescript(file_path)
        if issues:
            all_issues[str(file_path)] = issues
    
    # Print results
    for file_path in sorted(all_issues.keys()):
        issues = all_issues[file_path]
        print(f"\n{file_path}:")
        for line_num, issue_type, content in issues:
            print(f"  Line {line_num}: [{issue_type}]")
            print(f"    {content[:80]}...")

if __name__ == '__main__':
    main()
