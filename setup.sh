#!/bin/bash

# CogniChat Setup Script
# Run this script on a new laptop to set up the application

echo "🚀 Setting up CogniChat..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version is too old. Please upgrade to version 14 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run build test
echo "🔨 Testing production build..."
npm run build > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Production build failed"
    exit 1
fi

echo "✅ Production build successful"

# Clean up build folder to save space
rm -rf build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm start"
echo ""
echo "To create a production build:"
echo "  npm run build"
echo ""
echo "To run deployment check:"
echo "  npm run deploy-check"
echo ""
echo "📚 Check README.md for more information"
