#!/bin/bash

# Campus Gigs OAuth Setup - Automated Helper
# This script opens all the necessary OAuth provider pages for you

echo ""
echo "🔐 Campus Gigs OAuth Setup Helper"
echo "=================================="
echo ""
echo "This will open all OAuth provider setup pages in your browser."
echo "Follow the instructions in OAUTH_COMPLETE_GUIDE.md for each one."
echo ""

read -p "Press Enter to start..."

echo ""
echo "Opening GitHub OAuth App Creation..."
start https://github.com/settings/developers
echo "✅ Create New OAuth App with:"
echo "   - Name: Campus Gigs"
echo "   - Homepage: http://localhost:3004"
echo "   - Callback: http://localhost:3000/api/auth/github/callback"
echo ""

read -p "Press Enter when you have GitHub Client ID and Secret..."

echo ""
echo "Opening Google Cloud Console..."
start https://console.cloud.google.com/apis/credentials
echo "✅ Create OAuth 2.0 Client ID with:"
echo "   - Type: Web application"
echo "   - Redirect URI: http://localhost:3000/api/auth/google/callback"
echo ""

read -p "Press Enter when you have Google Client ID and Secret..."

echo ""
echo "Opening LinkedIn Developers..."
start https://www.linkedin.com/developers/apps
echo "✅ Create App and add:"
echo "   - Redirect URL: http://localhost:3000/api/auth/linkedin/callback"
echo "   - Request 'Sign In with LinkedIn' product"
echo ""

read -p "Press Enter when you have LinkedIn Client ID and Secret..."

echo ""
echo "Now edit your .env file at:"
echo "d:/C-Gigs-React/Campus/BackEnd/.env"
echo ""
echo "Replace these lines with your actual credentials:"
echo ""
echo "GITHUB_CLIENT_ID=your_github_client_id"
echo "GITHUB_CLIENT_SECRET=your_github_client_secret"
echo "GOOGLE_CLIENT_ID=your_google_client_id"  
echo "GOOGLE_CLIENT_SECRET=your_google_client_secret"
echo "LINKEDIN_CLIENT_ID=your_linkedin_client_id"
echo "LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret"
echo ""

read -p "Press Enter after updating .env file..."

echo ""
echo "🔄 Restarting servers..."
cd d:/C-Gigs-React/Campus
npm run dev

echo ""
echo "✅ Setup complete! Test your OAuth buttons now!"
echo ""
