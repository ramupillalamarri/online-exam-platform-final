#!/usr/bin/env python3
"""
Simple file renamer only - let Next.js handle the JavaScript conversion
"""

import os

count = 0
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
    for f in files:
        if f.endswith(('.ts', '.tsx')):
            old_path = os.path.join(root, f)
            new_path = old_path.replace('.tsx', '.jsx').replace('.ts', '.js')
            if old_path != new_path:
                try:
                    if os.path.exists(new_path):
                        os.remove(old_path)
                        print(f"Removed duplicate: {f}")
                    else:
                        os.rename(old_path, new_path)
                        print(f"Renamed: {f}")
                    count += 1
                except Exception as e:
                    print(f"Error with {f}: {e}")

print(f"Renamed {count} files")
