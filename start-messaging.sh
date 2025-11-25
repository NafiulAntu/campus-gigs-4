#!/bin/bash

# Hybrid Messaging System - Quick Start Script
# This script starts both backend and frontend servers

echo "🚀 Starting Campus Gigs Messaging System..."
echo ""

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -d "BackEnd" ] || [ ! -d "FrontEnd" ]; then
    echo "❌ Error: Please run this script from the Campus directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Start Backend Server
echo -e "${BLUE}Starting Backend Server...${NC}"
cd BackEnd
gnome-terminal --tab --title="Backend Server" -- bash -c "npm start; exec bash" 2>/dev/null || \
x-terminal-emulator -e "bash -c 'npm start; exec bash'" 2>/dev/null || \
start cmd.exe /k "npm start" 2>/dev/null || \
open -a Terminal.app "npm start" 2>/dev/null || \
echo "⚠️  Could not open terminal. Please manually run: cd BackEnd && npm start"

cd ..

# Wait a moment for backend to start
sleep 2

# Start Frontend Server
echo -e "${BLUE}Starting Frontend Server...${NC}"
cd FrontEnd
gnome-terminal --tab --title="Frontend Server" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
x-terminal-emulator -e "bash -c 'npm run dev; exec bash'" 2>/dev/null || \
start cmd.exe /k "npm run dev" 2>/dev/null || \
open -a Terminal.app "npm run dev" 2>/dev/null || \
echo "⚠️  Could not open terminal. Please manually run: cd FrontEnd && npm run dev"

cd ..

echo ""
echo -e "${GREEN}✅ Servers starting!${NC}"
echo ""
echo "📡 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 WebSocket: ws://localhost:5000"
echo ""
echo "📖 See MESSAGING_SYSTEM_GUIDE.md for usage instructions"
echo ""
echo "Press Ctrl+C in each terminal to stop the servers"
