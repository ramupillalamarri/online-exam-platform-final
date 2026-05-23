import os
import re

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Fix the pattern: remove extra blank lines and ensure proper formatting
                # Pattern: ) followed by blank line(s) and })
                # Should become: ) followed immediately by })
                content = re.sub(r'(\s+)\)\s*\n\s*\n\s*\}\)', r'\1)\n\1})', content)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed: {filepath}")
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

print("Done removing extra blank lines")
