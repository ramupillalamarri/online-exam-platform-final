import re

# Read the file
with open('lib/store.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove 'import type' and convert to regular import
content = re.sub(r"import type \{ ([^}]+) \}", r"import { \1 }", content)

# Remove : Type from variable/array type annotations but preserve : value assignments
# This specifically handles: const arr: Type[] = [ or : Type =
content = re.sub(r":\s*[A-Z][a-zA-Z0-9<>\[\],\s]*\[\]\s*=", r" =", content)
content = re.sub(r":\s*[A-Z][a-zA-Z0-9<>\[\]]*\s*=", r" =", content)

# Remove type parameters from variables like: const x: string = 
content = re.sub(r":\s*(string|number|boolean|any|unknown|object)\s*=", r" =", content)

# Remove type assertion/parameters from function return types: (): Type =>
content = re.sub(r"\(\s*\)\s*:\s*[A-Z][a-zA-Z0-9<>\[\]]*\s*=>", r"() =>", content)

# Remove parameter type annotations: (param: Type) => (param) =>
content = re.sub(r"\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*[A-Z][a-zA-Z0-9<>\[\],\s]*\s*\)", r"(\1)", content)

# Remove ': Type' from function parameters with multiple params
content = re.sub(r",\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*[A-Z][a-zA-Z0-9<>\[\],\s]*\s*([,)])", r", \1\2", content)

# Remove type assertions with 'as':
content = re.sub(r"\s+as\s+[A-Z][a-zA-Z0-9<>\[\]]*", "", content)
content = re.sub(r"\s+as\s+(const|any|unknown)", "", content)

# Write back
with open('lib/store.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Conversion complete")
