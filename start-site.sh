#!/bin/bash

# Script to fully start the chess site
# This script navigates to the project directory, installs dependencies, builds, and starts the dev server

set -e  # Exit on any error

PROJECT_DIR="/home/farshad/Desktop/chessai-5/retro-cursor-friend-invite-time-sync-5487"

echo "Navigating to project directory: $PROJECT_DIR"
cd "$PROJECT_DIR"

echo "Installing dependencies..."
npm install

echo "Building the project..."
npm run build

echo "Starting the development server..."
npm run dev