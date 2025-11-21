#!/bin/bash

# Profile Persistence Fix - Migration Runner
# This script adds fullName and phone columns to profile tables

echo "========================================"
echo "Profile Persistence Fix - Migration"
echo "========================================"
echo ""

# Database configuration
DB_USER="postgres"
DB_NAME="PG Antu"
DB_PASSWORD="antu@1972"
PSQL_PATH="/c/Program Files/PostgreSQL/18/bin/psql"
MIGRATION_FILE="migrations/add_fullname_phone_to_profiles.sql"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📦 Running migration..."
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Run migration
PGPASSWORD="$DB_PASSWORD" "$PGSQL_PATH" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Restart your backend server"
    echo "2. Login to your account"
    echo "3. Fill in your complete profile"
    echo "4. Save and refresh - all data will persist!"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Please check the error messages above."
    echo ""
fi
