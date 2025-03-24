#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip if not already installed
sudo apt install -y python3 python3-pip

# Install virtualenv
sudo pip3 install virtualenv

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start the application
python run.py 