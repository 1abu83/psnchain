#!/bin/bash

# PSNChain Ubuntu Deployment Script with Enhanced Security

# Exit on any error
set -e

# Function to print status messages
print_status() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_status "Please run as root (use sudo)"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
print_status "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Run security configuration
print_status "Running security configuration..."
chmod +x ./security-config.sh
./security-config.sh

# Create directories
print_status "Creating directories..."
sudo mkdir -p /home/psnchain/psnchain
sudo chown psnchain:psnchain /home/psnchain/psnchain

# Copy files (assuming this script is run from the project root)
print_status "Copying files..."
sudo cp -r . /home/psnchain/psnchain/
sudo chown -R psnchain:psnchain /home/psnchain/psnchain

# Create logs directory
print_status "Creating logs directory..."
sudo mkdir -p /home/psnchain/psnchain/logs
sudo chown psnchain:psnchain /home/psnchain/psnchain/logs

# Install dependencies
print_status "Installing dependencies..."
sudo -u psnchain npm install --prefix /home/psnchain/psnchain

# Install systemd service
print_status "Installing systemd service..."
sudo cp /home/psnchain/psnchain/deploy/psnchain.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable psnchain

# Setup SSL certificates (optional, requires manual domain configuration)
print_status "Setting up SSL (optional)..."
# This would typically involve Let's Encrypt setup
# sudo apt install -y certbot
# sudo certbot certonly --standalone -d your-domain.com

# Start the service
print_status "Starting PSNChain node..."
sudo systemctl start psnchain

# Wait a moment for the service to start
sleep 5

# Verify data integrity
print_status "Verifying data integrity..."
sudo -u psnchain node /home/psnchain/psnchain/deploy/verify-integrity.js

# Show status
print_status "PSNChain node status:"
sudo systemctl status psnchain

print_status "Deployment completed!"
print_status "You can check the logs with: sudo journalctl -u psnchain -f"
print_status "Security measures have been applied including firewall, fail2ban, and automatic updates."