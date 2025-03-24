#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and build dependencies
sudo apt install -y python3-full python3.12-venv build-essential python3-dev

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install all requirements with TMPDIR setting to avoid disk space issues
TMPDIR=/var/tmp pip install -r requirements.txt

# Start the application
nohup ./venv/bin/python3 run.py > output.log 2>&1 & 