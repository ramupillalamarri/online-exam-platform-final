#!/usr/bin/env python3
import re
import os

files_to_fix = {
    'app/admin/exams/[id]/questions/page.jsx': [
        ('const updateOption = (id: string, text: string) =>', 'const updateOption = (id, text) =>'),
    ],
    'app/admin/folders/page.jsx': [
        ('const getExamCount = (folderId: string) =>', 'const getExamCount = (folderId) =>'),
    ],
    'app/exam/[id]/page.jsx': [
        ('const formatTime = (seconds: number) =>', 'const formatTime = (seconds) =>'),
        ('async (optionId: string) =>', 'async (optionId) =>'),
        ('const getQuestionStatus = (questionId: string) =>', 'const getQuestionStatus = (questionId) =>'),
    ],
    'app/student/exams/page.jsx': [
        ('const getAttemptStatus = (examId: string) =>', 'const getAttemptStatus = (examId) =>'),
    ],
}

for filepath, replacements in files_to_fix.items():
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements:
            content = content.replace(old, new)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'✅ Fixed: {filepath}')
    else:
        print(f'❌ Not found: {filepath}')

print('\n✅ All type annotations removed!')
