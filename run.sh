#!/bin/bash

echo "🚀 Starting euantix Virtual MCU Bridge..."

# 1. Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 First run detected. Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies. Please ensure Node.js is installed."
        exit 1
    fi
fi

# 2. Run the Bridge
echo "🟢 Launching Bridge Client..."
node index.js
