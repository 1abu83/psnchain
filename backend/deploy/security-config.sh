#!/bin/bash

# Security configuration for PSNChain node

# Exit on any error
set -e

# Function to print status messages
print_status() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install security tools
print_status "Installing security tools..."
sudo apt install -y ufw fail2ban unattended-upgrades

# Configure firewall
print_status "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3000/tcp  # For frontend if needed
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configure automatic security updates
print_status "Configuring automatic security updates..."
sudo dpkg-reconfigure -f noninteractive unattended-upgrades

# Create psnchain user with restricted shell if not exists
print_status "Creating psnchain user..."
if ! id "psnchain" &>/dev/null; then
    sudo useradd -m -s /bin/bash psnchain
fi

# Set up proper file permissions
print_status "Setting up file permissions..."
sudo mkdir -p /home/psnchain/psnchain
sudo chown psnchain:psnchain /home/psnchain/psnchain
sudo chmod 750 /home/psnchain/psnchain

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/psnchain > /dev/null <<EOF
/home/psnchain/psnchain/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 psnchain psnchain
    sharedscripts
    postrotate
        systemctl reload psnchain
    endscript
}
EOF

# Set up backup directory
print_status "Setting up backup directory..."
sudo mkdir -p /home/psnchain/backups
sudo chown psnchain:psnchain /home/psnchain/backups
sudo chmod 700 /home/psnchain/backups

print_status "Security configuration completed!"