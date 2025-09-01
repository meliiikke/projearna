#!/bin/bash

echo "🚀 Starting ARNA Energy Build Process..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed successfully"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependencies installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed successfully"

# Build frontend
echo "🔨 Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend build completed successfully"

# Go back to root
cd ..

echo "🎉 Build process completed successfully!"
echo "📁 Frontend build output: frontend/build/"
echo "🚀 Backend ready to start: cd backend && npm start"
