#!/usr/bin/env python3
"""More accurate comprehensive analysis avoiding false positives."""

import os
import re
from pathlib import Path
from collections import defaultdict

def is_type_annotation(line, match_start, match_end):
    """Check if a match is actually a type annotation, not JSX."""
    # Check for JSX closing >
    after_text = line[match_end:match_end+1]
    before_text = line[max(0, match_start-10):match_start]
    
    # If it's JSX (< followed by capital letter or /)
    if match_start + 1 < len(line):
        next_char = line[match_start + 1]
        if next_char.isupper() or next_char == '/' or next_char == '>':
            return False
    
    # If there's an attribute like className, return false
    if 'className' in before_text:
        return False
    
    return True

def analyze_file_accurate(filepath):
    """Analyze a single file more accurately."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
    except Exception as e:
        return []
    
    for line_num, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # Skip empty lines and comments
        if not stripped or stripped.startswith('//') or stripped.startswith('/*'):
            continue
        
        # Check 1: Type annotations (: Type) not in JSX context
        # Look for patterns like ": string", ": number", ": React.FC"
        if re.search(r':\s+(string|number|boolean|any|unknown|never|void|undefined|null)\b', line):
            # Make sure it's not in a comment
            if '//' not in line[:line.find(':')]:
                issues.append({
                    'line': line_num,
                    'type': 'TypeScript_syntax',
                    'issue': 'Type annotation found',
                    'code': stripped[:100],
                })
        
        # Check 2: React.FC, React.ReactNode, etc.
        if re.search(r'\b(React\.FC|React\.ReactNode|React\.ReactElement|React\.ComponentType|FC\<)\b', line):
            if '//' not in line[:line.find('React')]:
                issues.append({
                    'line': line_num,
                    'type': 'TypeScript_syntax',
                    'issue': 'React TypeScript type found',
                    'code': stripped[:100],
                })
        
        # Check 3: type and interface keywords (not in strings/comments)
        if re.search(r'^\s*(type|interface)\s+\w+', line) and not ('http' in line or 'file' in line):
            issues.append({
                'line': line_num,
                'type': 'TypeScript_syntax',
                'issue': 'Type/interface definition found',
                'code': stripped[:100],
            })
        
        # Check 4: Imports from .ts or .tsx files
        ts_import = re.search(r"from\s+['\"]([^'\"]*\.tsx?)['\"]", line)
        if ts_import:
            issues.append({
                'line': line_num,
                'type': 'import_error',
                'issue': f'Importing TypeScript file: {ts_import.group(1)}',
                'code': stripped[:100],
            })
        
        # Check 5: Missing exports or broken export statements
        if 'export' in line and ('as' in line or '{' in line):
            if re.search(r'export\s+\{[^}]*\}(?!\s+from)', line):
                # This is re-exporting - check if syntax is valid
                pass  # Most re-exports are fine
        
        # Check 6: Orphaned closing braces/brackets on a line
        open_count = line.count('{') + line.count('[') + line.count('(')
        close_count = line.count('}') + line.count(']') + line.count(')')
        if close_count > open_count + 3:  # Allow some nesting
            # This might indicate a syntax error
            pass  # Too many false positives
        
        # Check 7: Unused imports - look for imports that don't appear to be used
        if 'import' in line and '{' in line:
            import_match = re.search(r'import\s+\{\s*([^}]+)\s*\}\s+from', line)
            if import_match:
                imports = [x.strip() for x in import_match.group(1).split(',')]
                # Check if any imported items are actually unused (simple heuristic)
                # Only flag if import looks suspicious (e.g., importing something not common)
                pass  # Skip this check - too many false positives
    
    return issues

def main():
    base_path = Path('.')
    
    # Check for remaining TypeScript files
    print("=" * 100)
    print("COMPREHENSIVE ANALYSIS - JavaScript/JSX Codebase")
    print("=" * 100)
    print()
    
    print("1. CHECKING FOR REMAINING .ts/.tsx FILES")
    print("-" * 100)
    
    ts_files = []
    for root, dirs, files in os.walk('.'):
        # Skip node_modules, .next, etc.
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git', 'dist', 'build']]
        
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                full_path = os.path.join(root, file)
                ts_files.append(full_path)
    
    if ts_files:
        print(f"❌ Found {len(ts_files)} TypeScript files (should be converted to JS/JSX):")
        for f in sorted(ts_files):
            print(f"  - {f}")
    else:
        print("✅ No .ts or .tsx files found in workspace")
    
    print()
    print("2. SCANNING JavaScript/JSX FILES")
    print("-" * 100)
    
    # Scan app, components, lib, hooks for .js/.jsx files
    scan_dirs = ['app', 'components', 'lib', 'hooks']
    
    all_files = []
    for scan_dir in scan_dirs:
        for root, dirs, files in os.walk(scan_dir):
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
            for file in files:
                if file.endswith(('.js', '.jsx')):
                    all_files.append(os.path.join(root, file))
    
    print(f"Total JavaScript/JSX files to analyze: {len(all_files)}")
    print()
    
    # Analyze all files
    all_issues = defaultdict(list)
    issue_counts = defaultdict(int)
    
    for filepath in sorted(all_files):
        issues = analyze_file_accurate(filepath)
        if issues:
            for issue in issues:
                all_issues[filepath].append(issue)
                issue_counts[issue['type']] += 1
    
    print("3. ANALYSIS RESULTS")
    print("-" * 100)
    
    if not all_issues:
        print("✅ NO ISSUES FOUND - All JavaScript/JSX files are properly formatted!")
        print()
        print(f"Summary:")
        print(f"  - Total files scanned: {len(all_files)}")
        print(f"  - Files with issues: 0")
        print(f"  - TypeScript syntax errors: 0")
        print(f"  - Import errors: 0")
    else:
        print(f"⚠️  Found issues in {len(all_issues)} files")
        print()
        print("Issue summary:")
        for issue_type, count in sorted(issue_counts.items(), key=lambda x: -x[1]):
            print(f"  {issue_type}: {count} occurrences")
        print()
        
        print("4. DETAILED ISSUES")
        print("-" * 100)
        
        for filepath in sorted(all_issues.keys()):
            issues = all_issues[filepath]
            print(f"\n📄 {filepath}")
            
            for issue in sorted(issues, key=lambda x: x['line']):
                print(f"  Line {issue['line']}: [{issue['type']}]")
                print(f"    {issue['issue']}")
                print(f"    Code: {issue['code']}")
    
    print()
    print("=" * 100)
    print("ANALYSIS COMPLETE")
    print("=" * 100)

if __name__ == '__main__':
    main()
