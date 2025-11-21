@echo off
REM Profile Persistence Fix - Migration Runner (Windows)
REM This script adds fullName and phone columns to profile tables

echo ========================================
echo Profile Persistence Fix - Migration
echo ========================================
echo.

REM Database configuration
set DB_USER=postgres
set DB_NAME=PG Antu
set DB_PASSWORD=antu@1972
set PGSQL_PATH=C:\Program Files\PostgreSQL\18\bin\psql.exe
set MIGRATION_FILE=migrations\add_fullname_phone_to_profiles.sql

REM Check if migration file exists
if not exist "%MIGRATION_FILE%" (
    echo ❌ Error: Migration file not found: %MIGRATION_FILE%
    pause
    exit /b 1
)

echo 📦 Running migration...
echo Database: %DB_NAME%
echo User: %DB_USER%
echo.

REM Run migration
set PGPASSWORD=%DB_PASSWORD%
"%PGSQL_PATH%" -U %DB_USER% -d "%DB_NAME%" -f %MIGRATION_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Migration completed successfully!
    echo.
    echo Next steps:
    echo 1. Restart your backend server
    echo 2. Login to your account
    echo 3. Fill in your complete profile
    echo 4. Save and refresh - all data will persist!
    echo.
) else (
    echo.
    echo ❌ Migration failed. Please check the error messages above.
    echo.
)

pause
