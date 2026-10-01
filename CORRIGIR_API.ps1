$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$old = Join-Path $root 'netlify/functions/api.js'
$new = Join-Path $root 'netlify/functions/api.cjs'
Write-Host ''
Write-Host 'TECHSHOP - CORRECAO API' -ForegroundColor Cyan
if (Test-Path $new) {
  Write-Host 'api.cjs ja existe. Nenhuma alteracao foi feita.' -ForegroundColor Yellow
  exit 0
}
if (-not (Test-Path $old)) {
  throw 'Nao encontrei netlify/functions/api.js. Execute este script na raiz do projeto TechShop.'
}
Rename-Item -Path $old -NewName 'api.cjs'
Write-Host 'OK: api.js foi renomeado para api.cjs.' -ForegroundColor Green
Write-Host 'Agora faca commit/push no GitHub e rode um novo deploy no Netlify.' -ForegroundColor Green
