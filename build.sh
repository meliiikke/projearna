#!/bin/bash

echo "Building ARNA Energy Project..."

echo ""
echo "Building Backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Backend build failed!"
    exit 1
fi

echo ""
echo "Building Frontend..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Frontend build failed!"
    exit 1
fi

npm run build
if [ $? -ne 0 ]; then
    echo "Frontend build failed!"
    exit 1
fi

echo ""
echo "Build completed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway"
echo "2. Deploy frontend to Netlify"
echo "3. Configure Cloudinary environment variables"
echo ""
