[CmdletBinding()]
param(
    # Root directory to scan for Markdown files (defaults to repository root)
    [Parameter(Position = 0)]
    [string]$Path = '.',

    # File names to exclude from scanning (e.g. README.md)
    [Parameter()]
    [string[]]$Exclude = @()
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

function Test-MermaidCli {
    return $null -ne (Get-Command mmdc -ErrorAction SilentlyContinue)
}

function ConvertTo-Slug {
    param([string]$Text)
    # Strip markdown bold/italic/code markers, then convert to kebab-case
    $clean = $Text -replace '[*_`#]', '' -replace '[^\w\s-]', ''
    $slug  = $clean.Trim() -replace '\s+', '-' -replace '-+', '-'
    return $slug.ToLower()
}

function Get-MermaidBlocks {
    param([string]$FilePath)

    $lines   = Get-Content $FilePath -Encoding UTF8
    $blocks  = [System.Collections.Generic.List[PSCustomObject]]::new()
    $heading = ''
    $inBlock = $false
    $buffer  = [System.Collections.Generic.List[string]]::new()

    foreach ($line in $lines) {
        # Track nearest preceding ATX heading
        if (-not $inBlock -and $line -match '^#{1,6}\s+(.+)$') {
            $heading = $matches[1].Trim()
        }

        # Opening fence
        if (-not $inBlock -and $line -match '^\s*```mermaid\s*$') {
            $inBlock = $true
            $buffer.Clear()
            continue
        }

        # Closing fence
        if ($inBlock -and $line -match '^\s*```\s*$') {
            $inBlock = $false
            $blocks.Add([PSCustomObject]@{
                Heading = $heading
                Content = $buffer -join "`n"
            })
            continue
        }

        if ($inBlock) {
            $buffer.Add($line)
        }
    }

    return $blocks
}

# ---------------------------------------------------------------------------
# Pre-flight check
# ---------------------------------------------------------------------------

if (-not (Test-MermaidCli)) {
    Write-Error @"
Mermaid CLI (mmdc) not found in PATH.
Install it with:
    npm install -g @mermaid-js/mermaid-cli
"@
    exit 1
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

$resolvedRoot = Resolve-Path $Path
Write-Host "Scanning: $resolvedRoot"

$mdFiles = Get-ChildItem -Path $resolvedRoot -Filter '*.md' -Recurse -File |
    Where-Object { $Exclude -notcontains $_.Name }

$totalGenerated = 0
$totalFailed    = 0

foreach ($mdFile in $mdFiles) {
    $blocks = Get-MermaidBlocks -FilePath $mdFile.FullName
    if ($blocks.Count -eq 0) { continue }

    # Output folder: diagrams/ next to the source markdown file
    $diagramsDir = Join-Path $mdFile.DirectoryName 'diagrams'
    if (-not (Test-Path $diagramsDir)) {
        New-Item -ItemType Directory -Path $diagramsDir | Out-Null
    }

    # Track slug usage within this file to handle duplicate headings
    $slugCounts = @{}

    foreach ($block in $blocks) {
        $baseSlug = if ($block.Heading) { ConvertTo-Slug $block.Heading } else { 'diagram' }

        if ($slugCounts.ContainsKey($baseSlug)) {
            $slugCounts[$baseSlug]++
            $slug = "$baseSlug-$($slugCounts[$baseSlug])"
        } else {
            $slugCounts[$baseSlug] = 0
            $slug = $baseSlug
        }

        $svgName = "$($mdFile.BaseName)-$slug.svg"
        $svgPath = Join-Path $diagramsDir $svgName

        # Write a temporary .mmd file for mmdc
        $tempMmd = Join-Path ([System.IO.Path]::GetTempPath()) ([System.IO.Path]::GetRandomFileName() + '.mmd')
        $block.Content | Set-Content $tempMmd -Encoding UTF8

        try {
            $output = & mmdc -i $tempMmd -o $svgPath 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Generated: $(Resolve-Path $svgPath -Relative -RelativeTo $resolvedRoot)"
                $totalGenerated++
            } else {
                Write-Warning "  Failed: $svgName`n  $($output -join ' ')"
                $totalFailed++
            }
        } finally {
            Remove-Item $tempMmd -ErrorAction SilentlyContinue
        }
    }
}

Write-Host ''
Write-Host "Done. Generated: $totalGenerated SVG(s)   Failed: $totalFailed"

if ($totalFailed -gt 0) { exit 1 }
exit 0
