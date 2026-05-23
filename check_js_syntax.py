#!/usr/bin/env python3
import os
import re

# Find all .js and .jsx files
js_files = []
for root, dirs, files in os.walk('.'):
    # Skip node_modules and .next
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.turbo', '.git']]
    for file in files:
        if file.endswith(('.js', '.jsx')):
            js_files.append(os.path.join(root, file))

errors_found = []

for filepath in sorted(js_files):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Check for common TypeScript patterns
        errors = []
        
        # TypeScript type annotations
        if re.search(r':\s*(string|number|boolean|any|void|never|unknown|object)\s*[,;=\)]', content):
            errors.append("Type annotation found")
        
        # Generic types like <T>
        if re.search(r'<\w+[\w,\s]*>', content) and not re.search(r'import|from', content[:1000]):  # Avoid false positives in imports
            if re.search(r'(function|const|class)\s+\w+\s*<', content):
                errors.append("Generic type parameter found")
        
        # Export type/interface
        if re.search(r'^\s*(export\s+)?(type|interface)\s+\w+', content, re.MULTILINE):
            errors.append("Export type/interface found")
        
        # Broken imports (ending with : or unusual patterns)
        if re.search(r'from\s+["\'].*["\']:\s*\w+', content):
            errors.append("Malformed import")
        
        # Missing semicolons at end of statements (very permissive - only obvious cases)
        lines = content.split('\n')
        for i, line in enumerate(lines):
            stripped = line.strip()
            if not stripped or stripped.startswith('//') or stripped.startswith('*'):
                continue
            
            # Check for obvious syntax errors
            if stripped.endswith(':') and '{' not in stripped:
                errors.append(f"Line {i+1}: Unexpected colon at end of line")
        
        if errors:
            errors_found.append((filepath, errors))
    
    except Exception as e:
        errors_found.append((filepath, [f"Read error: {str(e)}"]))

# Report
if errors_found:
    print(f"⚠️  FILES WITH POTENTIAL ERRORS: {len(errors_found)}\n")
    for filepath, errors in errors_found[:20]:  # Show first 20
        print(f"📄 {filepath}")
        for error in errors:
            print(f"   - {error}")
        print()
else:
    print("✅ No obvious JavaScript syntax errors found!")

print(f"\n📊 Total .js/.jsx files scanned: {len(js_files)}")
