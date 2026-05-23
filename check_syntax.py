#!/usr/bin/env python
import sys

# Check for unclosed backticks in ranges
with open('app/student/page.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check lines around the problematic area
print("Checking lines 390-440 for backtick balance:")
backtick_count = 0
for i in range(389, 440):
    line = lines[i]
    new_backticks = line.count('`')
    backtick_count += new_backticks
    
    if new_backticks > 0:
        print(f"Line {i+1} (running total: {backtick_count}): {line.rstrip()[:100]}")

print(f"\nTotal backticks in range: {backtick_count}")
if backtick_count % 2 != 0:
    print("ERROR: Odd number of backticks - unclosed template literal!")
else:
    print("OK: All backticks appear balanced")
