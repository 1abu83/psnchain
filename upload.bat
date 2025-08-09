@echo off
echo Uploading PSNChain to VPS...

REM Create remote directory
ssh root@147.93.81.226 "mkdir -p /root/psnchain"

REM Upload backend
echo Uploading backend...
scp -r backend root@147.93.81.226:/root/psnchain/

REM Upload frontend  
echo Uploading frontend...
scp -r fontend root@147.93.81.226:/root/psnchain/

REM Upload nginx config
echo Uploading nginx...
scp -r nginx root@147.93.81.226:/root/psnchain/

REM Upload deployment scripts
echo Uploading scripts...
scp deploy-*.sh root@147.93.81.226:/root/psnchain/
scp docker-compose.yml root@147.93.81.226:/root/psnchain/
scp *.md root@147.93.81.226:/root/psnchain/

REM Make scripts executable
echo Making scripts executable...
ssh root@147.93.81.226 "cd /root/psnchain && chmod +x *.sh"

echo Upload completed!
echo.
echo Next steps:
echo 1. SSH to VPS: ssh root@147.93.81.226
echo 2. Navigate to project: cd /root/psnchain  
echo 3. Run deployment: ./deploy-backend-only.sh 147.93.81.226
echo.
pause