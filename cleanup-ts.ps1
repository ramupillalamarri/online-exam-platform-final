$content = Get-Content -Path lib/store.jsx -Raw

# 1. Remove import type statements - change "import type {" to "import {"
$content = $content -replace 'import\s+type\s+\{', 'import {'

# 2. Remove type array annotations (: Type[])
$content = $content -replace ':\s*(Folder|Exam|Question|Attempt|Answer|AIFeedback)\[\]', ''

# 3. Remove const variable type annotations (const name: Type = )
$content = $content -replace 'const\s+(\w+):\s*(User|Folder|Exam|Question|Attempt|Answer|AIFeedback)\s*=\s*', 'const $1 = '

# 4. Remove generic type from create call (create<Type>() -> create())
$content = $content -replace 'create<ExamStore>\(\)', 'create()'

# 5. Remove entire interface definition block - use a more careful approach
$lines = $content -split "`n"
$newLines = @()
$skipMode = $false
$braceDepth = 0

foreach ($line in $lines) {
    # Check if this line starts the interface
    if ($line -match '^\s*interface\s+ExamStore\s*{') {
        $skipMode = $true
        $braceDepth = 1
        continue
    }
    
    if ($skipMode) {
        # Count braces to find the end of the interface
        $braceDepth += ([regex]::Matches($line, '{').Count)
        $braceDepth -= ([regex]::Matches($line, '}').Count)
        
        if ($braceDepth -le 0) {
            $skipMode = $false
        }
        continue
    }
    
    $newLines += $line
}

$content = $newLines -join "`n"

# Save the file
$content | Set-Content -Path lib/store.jsx -Encoding UTF8 -Force

Write-Host "TypeScript removal complete - $(( Get-Content lib/store.jsx | Measure-Object -Line).Lines) lines"
