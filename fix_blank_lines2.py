import os
import re

for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                # Remove blank lines that appear before }) when preceded by )
                new_lines = []
                for i, line in enumerate(lines):
                    # Check if this line is blank and the next line has })
                    if line.strip() == '' and i + 1 < len(lines) and lines[i + 1].strip() == '})':
                        # Check if the previous line has )
                        if i > 0 and lines[i - 1].strip().endswith(')'):
                            continue  # Skip this blank line
                    new_lines.append(line)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)
                print(f"Fixed: {filepath}")
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

print("Done removing blank lines between ) and })")
