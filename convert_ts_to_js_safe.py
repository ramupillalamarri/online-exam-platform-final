#!/usr/bin/env python3
"""
Safe TypeScript to JavaScript converter
Removes ONLY TypeScript syntax while preserving all values
"""

import os
import re

def safe_convert(content):
    """Safely remove TypeScript syntax from JavaScript code"""
    
    # 1. Remove 'import type' but NOT ' as ' (which is part of JavaScript imports)
    content = re.sub(r'import\s+type\s+', 'import ', content)
    
    # 2. Remove ': VariantProps' from imports like ' VariantProps } from'
    # This handles: import { cva, type VariantProps } from
    content = re.sub(r',\s*type\s+', ', ', content)
    
    # 3. Remove interface/type declarations  
    content = re.sub(r'^\s*(export\s+)?(interface|type)\s+\w+[^{]*\{(?:[^{}]|{[^}]*})*\}', '', content, flags=re.MULTILINE)
    
    # 4. Remove type annotations from destructured function parameters
    # { prop1, prop2 }: { prop1: Type; prop2: Type } -> { prop1, prop2 }
    content = re.sub(r'(\})\s*:\s*\{\s*[^}]*\}\s*(?=[,\)])', r'\1', content)
    
    # 5. Remove type annotations from Readonly destructured parameters
    content = re.sub(r'(\})\s*:\s*Readonly<\s*\{[^}]*\}>\s*(?=[,\)])', r'\1', content)
    
    # 6. Remove type annotations from variable declarations
    # const name: Type = ... -> const name = ...
    content = re.sub(r'(const\s+\w+)\s*:\s*[\w\[\]]+\s*=', r'\1 =', content)
    # export const name: Type = ... -> export const name = ...
    content = re.sub(r'(export\s+const\s+\w+)\s*:\s*[\w\[\]]+\s*=', r'\1 =', content)
    # let/var similar
    content = re.sub(r'(let\s+\w+)\s*:\s*[\w\[\]]+\s*=', r'\1 =', content)
    content = re.sub(r'(var\s+\w+)\s*:\s*[\w\[\]]+\s*=', r'\1 =', content)
    
    # 7. Remove generic types but be VERY careful - only remove <>  followed by (
    # function<T>() or const x = <T>() =>
    content = re.sub(r'<\s*Array\s*<\s*\{\s*([^}]+)\s*\}\s*>\s*>', '<\1>', content)  # Collapse Array<{...}> patterns
    content = re.sub(r'(function\s+\w+)\s*<[^>]*>\s*\(', r'\1(', content)
    
    # 8. Remove useState< generic: useState<Type> -> useState()
    content = re.sub(r'useState\s*<[^>]*>\s*\(', 'useState(', content)
    
    # 9. Remove function return type annotations
    # ) : ReturnType { -> ) {
    content = re.sub(r'(\)\s*):\s*[\w\[\]<>]+\s*({)', r'\1\2', content)
    
    # 10. Remove simple parameter type annotations
    # (param: Type) but NOT in object context
    lines = content.split('\n')
    result = []
    for line in lines:
        # Only touch lines that look like function signatures
        if re.search(r'(function|const|=>|export)\s*[^=]*\(', line):
            # Remove : Type from function parameters, but not from object literals
            line = re.sub(r'(\w+)\s*:\s*\w+\s*(?=[,\)])', r'\1', line)
        result.append(line)
    content = '\n'.join(result)
    
    # 11. Remove 'as' casts but NOT ' as ' in imports
    # Only remove 'as Type' at end of expressions or before special chars
    content = re.sub(r'\s+as\s+[\w<>]+(?=[\s,;)\]\}])', '', content)
    
    return content

# Main
count = 0
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git', 'dist']]
    for f in files:
        if f.endswith(('.js', '.jsx')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                    original = file.read()
                
                converted = safe_convert(original)
                
                if converted != original:
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(converted)
                    print(f"Cleaned: {f}")
                    count += 1
            except Exception as e:
                print(f"Error processing {f}: {e}")

print(f"Cleaned {count} files total")

import os
import re
import glob
from pathlib import Path
from typing import List, Tuple

class TypeScriptToJavaScriptConverter:
    def __init__(self):
        self.file_count = 0
        self.error_count = 0
        self.changes_made = 0
        
    def convert_directory(self, root_dir: str, file_extensions: List[str] = ['.js', '.jsx']):
        """Convert all JS/JSX files in directory"""
        pattern = os.path.join(root_dir, '**', f'*{{{",".join(file_extensions)}}}')
        files = glob.glob(pattern, recursive=True)
        
        print(f"Found {len(files)} files to process")
        for file_path in sorted(files):
            self.convert_file(file_path)
        
        print(f"\n{'='*60}")
        print(f"Conversion Complete!")
        print(f"Files processed: {self.file_count}")
        print(f"Files modified: {self.changes_made}")
        print(f"Errors: {self.error_count}")
        print(f"{'='*60}")
        
    def convert_file(self, file_path: str) -> bool:
        """Convert a single file from TypeScript to JavaScript"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
            
            converted_content = self.remove_typescript_syntax(original_content)
            
            if original_content != converted_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(converted_content)
                self.changes_made += 1
                print(f"✓ Converted: {file_path}")
            
            self.file_count += 1
            return True
        except Exception as e:
            self.error_count += 1
            print(f"✗ Error converting {file_path}: {e}")
            return False
    
    def remove_typescript_syntax(self, content: str) -> str:
        """Remove all TypeScript syntax from content"""
        
        # 1. Remove 'import type' statements - convert to regular imports
        content = re.sub(
            r'import\s+type\s+\{([^}]+)\}\s+from\s+',
            r'import { \1 } from ',
            content,
            flags=re.MULTILINE
        )
        
        # 2. Remove 'type' keyword from mixed imports like: import { Component, type Props }
        content = re.sub(
            r'import\s+\{([^}]*?)\s+type\s+([^}]*?)\}',
            lambda m: f'import {{ {m.group(1)}{" " if m.group(1).strip() else ""}{m.group(2).replace(", ", ", ").strip()} }}',
            content,
            flags=re.MULTILINE
        )
        
        # 3. Remove 'type' keyword from mixed imports (simplified pattern)
        content = re.sub(r',\s*type\s+', ', ', content)
        
        # 4. Remove standalone 'type' keyword before imports
        content = re.sub(r'\btype\s+', '', content)
        
        # 5. Remove 'interface' and 'type' declarations entirely (whole block)
        content = re.sub(
            r'^[\s]*(?:export\s+)?(?:type|interface)\s+\w+.*?[{;](?:.*?(?=^(?:export|import|const|let|var|function|class|//|/\*|\Z)))?',
            '',
            content,
            flags=re.MULTILINE | re.DOTALL
        )
        
        # 6. Remove type annotations from function parameters: (param: Type)
        # This regex handles nested parentheses and multiple parameters
        content = self._remove_param_types(content)
        
        # 7. Remove type annotations from variable declarations: const name: Type = value
        # Pattern: identifier followed by colon, type, then equals/semicolon/comma
        content = re.sub(
            r'(\b(?:const|let|var)\s+\w+)\s*:\s*(?:[^=;,\n{[\]]+(?:\[[^\]]*\])*(?:<[^>]*>)*\s*)+',
            r'\1',
            content,
            flags=re.MULTILINE
        )
        
        # 8. Remove type annotations from destructured object params: { prop }: { prop: Type }
        content = self._remove_destructuring_types(content)
        
        # 9. Remove 'as Type' casts
        content = re.sub(
            r'\s+as\s+(?:[A-Z]\w*|\'[^\']*\'|"[^"]*"|\(.*?\))',
            '',
            content,
            flags=re.MULTILINE
        )
        
        # 10. Remove generic type parameters: <Type>, <T>, <Type1, Type2>
        content = self._remove_generic_types(content)
        
        # 11. Remove optional parameter indicators with types: param?: Type
        # But keep the optional chaining operator
        content = re.sub(
            r'(\w+)\?\s*:\s*(?:[^=;,\n}])+',
            r'\1',
            content,
            flags=re.MULTILINE
        )
        
        # 12. Remove return type annotations from functions: (): ReturnType
        content = self._remove_return_types(content)
        
        # 13. Remove React type annotations
        content = re.sub(r'React\.(?:ReactNode|ReactElement|ComponentProps<[^>]+>|FC|FunctionComponent)', 'any', content)
        content = re.sub(r'React\.ComponentProps<[^>]+>', 'any', content)
        
        # 14. Clean up any remaining TypeScript-specific patterns
        # Remove Promise< wrapper if used as type: Promise<{ id: string }>
        content = re.sub(
            r'\bPromise<([^>]+)>',
            r'Promise',
            content
        )
        
        # 15. Remove VariantProps type casting
        content = re.sub(
            r'VariantProps<typeof\s+\w+>\s*&\s*',
            '',
            content
        )
        
        # 16. Remove remaining isolated type annotations in prop definitions
        # Pattern: property?: SomeType after closing brace in arrow functions
        content = re.sub(
            r'\}\s*&\s*\{[^}]*\?\s*:\s*[^}]*\}',
            '}',
            content,
            flags=re.MULTILINE
        )
        
        # 17. Clean up extra whitespace left by removals
        content = re.sub(r'\s*\n\s*\n\s*\n', '\n\n', content)
        content = re.sub(r'[\s]*\n\s*(?=\n)', '\n', content)
        
        return content
    
    def _remove_param_types(self, content: str) -> str:
        """Remove type annotations from function parameters"""
        # This is complex because we need to handle nested brackets and preserve commas
        
        def replace_types_in_parens(match):
            params = match.group(1)
            # Remove type annotations: param: Type => param
            # But be careful with default values and nested structures
            params = re.sub(
                r'(\w+)\s*:\s*(?:[^,)=\n]+(?:\[[^\]]*\])*(?:<[^>]*>)*)',
                r'\1',
                params
            )
            return f'({params})'
        
        # Match function parameters in various contexts
        # function name(params) or (params) => or Method: (params)
        content = re.sub(
            r'\(([^()]*)\)',
            lambda m: self._process_function_params(m.group(1), m),
            content,
            flags=re.MULTILINE
        )
        
        return content
    
    def _process_function_params(self, params: str, match) -> str:
        """Process function parameters and remove type annotations"""
        # Don't process empty params or common false positives
        if not params or ':' not in params or params.strip() in ['', 'undefined', 'null']:
            return match.group(0)
        
        # Check if this looks like a type annotation (not a URL, object literal, etc)
        if params.count(':') > 0 and params.count('http') == 0:
            # Remove type annotations: param: Type => param
            processed = re.sub(
                r'(\w+)\s*:\s*([^,=)]+?)(?=[,)=])',
                r'\1',
                params
            )
            # If changes were made, use processed version
            if processed != params:
                return f'({processed})'
        
        return match.group(0)
    
    def _remove_destructuring_types(self, content: str) -> str:
        """Remove type annotations from destructured parameters"""
        # Pattern: { prop }: { prop: Type }
        def replace_destructure(match):
            destructure = match.group(1)
            # Remove the type annotation part
            destructure = re.sub(
                r':\s*\{[^}]*\}',
                '',
                destructure
            )
            return f'({destructure})'
        
        content = re.sub(
            r'\(\{\s*([^}]+)\s*\}\s*:\s*\{[^}]*\}\s*\)',
            replace_destructure,
            content,
            flags=re.MULTILINE
        )
        
        return content
    
    def _remove_generic_types(self, content: str) -> str:
        """Remove generic type parameters safely"""
        # This is complex to avoid removing legitimate angle brackets
        
        # Pattern: <Type> where Type is a capitalized word (likely a TypeScript generic)
        # But not in JSX tags like <Component> or <div>
        
        # Remove <T>, <Generic>, <Type1, Type2> after function/method definitions
        content = re.sub(
            r'(?:function|async\s+function)\s*\w*\s*<[^>]+>',
            lambda m: m.group(0).replace('<', '').split('>')[0] + m.group(0)[m.group(0).rfind('>')+1:],
            content,
            flags=re.MULTILINE
        )
        
        # More targeted approach: remove <Generic> but preserve JSX tags
        def safe_remove_generics(text):
            result = []
            i = 0
            while i < len(text):
                if text[i] == '<':
                    # Check if this looks like a generic type (not JSX)
                    j = i + 1
                    bracket_count = 1
                    type_content = ''
                    
                    while j < len(text) and bracket_count > 0:
                        if text[j] == '<':
                            bracket_count += 1
                        elif text[j] == '>':
                            bracket_count -= 1
                        type_content += text[j]
                        j += 1
                    
                    # Check if this is a type generic:
                    # - Contains uppercase letters that look like type names
                    # - Or contains 'typeof'
                    # - Contains square brackets for arrays
                    if any(c in type_content for c in ['[', 'typeof']) or \
                       (type_content and type_content[0].isupper() and '/' not in type_content):
                        # This looks like a generic type, skip it
                        i = j
                    else:
                        # This looks like JSX, keep it
                        result.append(text[i])
                        i += 1
                else:
                    result.append(text[i])
                    i += 1
            
            return ''.join(result)
        
        # Only apply if not breaking JSX
        content = re.sub(
            r'<([A-Z]\w*(?:\s*,\s*[A-Z]\w*)*|\w+\s*=\s*[^>]*|keyof\s+\w+|typeof\s+\w+)>',
            '',
            content
        )
        
        return content
    
    def _remove_return_types(self, content: str) -> str:
        """Remove function return type annotations"""
        # Pattern: (): ReturnType => ()
        # This includes async functions and arrow functions
        
        # Remove return types from function declarations
        content = re.sub(
            r'(?:function\s+\w+|)\s*\([^)]*\)\s*:\s*(?:[^=>{]+(?:<[^>]*>)*)(?=\s*[=>{])',
            lambda m: m.group(0).split(':')[0],
            content,
            flags=re.MULTILINE
        )
        
        # Remove return types from arrow functions
        content = re.sub(
            r'\)\s*:\s*(?:[^=>{]+(?:<[^>]*>)*)\s*(?==>)',
            ')',
            content,
            flags=re.MULTILINE
        )
        
        return content


def main():
    # Get the current script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("TypeScript to JavaScript Converter")
    print("="*60)
    print(f"Working directory: {script_dir}")
    
    # Initialize converter
    converter = TypeScriptToJavaScriptConverter()
    
    # Convert all .js and .jsx files
    converter.convert_directory(script_dir, ['.js', '.jsx'])


if __name__ == '__main__':
    main()
