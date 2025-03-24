#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip if not already installed
sudo apt install -y python3-full python3.12-venv

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start the application
python3 run.py 