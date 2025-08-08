# Panduan Deploy KDE Blockchain Menggunakan Visual Studio Code

## Apakah Bisa Deploy Melalui Visual Studio Code?

**Ya, KDE Blockchain dapat dideploy melalui Visual Studio Code (VS Code)**. VS Code menyediakan berbagai fitur yang memudahkan proses deployment seperti terminal terintegrasi, extension untuk remote development, dan kemampuan untuk mengelola file konfigurasi dengan mudah.

## Cara Deploy Menggunakan Visual Studio Code

### 1. Persiapan Awal

1. **Install Extension yang Diperlukan**:
   - Install "Remote - SSH" extension untuk koneksi ke server
   - Install "GitLens" untuk manajemen Git yang lebih baik
   - Install "Docker" extension jika menggunakan container

2. **Koneksi ke Server**:
   - Buka Command Palette (Ctrl+Shift+P)
   - Pilih "Remote-SSH: Connect to Host"
   - Masukkan informasi koneksi SSH server Anda

### 2. Clone Repository

1. Buka terminal di VS Code (Ctrl+`)
2. Clone repository KDE Blockchain:
   ```bash
   git clone <url-repository>
   cd psnchain
   ```

### 3. Konfigurasi Deployment

1. Buka file `deploy/ubuntu-deploy.sh` di VS Code
2. Sesuaikan konfigurasi sesuai kebutuhan server Anda
3. Buka file `deploy/security-config.sh` untuk menyesuaikan pengaturan keamanan
4. Periksa file `deploy/psnchain.service` untuk konfigurasi systemd

### 4. Jalankan Deployment

1. Buka terminal terintegrasi di VS Code
2. Berikan hak akses eksekusi pada script:
   ```bash
   chmod +x deploy/ubuntu-deploy.sh
   chmod +x deploy/security-config.sh
   ```

3. Jalankan script deployment dengan hak akses root:
   ```bash
   sudo ./deploy/ubuntu-deploy.sh
   ```

### 5. Monitoring Melalui VS Code

1. **Melihat Log Real-time**:
   - Gunakan terminal di VS Code untuk menjalankan:
   ```bash
   sudo journalctl -u psnchain -f
   ```

2. **Cek Status Service**:
   ```bash
   sudo systemctl status psnchain
   ```

3. **Restart Service** (jika diperlukan):
   ```bash
   sudo systemctl restart psnchain
   ```

## Keuntungan Menggunakan VS Code untuk Deployment

1. **Terminal Terintegrasi**: Tidak perlu beralih antar aplikasi
2. **Syntax Highlighting**: Memudahkan editing file konfigurasi
3. **Remote Development**: Dapat langsung bekerja di server
4. **Version Control**: Integrasi Git untuk tracking perubahan
5. **File Explorer**: Navigasi file yang intuitif

## Fitur Keamanan yang Diimplementasikan

1. **Firewall Configuration**: Hanya port yang diperlukan yang dibuka
2. **Fail2Ban**: Proteksi terhadap serangan brute force
3. **Automatic Updates**: Pembaruan keamanan otomatis
4. **User Isolation**: Pengguna khusus untuk service blockchain
5. **File Permissions**: Hak akses file yang ketat

## Verifikasi Setelah Deployment

1. **Cek Integritas Blockchain**:
   ```bash
   sudo -u psnchain node /home/psnchain/psnchain/deploy/verify-integrity.js
   ```

2. **Pastikan Service Berjalan**:
   ```bash
   sudo systemctl status psnchain
   ```

3. **Cek Log untuk Error**:
   ```bash
   sudo journalctl -u psnchain --no-pager | grep -i error
   ```

## Troubleshooting

1. **Jika Service Tidak Start**:
   - Cek log: `sudo journalctl -u psnchain`
   - Verifikasi permission file
   - Pastikan semua dependencies terinstall

2. **Masalah Koneksi Firewall**:
   - Cek status firewall: `sudo ufw status`
   - Verifikasi rules yang aktif

3. **Masalah Permission**:
   - Cek ownership: `ls -la /home/psnchain/psnchain`
   - Perbaiki jika diperlukan: `sudo chown -R psnchain:psnchain /home/psnchain/psnchain`

## Kesimpulan

Visual Studio Code merupakan tools yang sangat efektif untuk deploy KDE Blockchain karena kemampuannya dalam remote development dan manajemen file. Dengan mengikuti panduan ini, Anda dapat dengan mudah mendeploy KDE Blockchain secara aman dan terstruktur menggunakan VS Code.