#!/usr/bin/env python3
"""FINAL COMPREHENSIVE ANALYSIS - Accurate identification of real issues."""

import os
import re
from pathlib import Path

def main():
    print("=" * 130)
    print(" " * 35 + "COMPREHENSIVE CODEBASE ANALYSIS REPORT")
    print(" " * 25 + "Next.js 16.2.4 JavaScript/JSX Exam Platform")
    print("=" * 130)
    print()
    
    # ==================== SECTION 1 ====================
    print("█" * 130)
    print("SECTION 1: REMAINING TYPESCRIPT FILES (.ts/.tsx)")
    print("█" * 130)
    print()
    
    ts_files = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git', 'dist', 'build']]
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                path = os.path.normpath(os.path.join(root, file))
                ts_files.append(path)
    
    print(f"Total TypeScript files found: {len(ts_files)}")
    print()
    
    for f in sorted(ts_files):
        print(f"  ❌ {f}")
        if f.endswith('.ts') and f != '.\\next-env.d.ts':
            # Read first few lines to show content
            try:
                with open(f, 'r', encoding='utf-8', errors='ignore') as file:
                    lines = file.readlines()[:5]
                    for line in lines:
                        if line.strip():
                            print(f"     {line.rstrip()[:90]}")
            except:
                pass
    
    print()
    
    # ==================== SECTION 2 ====================
    print("█" * 130)
    print("SECTION 2: JAVASCRIPT/JSX FILES - TYPESCRIPT SYNTAX DETECTION")
    print("█" * 130)
    print()
    
    # Real TypeScript syntax patterns in JS/JSX files
    real_ts_issues = []
    
    scan_dirs = ['app', 'components', 'lib', 'hooks']
    for scan_dir in scan_dirs:
        if os.path.exists(scan_dir):
            for root, dirs, files in os.walk(scan_dir):
                dirs[:] = [d for d in dirs if d not in ['node_modules', '.next']]
                for file in files:
                    if file.endswith(('.js', '.jsx')):
                        filepath = os.path.join(root, file)
                        try:
                            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                                lines = f.readlines()
                                
                            for line_num, line in enumerate(lines, 1):
                                stripped = line.strip()
                                
                                # Check 1: type keyword (excluding URLs/comments)
                                if re.match(r'^\s*type\s+\w+\s*=', line):
                                    real_ts_issues.append({
                                        'file': filepath,
                                        'line': line_num,
                                        'type': 'TypeScript_type_declaration',
                                        'severity': 'ERROR',
                                        'code': stripped[:95]
                                    })
                                
                                # Check 2: interface keyword
                                if re.match(r'^\s*interface\s+\w+', line):
                                    real_ts_issues.append({
                                        'file': filepath,
                                        'line': line_num,
                                        'type': 'TypeScript_interface_declaration',
                                        'severity': 'ERROR',
                                        'code': stripped[:95]
                                    })
                                
                                # Check 3: React.FC, React.ReactNode (true TypeScript types)
                                if re.search(r'\b(React\.FC\b|React\.ReactNode\b|React\.ReactElement\b|FC<)', line):
                                    if '//' not in line[:max(0, line.find('React'))]:
                                        real_ts_issues.append({
                                            'file': filepath,
                                            'line': line_num,
                                            'type': 'React_TypeScript_type',
                                            'severity': 'ERROR',
                                            'code': stripped[:95]
                                        })
                                
                                # Check 4: Imports from .ts/.tsx files
                                if re.search(r"from\s+['\"]([^'\"]*\.tsx?)['\"]", line):
                                    match = re.search(r"from\s+['\"]([^'\"]*\.tsx?)['\"]", line)
                                    real_ts_issues.append({
                                        'file': filepath,
                                        'line': line_num,
                                        'type': 'Import_from_TypeScript_file',
                                        'severity': 'ERROR',
                                        'code': f'Imports from: {match.group(1)}'
                                    })
                                
                                # Check 5: Satisfies keyword
                                if re.search(r'\s+satisfies\s+', line):
                                    real_ts_issues.append({
                                        'file': filepath,
                                        'line': line_num,
                                        'type': 'TypeScript_satisfies_keyword',
                                        'severity': 'ERROR',
                                        'code': stripped[:95]
                                    })
                        except:
                            pass
    
    if real_ts_issues:
        print(f"❌ Found {len(real_ts_issues)} TypeScript syntax issues in JavaScript files:\n")
        
        current_file = None
        for issue in sorted(real_ts_issues, key=lambda x: (x['file'], x['line'])):
            if issue['file'] != current_file:
                current_file = issue['file']
                print(f"\n  📄 {current_file}")
            
            print(f"    Line {issue['line']}: [{issue['type']}] - {issue['severity']}")
            print(f"      {issue['code']}")
    else:
        print("✅ No TypeScript syntax found in JavaScript/JSX files")
    
    print()
    
    # ==================== SECTION 3 ====================
    print("█" * 130)
    print("SECTION 3: SYNTAX ERRORS AND BROKEN CODE")
    print("█" * 130)
    print()
    
    # Look for common syntax errors
    syntax_errors = []
    
    for scan_dir in scan_dirs:
        if os.path.exists(scan_dir):
            for root, dirs, files in os.walk(scan_dir):
                dirs[:] = [d for d in dirs if d not in ['node_modules', '.next']]
                for file in files:
                    if file.endswith(('.js', '.jsx')):
                        filepath = os.path.join(root, file)
                        try:
                            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read()
                                lines = content.split('\n')
                            
                            # Check for double commas
                            for line_num, line in enumerate(lines, 1):
                                if ',,' in line and '//' not in line:
                                    syntax_errors.append({
                                        'file': filepath,
                                        'line': line_num,
                                        'type': 'Double_comma',
                                        'code': line.strip()[:95]
                                    })
                                
                                # Check for common missing comma patterns
                                if re.search(r'\]\s+[{\w]', line) and '//' not in line:
                                    syntax_errors.append({
                                        'file': filepath,
                                        'line': line_num,
                                        'type': 'Possible_missing_comma',
                                        'code': line.strip()[:95]
                                    })
                        except:
                            pass
    
    if syntax_errors:
        print(f"⚠️  Found {len(syntax_errors)} potential syntax errors:\n")
        current_file = None
        for error in sorted(syntax_errors, key=lambda x: (x['file'], x['line'])):
            if error['file'] != current_file:
                current_file = error['file']
                print(f"\n  📄 {current_file}")
            print(f"    Line {error['line']}: {error['type']}")
            print(f"      {error['code']}")
    else:
        print("✅ No obvious syntax errors detected")
    
    print()
    
    # ==================== SECTION 4 ====================
    print("█" * 130)
    print("SECTION 4: IMPORT/EXPORT ISSUES")
    print("█" * 130)
    print()
    
    import_issues = []
    
    for scan_dir in scan_dirs:
        if os.path.exists(scan_dir):
            for root, dirs, files in os.walk(scan_dir):
                dirs[:] = [d for d in dirs if d not in ['node_modules', '.next']]
                for file in files:
                    if file.endswith(('.js', '.jsx')):
                        filepath = os.path.join(root, file)
                        try:
                            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                                lines = f.readlines()
                            
                            for line_num, line in enumerate(lines, 1):
                                # Check for broken import syntax
                                if 'import' in line and '{' in line and '}' not in line:
                                    if line_num + 1 < len(lines) and '}' not in lines[line_num]:
                                        import_issues.append({
                                            'file': filepath,
                                            'line': line_num,
                                            'type': 'Possible_unclosed_import',
                                            'code': line.strip()[:95]
                                        })
                                
                                # Check for imports without 'from'
                                if re.match(r'^\s*import\s+\{[^}]+\}\s*$', line):
                                    import_issues.append({
                                        'file': filepath,
                                        'line': line_num,
                                        'type': 'Import_missing_from_clause',
                                        'code': line.strip()[:95]
                                    })
                        except:
                            pass
    
    if import_issues:
        print(f"⚠️  Found {len(import_issues)} import/export issues:\n")
        current_file = None
        for issue in sorted(import_issues, key=lambda x: (x['file'], x['line'])):
            if issue['file'] != current_file:
                current_file = issue['file']
                print(f"\n  📄 {current_file}")
            print(f"    Line {issue['line']}: {issue['type']}")
            print(f"      {issue['code']}")
    else:
        print("✅ No critical import/export issues found")
    
    print()
    
    # ==================== SUMMARY ====================
    print("█" * 130)
    print("SUMMARY STATISTICS")
    print("█" * 130)
    print()
    
    all_js_jsx_files = 0
    for scan_dir in scan_dirs:
        if os.path.exists(scan_dir):
            for root, dirs, files in os.walk(scan_dir):
                all_js_jsx_files += sum(1 for f in files if f.endswith(('.js', '.jsx')))
    
    print(f"Total JavaScript/JSX files analyzed: {all_js_jsx_files}")
    print(f"TypeScript files remaining: {len(ts_files)}")
    print(f"TypeScript syntax in JS files: {len(real_ts_issues)}")
    print(f"Syntax errors found: {len(syntax_errors)}")
    print(f"Import/export issues: {len(import_issues)}")
    print()
    
    # ==================== RECOMMENDATIONS ====================
    print("█" * 130)
    print("RECOMMENDATIONS")
    print("█" * 130)
    print()
    
    if len(ts_files) > 0:
        print("1. ❌ CRITICAL: Convert or remove remaining TypeScript files:")
        for f in ts_files:
            if f != '.\\next-env.d.ts':
                print(f"   - {f}")
        print()
    
    if len(real_ts_issues) > 0:
        print("2. ❌ CRITICAL: Remove TypeScript syntax from JavaScript files:")
        print(f"   - {len(real_ts_issues)} issues to fix")
        print()
    
    if len(syntax_errors) > 0:
        print("3. ⚠️  Fix syntax errors in:")
        print(f"   - {len(syntax_errors)} locations")
        print()
    
    if len(import_issues) > 0:
        print("4. ⚠️  Fix import issues in:")
        print(f"   - {len(import_issues)} locations")
        print()
    
    if not any([ts_files, real_ts_issues, syntax_errors, import_issues]):
        print("✅ NO CRITICAL ISSUES FOUND")
        print("   Your JavaScript/JSX codebase appears to be properly converted!")
        print()
    
    print("=" * 130)

if __name__ == '__main__':
    main()
