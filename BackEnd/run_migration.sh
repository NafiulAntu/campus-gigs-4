#!/bin/bash
# Migration script to add profession and username to users table

echo "🔄 Running database migration..."

# Run the SQL migration
psql -U postgres -d campusgig -f migrations/add_profession_username.sql

echo "✅ Migration completed successfully!"
echo ""
echo "📋 Changes made:"
echo "  - Added 'profession' column to users table"
echo "  - Added 'username' column to users table"
echo "  - Created indexes for faster lookups"
echo ""
echo "🎯 Next steps:"
echo "  1. Restart your backend server"
echo "  2. Login to your account"
echo "  3. Set your profession in the profile"
echo "  4. Your profession will now persist across page refreshes!"
