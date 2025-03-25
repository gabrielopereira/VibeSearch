#!/bin/bash

echo "🚀 Starting deployment process..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Python, build dependencies, and Supervisor
echo "🔧 Installing Python, build dependencies, and Supervisor..."
sudo apt install -y python3-full python3.12-venv build-essential python3-dev supervisor

# Create and activate virtual environment
echo "🌐 Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install all requirements with TMPDIR setting to avoid disk space issues
echo "📥 Installing Python dependencies..."
TMPDIR=/var/tmp pip install -r requirements.txt

# Create Supervisor configuration
echo "⚙️ Setting up Supervisor configuration..."
cat > vibesearch.conf << EOL
[program:vibesearch]
command=$(pwd)/venv/bin/python3 run.py
directory=$(pwd)
user=$USER
autostart=true
autorestart=true
stderr_logfile=$(pwd)/output.log
stdout_logfile=$(pwd)/output.log
environment=PYTHONUNBUFFERED=1
startsecs=5
startretries=3
stopwaitsecs=10
killasgroup=true
stopasgroup=true
EOL

# Move Supervisor config to correct location
echo "📁 Installing Supervisor configuration..."
sudo cp -f vibesearch.conf /etc/supervisor/conf.d/

# Reload Supervisor configuration
echo "🔄 Reloading Supervisor configuration..."
sudo supervisorctl reread
sudo supervisorctl update

# Stop existing process if running
echo "🔍 Checking for existing application process..."
if sudo supervisorctl status vibesearch | grep -q "RUNNING"; then
    echo "⚠️ Found existing process, stopping..."
    sudo supervisorctl stop vibesearch
    sleep 2
    echo "✅ Old process stopped"
else
    echo "ℹ️ No existing process found"
fi

# Start the application with Supervisor
echo "🚀 Starting new application instance..."
sudo supervisorctl start vibesearch

# Wait a moment and check if the process is running
sleep 2
if sudo supervisorctl status vibesearch | grep -q "RUNNING"; then
    echo "✅ Application started successfully!"
    echo "📝 Logs are being written to output.log"
    echo "🔄 Auto-restart is enabled. If the application crashes, it will automatically restart."
    echo "📊 You can check the status anytime with: sudo supervisorctl status vibesearch"
else
    echo "❌ Failed to start application. Check output.log for details."
    exit 1
fi 