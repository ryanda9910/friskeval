# patdown — frisk your diff before it ships (Windows installer). Safe to re-run.
#   irm https://raw.githubusercontent.com/ryanda9910/friskeval/main/install.ps1 | iex
$ErrorActionPreference = "Stop"
$RAW  = "https://raw.githubusercontent.com/ryanda9910/friskeval/main/skill/SKILL.md"
$NAME = "patdown"

Write-Host "patdown - installing the diff pat-down skill"
$skill = (Invoke-WebRequest -UseBasicParsing -Uri $RAW).Content
if (-not $skill) { throw "could not download SKILL.md" }

$installed = $false

# Claude Code - native skill
$claude = Join-Path $HOME ".claude\skills\$NAME"
New-Item -ItemType Directory -Force -Path $claude | Out-Null
Set-Content -Path (Join-Path $claude "SKILL.md") -Value $skill -NoNewline
Write-Host "  + Claude Code   $claude\SKILL.md"
$installed = $true

# Project-local (opt-in: pass -project)
if ($args -contains "-project") {
  $proj = ".claude\skills\$NAME"
  New-Item -ItemType Directory -Force -Path $proj | Out-Null
  Set-Content -Path (Join-Path $proj "SKILL.md") -Value $skill -NoNewline
  Write-Host "  + This project  $proj\SKILL.md"
}

# Other agents that read a rules/AGENTS file
foreach ($d in @(".codex", ".cursor", ".gemini")) {
  $dir = Join-Path $HOME $d
  if (Test-Path $dir) {
    $sub = Join-Path $dir "patdown"
    New-Item -ItemType Directory -Force -Path $sub | Out-Null
    Set-Content -Path (Join-Path $sub "patdown.md") -Value $skill -NoNewline
    Write-Host "  + $d         $sub\patdown.md"
    $installed = $true
  }
}

Write-Host ""
if ($installed) {
  Write-Host "  Done. Your agent will pat down its own diffs before saying ""done""."
  Write-Host "  Force a check anytime with:  /patdown"
}
