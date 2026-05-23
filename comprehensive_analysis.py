#!/usr/bin/env python3
"""Comprehensive analysis of JavaScript/JSX files for TypeScript syntax and errors."""

import os
import re
from pathlib import Path
from collections import defaultdict

# Patterns to detect TypeScript syntax
TYPESCRIPT_PATTERNS = {
    'type_annotation': r':\s+([A-Z]\w+(?:<[^>]+>)?|string|number|boolean|any|unknown|void)\s*[,=\)]',
    'type_keyword': r'\btype\s+\w+\s*=\s*',
    'interface_keyword': r'\binterface\s+\w+\s*\{',
    'generic_type': r'<\s*[A-Z]\w+\s*(?:extends|=)?',
    'react_fc': r'React\.FC|React\.ReactNode|React\.ReactElement|React\.ComponentType|FC<|ReactNode|ReactElement',
    'as_const': r'\s+as\s+const',
    'as_type': r'\s+as\s+[A-Z]\w+',
    'satisfies': r'\s+satisfies\s+',
}

# Common syntax error patterns
SYNTAX_ERROR_PATTERNS = {
    'unclosed_brace': r'[{]\s*[^}]*$',  # Lines ending with unclosed braces
    'double_comma': r',\s*,',
    'missing_comma': r'[}\]]\s+[a-zA-Z0-9"{]',  # Potential missing comma
    'mismatched_parens': r'(?<=[^(])\([^)]*$',  # Unclosed parenthesis
}

# Import/export patterns
IMPORT_EXPORT_PATTERNS = {
    'named_import_error': r'import\s+\{[^}]*\}\s+from',
    'default_export': r'export\s+default',
    'named_export': r'export\s+const|export\s+function|export\s+class',
    'import_from': r'from\s+[\'"]',
}

def analyze_file(filepath):
    """Analyze a single JavaScript/JSX file."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        return [{'line': 0, 'type': 'read_error', 'issue': str(e), 'code': ''}]
    
    # Check for TypeScript syntax
    for pattern_name, pattern in TYPESCRIPT_PATTERNS.items():
        for line_num, line in enumerate(lines, 1):
            # Skip comments
            if line.strip().startswith('//'):
                continue
            
            matches = re.finditer(pattern, line)
            for match in matches:
                # Filter out false positives
                if pattern_name == 'type_annotation':
                    # Check context - avoid matching comparison operators
                    before = line[:match.start()]
                    if '>' in before and '<' in before:
                        continue
                    if 'className' in before:
                        continue
                
                issues.append({
                    'line': line_num,
                    'type': f'TypeScript_syntax:{pattern_name}',
                    'issue': f'Found TypeScript syntax: {pattern_name}',
                    'code': line.strip(),
                    'match': match.group(0),
                })
    
    # Check for syntax errors
    for pattern_name, pattern in SYNTAX_ERROR_PATTERNS.items():
        for line_num, line in enumerate(lines, 1):
            if line.strip().startswith('//'):
                continue
            
            if re.search(pattern, line):
                # Basic validation to avoid false positives
                if pattern_name == 'missing_comma' and 'return' in line:
                    continue
                if pattern_name == 'unclosed_brace' and '//' in line:
                    continue
                
                issues.append({
                    'line': line_num,
                    'type': f'possible_syntax_error:{pattern_name}',
                    'issue': f'Possible syntax error: {pattern_name}',
                    'code': line.strip(),
                })
    
    # Check import/export issues
    for pattern_name, pattern in IMPORT_EXPORT_PATTERNS.items():
        for line_num, line in enumerate(lines, 1):
            if re.search(pattern, line):
                # Validate import paths
                if 'from' in line:
                    path_match = re.search(r'from\s+[\'"]([^\'"]+)[\'"]', line)
                    if path_match:
                        path = path_match.group(1)
                        # Check for TypeScript-only imports
                        if path.endswith('.ts') or path.endswith('.tsx'):
                            issues.append({
                                'line': line_num,
                                'type': 'import_error:typescript_import',
                                'issue': f'Importing from TypeScript file: {path}',
                                'code': line.strip(),
                            })
    
    return issues

def scan_directory(directory_path, extensions=['.js', '.jsx']):
    """Scan directory for files with given extensions."""
    files = []
    for ext in extensions:
        files.extend(Path(directory_path).rglob(f'*{ext}'))
    return files

def main():
    base_path = Path('.')
    
    # Define directories to scan
    scan_dirs = ['app', 'components', 'lib', 'hooks']
    
    print("=" * 100)
    print("COMPREHENSIVE JAVASCRIPT/JSX ANALYSIS")
    print("=" * 100)
    print()
    
    # Check for remaining TypeScript files
    print("1. CHECKING FOR REMAINING .ts/.tsx FILES")
    print("-" * 100)
    ts_files = []
    for scan_dir in scan_dirs:
        if Path(scan_dir).exists():
            ts_files.extend(scan_directory(scan_dir, extensions=['.ts', '.tsx']))
    
    if ts_files:
        print(f"❌ Found {len(ts_files)} TypeScript files:")
        for f in sorted(ts_files):
            print(f"  - {f}")
    else:
        print("✅ No TypeScript (.ts/.tsx) files found")
    print()
    
    # Scan all JavaScript/JSX files
    print("2. SCANNING JAVASCRIPT/JSX FILES FOR ISSUES")
    print("-" * 100)
    
    all_files = []
    for scan_dir in scan_dirs:
        if Path(scan_dir).exists():
            all_files.extend(scan_directory(scan_dir, extensions=['.js', '.jsx']))
    
    print(f"Total JavaScript/JSX files found: {len(all_files)}")
    print()
    
    # Analyze each file
    all_issues = defaultdict(list)
    file_issues_count = defaultdict(int)
    
    for filepath in sorted(all_files):
        issues = analyze_file(str(filepath))
        if issues:
            for issue in issues:
                all_issues[str(filepath)].append(issue)
                file_issues_count[issue['type']] += 1
    
    # Print summary
    print("3. ISSUE SUMMARY")
    print("-" * 100)
    
    if not all_issues:
        print("✅ No issues found!")
    else:
        print(f"Total files with issues: {len(all_issues)}")
        print()
        print("Issue breakdown:")
        for issue_type, count in sorted(file_issues_count.items(), key=lambda x: -x[1]):
            print(f"  {issue_type}: {count}")
        print()
        
        # Print detailed issues
        print("4. DETAILED FINDINGS")
        print("-" * 100)
        
        for filepath in sorted(all_issues.keys()):
            issues = all_issues[filepath]
            print(f"\n📄 {filepath}")
            print(f"   Issues found: {len(issues)}")
            
            for issue in issues[:5]:  # Limit to 5 per file
                print(f"\n   Line {issue['line']}: [{issue['type']}]")
                print(f"   Issue: {issue['issue']}")
                print(f"   Code: {issue['code'][:80]}")
                if 'match' in issue:
                    print(f"   Match: {issue['match']}")
            
            if len(issues) > 5:
                print(f"\n   ... and {len(issues) - 5} more issues")
    
    print()
    print("=" * 100)

if __name__ == '__main__':
    main()
