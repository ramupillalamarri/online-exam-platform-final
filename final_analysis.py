#!/usr/bin/env python3
"""Final comprehensive analysis with detailed issue categorization."""

import os
import re
from pathlib import Path
from collections import defaultdict

def analyze_file_final(filepath):
    """Comprehensive analysis of a single file."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
    except:
        return []
    
    content = ''.join(lines)
    
    for line_num, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # Skip comments and empty lines
        if not stripped or stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
            continue
        
        # Check for TypeScript-specific type annotations
        # Type keyword at start of line
        if re.match(r'^\s*type\s+\w+\s*=', line):
            issues.append({
                'line': line_num,
                'type': 'TypeScript_type_declaration',
                'severity': 'ERROR',
                'issue': 'TypeScript type declaration found',
                'code': stripped[:100],
                'fix': 'Convert to JSDoc comment or remove'
            })
        
        # Interface keyword
        if re.match(r'^\s*interface\s+\w+', line):
            issues.append({
                'line': line_num,
                'type': 'TypeScript_interface',
                'severity': 'ERROR',
                'issue': 'TypeScript interface declaration found',
                'code': stripped[:100],
                'fix': 'Convert to JSDoc @typedef or remove'
            })
        
        # React.FC, React.ReactNode, etc.
        if re.search(r'\b(React\.FC|React\.ReactNode|React\.ReactElement|React\.ComponentType|FC<|ReactNode|ReactElement)\b', line):
            # Make sure it's not in a comment
            if '//' not in line[:line.find('React')]:
                issues.append({
                    'line': line_num,
                    'type': 'TypeScript_React_type',
                    'severity': 'WARNING',
                    'issue': 'React TypeScript type annotation found',
                    'code': stripped[:100],
                    'fix': 'Remove or replace with JSDoc comment'
                })
        
        # Generics with explicit type parameters in function calls
        # Pattern: <Type> or <Type extends Something>
        if re.search(r'<\s*[A-Z]\w+\s*(?:extends|,|\s*>)', line):
            # Exclude JSX (< followed by capital and content before)
            jsx_match = re.search(r'<\s*([A-Z]\w+)\s+', line)  # JSX component with props
            type_match = re.search(r'<\s*[A-Z]\w+\s*(?:extends|,|\s*>)', line)
            
            # If it's definitely not JSX
            if type_match and not jsx_match:
                issues.append({
                    'line': line_num,
                    'type': 'TypeScript_generic',
                    'severity': 'WARNING',
                    'issue': 'TypeScript generic type found',
                    'code': stripped[:100],
                    'fix': 'Remove generic type parameters'
                })
        
        # as keyword for type casting
        if re.search(r'\s+as\s+[A-Z]\w+(?:\s|[,\);])', line):
            if 'http' not in line and 'URL' not in line:  # Avoid false positives
                issues.append({
                    'line': line_num,
                    'type': 'TypeScript_type_assertion',
                    'severity': 'WARNING',
                    'issue': 'Type assertion (as) found',
                    'code': stripped[:100],
                    'fix': 'Remove "as Type" casting'
                })
        
        # Satisfies keyword
        if re.search(r'\s+satisfies\s+', line):
            issues.append({
                'line': line_num,
                'type': 'TypeScript_satisfies',
                'severity': 'WARNING',
                'issue': 'satisfies keyword found',
                'code': stripped[:100],
                'fix': 'Remove satisfies clause'
            })
        
        # Imports from .ts or .tsx files
        ts_import = re.search(r"from\s+['\"]([^'\"]*\.tsx?)['\"]", line)
        if ts_import:
            issues.append({
                'line': line_num,
                'type': 'import_from_typescript',
                'severity': 'ERROR',
                'issue': f'Importing from TypeScript file: {ts_import.group(1)}',
                'code': stripped[:100],
                'fix': 'Change import path to .js or .jsx file'
            })
    
    return issues

def main():
    print("=" * 120)
    print("COMPREHENSIVE JAVASCRIPT/JSX ANALYSIS - FINAL REPORT")
    print("=" * 120)
    print()
    
    # Find TypeScript files
    print("SECTION 1: REMAINING TYPESCRIPT FILES")
    print("-" * 120)
    
    ts_files = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git', 'dist', 'build']]
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                path = os.path.normpath(os.path.join(root, file))
                # Skip next-env.d.ts if it exists
                if path != '.\\next-env.d.ts':
                    ts_files.append(path)
    
    if ts_files:
        print(f"⚠️  Found {len(ts_files)} TypeScript files that need conversion:\n")
        for f in sorted(ts_files):
            print(f"  {f}")
    else:
        print("✅ No TypeScript files (.ts/.tsx) in source directories")
    
    print()
    print("SECTION 2: SCANNING JAVASCRIPT/JSX FILES FOR TYPESCRIPT SYNTAX")
    print("-" * 120)
    
    scan_dirs = ['app', 'components', 'lib', 'hooks']
    all_files = []
    
    for scan_dir in scan_dirs:
        if os.path.exists(scan_dir):
            for root, dirs, files in os.walk(scan_dir):
                dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
                for file in files:
                    if file.endswith(('.js', '.jsx')):
                        all_files.append(os.path.normpath(os.path.join(root, file)))
    
    print(f"Total files to analyze: {len(all_files)}\n")
    
    # Analyze all files
    all_issues = defaultdict(list)
    issue_types = defaultdict(int)
    
    for filepath in sorted(all_files):
        issues = analyze_file_final(filepath)
        if issues:
            for issue in issues:
                all_issues[filepath].append(issue)
                issue_types[issue['type']] += 1
    
    # Print results
    if not all_issues:
        print("✅ NO TYPESCRIPT SYNTAX FOUND!")
        print(f"   All {len(all_files)} JavaScript/JSX files are properly formatted.")
    else:
        print(f"⚠️  Issues found in {len(all_issues)} files\n")
        
        print("Issue breakdown by type:")
        for issue_type, count in sorted(issue_types.items(), key=lambda x: -x[1]):
            print(f"  - {issue_type}: {count}")
        
        print()
        print("SECTION 3: DETAILED ISSUES")
        print("-" * 120)
        
        for filepath in sorted(all_issues.keys()):
            issues = all_issues[filepath]
            print(f"\n📄 {filepath}")
            print(f"   Issues: {len(issues)}\n")
            
            for issue in sorted(issues, key=lambda x: x['line']):
                print(f"   Line {issue['line']}: [{issue['type']}] ({issue['severity']})")
                print(f"     Issue: {issue['issue']}")
                print(f"     Code:  {issue['code']}")
                print(f"     Fix:   {issue['fix']}")
                print()
    
    print()
    print("SECTION 4: SUMMARY STATISTICS")
    print("-" * 120)
    print(f"Total files analyzed: {len(all_files)}")
    print(f"Files with issues: {len(all_issues)}")
    print(f"Total issues found: {sum(len(v) for v in all_issues.values())}")
    
    if ts_files:
        print(f"TypeScript files remaining: {len(ts_files)}")
    
    print()
    print("=" * 120)

if __name__ == '__main__':
    main()
