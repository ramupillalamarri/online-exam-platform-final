import os
import re

errors = []
warnings = []

for root, dirs, files in os.walk('.'):
    # Skip node_modules and .next
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git', '__pycache__']]
    
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    
                for i, line in enumerate(lines, 1):
                    # Check for common syntax errors
                    if re.search(r'\}\s*\{\s*$', line):
                        errors.append(f"{filepath}:{i} - Possible broken braces at EOL")
                    if re.search(r'^\s*\}?\)\s*$', line) and i > 1:
                        if 'map' in lines[i-2]:
                            warnings.append(f"{filepath}:{i} - Possible broken map closure")
                    # Check for extra braces or parens
                    if re.search(r'\)\s*\)\s*;?\s*$', line):
                        warnings.append(f"{filepath}:{i} - Double closing paren: {line.strip()[:60]}")
                            
            except Exception as e:
                errors.append(f"{filepath} - Read error: {e}")

print(f"═" * 60)
print(f"ERRORS FOUND: {len(errors)}")
for err in errors[:20]:
    print(f"  ❌ {err}")

print(f"\nWARNINGS: {len(warnings)}")
for warn in warnings[:10]:
    print(f"  ⚠️  {warn}")

if not errors and not warnings:
    print("✅ All files syntax check passed!")
print(f"═" * 60)
