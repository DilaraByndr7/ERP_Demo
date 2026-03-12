@echo off
if "%PGDATA%"=="" set "PGDATA=%USERPROFILE%\postgres-data"
if "%PG_BIN_DIR%"=="" set "PG_BIN_DIR=%USERPROFILE%\Downloads\postgresql-18.3-2-windows-x64-binaries\pgsql\bin"
set "PGCTL=%PG_BIN_DIR%\pg_ctl.exe"
set "PGLOG=%PGDATA%\logfile.txt"

if not exist "%PGDATA%" exit /b 1
if not exist "%PGCTL%" exit /b 1

"%PGCTL%" status -D "%PGDATA%" >nul 2>&1
if %errorlevel%==0 exit /b 0

"%PGCTL%" -D "%PGDATA%" -l "%PGLOG%" start
