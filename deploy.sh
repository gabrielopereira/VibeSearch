#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and build dependencies
sudo apt install -y python3-full python3.12-venv build-essential python3-dev

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install PyTorch and ChromaDB separately with TMPDIR setting to avoid memory issues
TMPDIR=/var/tmp pip install torch
TMPDIR=/var/tmp pip install chromadb==0.6.3

# Install remaining requirements
pip install sentence-transformers==2.5.1
pip install flask==3.0.2
pip install waitress==3.0.0

# Start the application
python3 run.py 