@echo off
echo Running PostgreSQL migrations...
echo.
echo Creating jobs tables...
psql -U postgres -d "PG Antu" -f create_jobs_table.sql
echo.
echo Seeding demo jobs...
psql -U postgres -d "PG Antu" -f seed_demo_jobs.sql
echo.
echo Done!
pause
