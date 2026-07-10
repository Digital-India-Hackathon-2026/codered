$paths = @(
    'c:\Users\varun\Downloads\LifeLens\src',
    'c:\Users\varun\Downloads\LifeLens\__tests__',
    'c:\Users\varun\Downloads\LifeLens\docs'
)
$rootFiles = Get-ChildItem -Path 'c:\Users\varun\Downloads\LifeLens' -File -Filter *.js
$rootFiles += Get-ChildItem -Path 'c:\Users\varun\Downloads\LifeLens' -File -Filter *.ts
$rootFiles += Get-ChildItem -Path 'c:\Users\varun\Downloads\LifeLens' -File -Filter *.json

$allFiles = @()
foreach ($p in $paths) {
    if (Test-Path $p) {
        $allFiles += Get-ChildItem -Path $p -Include *.ts,*.tsx,*.js,*.json -Recurse -File
    }
}
$allFiles += $rootFiles

foreach ($f in $allFiles) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $prefix = "// LifeLens - CodeRed Hackathon 2026``n"
    $bom = [char]0xFEFF
    $changed = $false
    if ($content.StartsWith($bom + $prefix)) {
        $content = $content.Substring($bom.ToString().Length + $prefix.Length)
        $changed = $true
    } elseif ($content.StartsWith($prefix)) {
        $content = $content.Substring($prefix.Length)
        $changed = $true
    }
    if ($changed) {
        [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed: $($f.FullName)"
    }
}
Write-Host "Done!"
