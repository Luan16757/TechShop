$ErrorActionPreference = 'Stop'

$functionsDir = Join-Path $PSScriptRoot 'netlify/functions'
$oldApi = Join-Path $functionsDir 'api.js'
$newApi = Join-Path $functionsDir 'api.cjs'

Write-Host ''
Write-Host 'TECHSHOP - CORRECAO NETLIFY API' -ForegroundColor Cyan
Write-Host '================================' -ForegroundColor Cyan

if (Test-Path $oldApi) {
    Remove-Item $oldApi -Force
    Write-Host 'OK: api.js antigo removido.' -ForegroundColor Green
} else {
    Write-Host 'OK: api.js antigo nao encontrado.' -ForegroundColor Green
}

if (-not (Test-Path $newApi)) {
    throw 'ERRO: api.cjs nao encontrado em netlify/functions.'
}

Write-Host 'OK: api.cjs encontrado.' -ForegroundColor Green

Push-Location $PSScriptRoot
try {
    if (Get-Command git -ErrorAction SilentlyContinue) {
        git add -A
        Write-Host ''
        Write-Host 'Arquivos preparados para commit:' -ForegroundColor Yellow
        git status --short
        Write-Host ''
        Write-Host 'Agora execute:' -ForegroundColor Cyan
        Write-Host 'git commit -m "Corrige Netlify api para CommonJS"'
        Write-Host 'git push'
    } else {
        Write-Host 'Git nao encontrado. Envie os arquivos para o GitHub manualmente.' -ForegroundColor Yellow
    }
}
finally {
    Pop-Location
}
