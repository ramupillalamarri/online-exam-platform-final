import os
import re

# List of files to check and fix
files_to_fix = [
    'lib/db.js',
    'lib/types.js',
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Remove type annotations from function parameters and return types
        # Pattern: word: Type = default
        content = re.sub(r'(\w+):\s*[^=,\)}\n]+(\s*[=,\)\}])', r'\1\2', content)
        
        # Remove generic type parameters: <Type>
        content = re.sub(r'<[^>]+>', '', content)
        
        # Remove: Type | Type patterns
        content = re.sub(r':\s*\w+\s*\|\s*\w+', '', content)
        
        # Remove simple type annotations: : Type (but not : value in object literals)
        content = re.sub(r':\s*(?:Pool|string|any|number|boolean|void|never|unknown)\s*(?=[,\)}\n=])', '', content)
        
        # Remove export type declarations
        content = re.sub(r'export\s+type\s+\w+\s*=.*?(?=\n|;)', '', content, flags=re.MULTILINE)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {filepath}")
        else:
            print(f"⚠️  No changes needed: {filepath}")
    else:
        print(f"❌ Not found: {filepath}")
