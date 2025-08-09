# Panduan Deploy KDE Blockchain di Google Cloud Platform (GCP) VM

## Informasi Instance

- **Nama Instance**: instance-20250808-152810
- **Zona**: us-central1-c
- **IP Internal**: 10.128.0.2 (nic0)
- **IP Eksternal**: 35.239.230.16 (nic0)

## Prasyarat

1. Akun Google Cloud Platform
2. Project GCP yang telah dibuat
3. Instance VM yang telah disiapkan dengan Ubuntu 20.04 atau lebih tinggi
4. SSH key untuk koneksi ke instance

## Cara Deploy ke GCP VM

### 1. Koneksi ke Instance GCP

#### Metode 1: Menggunakan Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda
3. Navigasi ke "Compute Engine" > "VM instances"
4. Klik tombol SSH pada instance `instance-20250808-152810`

#### Metode 2: Menggunakan gcloud CLI
```bash
gcloud compute ssh instance-20250808-152810 --zone=us-central1-c
```

#### Metode 3: Menggunakan SSH Client Biasa
```bash
ssh -i [PATH_KE_PRIVATE_KEY] [USERNAME]@35.239.230.16
```

### 2. Persiapan Awal di VM

1. Setelah terhubung ke VM, pastikan sistem dalam keadaan terbaru:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Install tools yang diperlukan:
   ```bash
   sudo apt install -y git curl
   ```

### 3. Clone Repository KDE Blockchain

1. Clone repository ke direktori home:
   ```bash
   git clone <url-repository>
   cd psnchain
   ```

   Jika belum ada repository remote, Anda bisa mengupload file-file yang telah dimodifikasi:
   ```bash
   # Dari lokal, upload file ke VM
   scp -r ./* [USERNAME]@35.239.230.16:/home/[USERNAME]/psnchain/
   ```

### 4. Konfigurasi Firewall GCP

1. Buka Google Cloud Console
2. Navigasi ke "VPC Network" > "Firewall"
3. Buat aturan firewall baru dengan konfigurasi:
   - Name: `allow-psnchain`
   - Direction: Ingress
   - Action: Allow
   - Targets: All instances in the network (atau tag spesifik)
   - Source IP ranges: `0.0.0.0/0`
   - Protocols and ports:
     - tcp: 22 (SSH)
     - tcp: 80 (HTTP)
     - tcp: 443 (HTTPS)
     - tcp: 3000 (Frontend)
     - tcp: 8080 (API jika diperlukan)

4. Terapkan aturan firewall ke instance dengan menambahkan network tag `psnchain` ke instance:
   - Di halaman VM instances, klik nama instance
   - Klik "Edit"
   - Di bagian "Network tags", tambahkan `psnchain`
   - Klik "Save"

### 5. Jalankan Deployment Script

1. Berikan hak akses eksekusi pada script:
   ```bash
   chmod +x deploy/ubuntu-deploy.sh
   chmod +x deploy/security-config.sh
   ```

2. Jalankan script deployment:
   ```bash
   sudo ./deploy/ubuntu-deploy.sh
   ```

### 6. Verifikasi Deployment

1. Cek status service:
   ```bash
   sudo systemctl status psnchain
   ```

2. Lihat log real-time:
   ```bash
   sudo journalctl -u psnchain -f
   ```

3. Verifikasi integritas data:
   ```bash
   sudo -u psnchain node /home/psnchain/psnchain/deploy/verify-integrity.js
   ```

### 7. Akses Aplikasi

Setelah deployment berhasil, Anda dapat mengakses:
- **Frontend**: http://35.239.230.16:3000
- **API/Node**: http://35.239.230.16:8080 (jika dikonfigurasi)

### 8. Konfigurasi SSL (Opsional)

Untuk mengaktifkan HTTPS:
1. Install Certbot:
   ```bash
   sudo apt install -y certbot
   ```

2. Dapatkan sertifikat SSL (jika memiliki domain):
   ```bash
   sudo certbot certonly --standalone -d your-domain.com
   ```

3. Konfigurasi reverse proxy dengan Nginx untuk meneruskan traffic ke aplikasi.

### 9. Monitoring dan Maintenance

1. **Monitoring Service**:
   ```bash
   sudo systemctl status psnchain
   sudo journalctl -u psnchain -f
   ```

2. **Restart Service**:
   ```bash
   sudo systemctl restart psnchain
   ```

3. **Backup Data**:
   ```bash
   sudo -u psnchain cp -r /home/psnchain/psnchain /home/psnchain/backups/psnchain-$(date +%Y%m%d)
   ```

## Troubleshooting Khusus GCP

### 1. Masalah Koneksi
- Pastikan firewall GCP mengizinkan port yang diperlukan
- Cek network tags pada instance
- Verifikasi external IP address

### 2. Masalah Permission
- Pastikan script memiliki hak akses eksekusi
- Cek ownership direktori `/home/psnchain/psnchain`

### 3. Masalah Resource
- Monitor penggunaan CPU dan memory di Google Cloud Console
- Pertimbangkan upgrade instance jika diperlukan

## Keamanan Tambahan untuk GCP

1. **Service Account**:
   - Buat service account khusus untuk instance
   - Berikan minimum permissions yang diperlukan

2. **Private SSH Keys**:
   - Gunakan SSH key pair yang aman
   - Jangan gunakan password-based authentication

3. **Audit Logging**:
   - Aktifkan Cloud Audit Logs untuk monitoring aktivitas

## Kesimpulan

Deployment KDE Blockchain di Google Cloud Platform VM instance-20250808-152810 telah berhasil dikonfigurasi dengan langkah-langkah yang mencakup:
- Koneksi ke instance melalui berbagai metode
- Konfigurasi firewall GCP yang sesuai
- Deployment otomatis dengan script yang telah dibuat
- Verifikasi integritas data
- Monitoring dan maintenance

Dengan konfigurasi ini, KDE Blockchain siap digunakan dalam lingkungan produksi di Google Cloud Platform dengan tingkat keamanan yang tinggi dan monitoring yang memadai.