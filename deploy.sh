#!/bin/bash

echo "🚀 Starting deployment process..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Python and build dependencies
echo "🔧 Installing Python and build dependencies..."
sudo apt install -y python3-full python3.12-venv build-essential python3-dev

# Create and activate virtual environment
echo "🌐 Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install all requirements with TMPDIR setting to avoid disk space issues
echo "📥 Installing Python dependencies..."
TMPDIR=/var/tmp pip install -r requirements.txt

# Check for existing process and terminate it
echo "🔍 Checking for existing application process..."
if pgrep -f "python3 run.py" > /dev/null; then
    echo "⚠️ Found existing process, terminating..."
    pkill -f "python3 run.py"
    sleep 2
    echo "✅ Old process terminated"
else
    echo "ℹ️ No existing process found"
fi

# Start the application
echo "🚀 Starting new application instance..."
nohup ./venv/bin/python3 run.py > output.log 2>&1 &

# Wait a moment and check if the process is running
sleep 2
if pgrep -f "python3 run.py" > /dev/null; then
    echo "✅ Application started successfully!"
    echo "📝 Logs are being written to output.log"
else
    echo "❌ Failed to start application. Check output.log for details."
    exit 1
fi 