import os
import re

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Fix the pattern })} followed by newline and closing tags
                # This should become ) followed by }) on the next line
                content = re.sub(r'(\s+)\}\)\}(\r?\n)', r'\1)\r\n\1})\2', content)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed: {filepath}")
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

print("Done fixing map closures")
