@echo off
echo ========================================
echo PostgreSQL Password Reset Helper
echo ========================================
echo.
echo Current .env password: antu@1972
echo.
echo Step 1: Reset PostgreSQL Password
echo ----------------------------------
echo Run this command in Command Prompt (as Administrator):
echo.
echo psql -U postgres -c "ALTER USER postgres PASSWORD 'antu@1972';"
echo.
echo If psql is not found, use pgAdmin:
echo 1. Open pgAdmin
echo 2. Connect to PostgreSQL server (use your current password)
echo 3. Right-click "PostgreSQL" server -^> Properties
echo 4. Go to "Connection" tab
echo 5. Or open Query Tool and run:
echo    ALTER USER postgres PASSWORD 'antu@1972';
echo.
echo Step 2: Create Database (if not exists)
echo ----------------------------------------
echo In pgAdmin Query Tool or psql, run:
echo CREATE DATABASE "PG Antu";
echo.
echo Step 3: Run Setup Script
echo -------------------------
echo After resetting password, run:
echo node setup-database.js
echo.
echo ========================================
echo Press any key to try common passwords...
pause > nul

echo.
echo Testing connection with different passwords...
echo.

REM Try with empty password
echo Trying empty password...
node -e "const {Pool}=require('pg');const p=new Pool({host:'localhost',port:5432,database:'PG Antu',user:'postgres',password:''});p.query('SELECT 1').then(()=>{console.log('SUCCESS: Empty password works!');process.exit(0);}).catch(()=>{console.log('Failed: Empty password');});" 2>nul

REM Try with postgres
timeout /t 1 >nul
echo Trying password: postgres...
node -e "const {Pool}=require('pg');const p=new Pool({host:'localhost',port:5432,database:'PG Antu',user:'postgres',password:'postgres'});p.query('SELECT 1').then(()=>{console.log('SUCCESS: password is postgres');process.exit(0);}).catch(()=>{console.log('Failed: postgres');});" 2>nul

REM Try with admin
timeout /t 1 >nul
echo Trying password: admin...
node -e "const {Pool}=require('pg');const p=new Pool({host:'localhost',port:5432,database:'PG Antu',user:'postgres',password:'admin'});p.query('SELECT 1').then(()=>{console.log('SUCCESS: password is admin');process.exit(0);}).catch(()=>{console.log('Failed: admin');});" 2>nul

REM Try with antu@1972
timeout /t 1 >nul
echo Trying password: antu@1972...
node -e "const {Pool}=require('pg');const p=new Pool({host:'localhost',port:5432,database:'PG Antu',user:'postgres',password:'antu@1972'});p.query('SELECT 1').then(()=>{console.log('SUCCESS: password is antu@1972');process.exit(0);}).catch(()=>{console.log('Failed: antu@1972');});" 2>nul

echo.
echo ========================================
echo If none worked, you must reset the password in pgAdmin!
echo ========================================
pause
