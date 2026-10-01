@echo off
setlocal
cd /d "%~dp0"
set "ARQ=netlify\functions\api.js"
set "NOVO=netlify\functions\api.cjs"

echo.
echo ================================================
echo TECHSHOP - CORRECAO DA FUNCTION API
 echo ================================================
echo.

if not exist "%ARQ%" (
  if exist "%NOVO%" (
    echo OK: api.cjs ja existe.
    echo.
    echo Proximo passo: faca commit e deploy no Netlify.
    pause
    exit /b 0
  )
  echo ERRO: nao encontrei netlify\functions\api.js
  echo Execute este arquivo na pasta raiz do seu projeto TechShop.
  echo.
  pause
  exit /b 1
)

if exist "%NOVO%" (
  echo AVISO: api.cjs ja existe. Nada foi alterado.
  pause
  exit /b 0
)

ren "%ARQ%" "api.cjs"
if errorlevel 1 (
  echo ERRO ao renomear api.js para api.cjs.
  pause
  exit /b 1
)

echo.
echo CORRIGIDO COM SUCESSO!
echo api.js -> api.cjs
 echo.
echo A function continuara com o nome /api no Netlify.
echo Agora faca commit/push para o GitHub e rode um novo deploy.
echo.
pause
