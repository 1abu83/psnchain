# KDE Blockchain Deployment Guide

This guide explains how to deploy the KDE Blockchain on a secure virtual environment.

## Prerequisites

- Ubuntu 20.04 or higher server
- Root or sudo access
- At least 2GB RAM and 20GB disk space

## Deployment Steps

### 1. Prepare the Server

1. Update your system:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Install necessary tools:
   ```bash
   sudo apt install -y git curl
   ```

### 2. Clone the Repository

```bash
git clone <repository-url>
cd psnchain
```

### 3. Run the Deployment Script

The deployment script will:
- Install Node.js and npm
- Configure security settings (firewall, fail2ban, automatic updates)
- Create a dedicated user for the service
- Set up proper file permissions
- Install dependencies
- Configure systemd service
- Start the service

Run the deployment script:
```bash
chmod +x deploy/ubuntu-deploy.sh
sudo ./deploy/ubuntu-deploy.sh
```

### 4. Verify Deployment

Check if the service is running:
```bash
sudo systemctl status psnchain
```

View logs:
```bash
sudo journalctl -u psnchain -f
```

### 5. Security Features Included

The deployment includes several security measures:

1. **Firewall Configuration**: Only essential ports are open
2. **Fail2Ban**: Protection against brute force attacks
3. **Automatic Security Updates**: Keeps the system up to date
4. **Dedicated Service User**: Runs with minimal privileges
5. **Secure File Permissions**: Proper ownership and access controls
6. **Log Rotation**: Prevents disk space issues
7. **Systemd Hardening**: Additional security settings in the service file

### 6. Network Configuration

The deployment script configures the firewall to allow:
- SSH (port 22)
- HTTP (port 80)
- HTTPS (port 443)
- Frontend (port 3000)

Additional ports can be opened by modifying the `deploy/security-config.sh` script.

### 7. SSL Configuration (Optional)

To enable SSL for secure communication:
1. Install Certbot:
   ```bash
   sudo apt install -y certbot
   ```
2. Obtain SSL certificate:
   ```bash
   sudo certbot certonly --standalone -d your-domain.com
   ```
3. Configure the frontend to use HTTPS

### 8. Monitoring and Maintenance

- Check service status: `sudo systemctl status psnchain`
- View logs: `sudo journalctl -u psnchain -f`
- Restart service: `sudo systemctl restart psnchain`
- View system logs: `sudo journalctl -f`

### 9. Backup and Recovery

Regular backups are stored in `/home/psnchain/backups`. To create a manual backup:
```bash
sudo -u psnchain cp -r /home/psnchain/psnchain /home/psnchain/backups/psnchain-$(date +%Y%m%d)
```

### 10. Troubleshooting

If the service fails to start:
1. Check logs: `sudo journalctl -u psnchain`
2. Verify file permissions: `ls -la /home/psnchain/psnchain`
3. Check dependencies: `sudo -u psnchain npm install --prefix /home/psnchain/psnchain`

## Post-Deployment Verification

After deployment, verify that:
1. The service is running: `sudo systemctl status psnchain`
2. The firewall is active: `sudo ufw status`
3. Fail2ban is running: `sudo systemctl status fail2ban`
4. The application is accessible on the configured ports