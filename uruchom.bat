@echo off
chcp 65001 >nul
title RTS 2D Multiplayer
mode con: cols=120 lines=45

cd /d "%~dp0"

echo ========================================
echo   RTS 2D Multiplayer - uruchamianie
echo ========================================
echo.

if not exist "node_modules\" (
    echo Instalowanie zaleznosci...
    call npm install
    if errorlevel 1 (
        echo.
        echo Blad instalacji. Sprawdz czy masz zainstalowany Node.js.
        pause
        exit /b 1
    )
    echo.
)

echo Uruchamianie serwera deweloperskiego...
echo.
echo Gra lokalnie (tylko u Ciebie):
echo   http://localhost:5173
echo.
echo Dla graczy w Radmin VPN (adres IP z aplikacji Radmin):
echo   http://TWOJE_IP_RADMIN:5173
echo   np. http://26.12.34.56:5173
echo.
echo Inni gracze NIE musza instalowac Node.js - wystarczy przegladarka.
echo Tylko host uruchamia ten plik .bat
echo.
echo Aby zatrzymac serwer, zamknij to okno lub wcisnij Ctrl+C.
echo.

call npm run dev

pause
