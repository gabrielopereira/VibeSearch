#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and build dependencies
# Note: screen is installed for persistent execution
sudo apt install -y python3-full python3.12-venv build-essential python3-dev screen

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install all requirements with TMPDIR setting to avoid disk space issues
TMPDIR=/var/tmp pip install -r requirements.txt

# Start the application in a screen session
# Usage:
# - The application will start in a screen session named 'vibesearch'
# - To detach from the screen: Press Ctrl+A, then D
# - To reattach to the screen: screen -r vibesearch
# - To list all screens: screen -ls
# - To kill the screen: screen -X -S vibesearch quit
screen -dmS vibesearch python3 run.py 