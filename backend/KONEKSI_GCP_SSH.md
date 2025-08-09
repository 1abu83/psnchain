# Panduan Koneksi ke GCP VM dan Deploy KDE Blockchain

Berdasarkan informasi yang diberikan, Anda telah memiliki SSH key untuk instance GCP `instance-20250808-152810`. Berikut adalah langkah-langkah untuk menggunakan key ini dalam proses deployment KDE Blockchain.

## Informasi SSH Key

- **Private Key**: `/home/brotoasu38/.ssh/google_compute_engine`
- **Public Key**: `/home/brotoasu38/.ssh/google_compute_engine.pub`
- **Key Fingerprint**: SHA256:yH5CmJqhulTKh/7j5ot3ljxSHIPrA3mKLqU5wdMxVrM
- **Username**: brotoasu38
- **Instance**: instance-20250808-152810
- **IP Eksternal**: 35.239.230.16

## Cara Menggunakan SSH Key untuk Koneksi

### 1. Koneksi Langsung dengan SSH

Gunakan perintah berikut untuk terhubung ke instance GCP Anda:

```bash
ssh -i /home/brotoasu38/.ssh/google_compute_engine brotoasu38@35.239.230.16
```

### 2. Menggunakan SSH Config (Opsional)

Untuk kemudahan koneksi, Anda bisa menambahkan konfigurasi ke file `~/.ssh/config`:

```
Host gcp-psnchain
    HostName 35.239.230.16
    User brotoasu38
    IdentityFile /home/brotoasu38/.ssh/google_compute_engine
    Port 22
```

Setelah menambahkan konfigurasi ini, Anda bisa terhubung dengan perintah yang lebih sederhana:

```bash
ssh gcp-psnchain
```

## Langkah Deployment KDE Blockchain

### 1. Setelah Terhubung ke VM

Setelah berhasil terhubung, ikuti langkah-langkah berikut:

1. **Update sistem**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install dependencies**:
   ```bash
   sudo apt install -y git curl
   ```

### 2. Upload File KDE Blockchain

Anda memiliki beberapa opsi untuk mengupload file KDE Blockchain ke VM:

#### Opsi 1: Menggunakan SCP dari lokal ke VM

Dari komputer lokal Anda, jalankan perintah berikut untuk mengupload file:

```bash
# Asumsikan file KDE Blockchain ada di direktori lokal ~/psnchain
scp -i /home/brotoasu38/.ssh/google_compute_engine -r ~/psnchain brotoasu38@35.239.230.16:/home/brotoasu38/
```

#### Opsi 2: Clone dari Repository

Jika kode tersedia di repository Git:

```bash
# Setelah terhubung ke VM
git clone <url-repository>
cd psnchain
```

### 3. Konfigurasi dan Jalankan Deployment

1. **Navigasi ke direktori proyek**:
   ```bash
   cd /home/brotoasu38/psnchain
   ```

2. **Berikan hak akses eksekusi pada script**:
   ```bash
   chmod +x deploy/ubuntu-deploy.sh
   chmod +x deploy/security-config.sh
   ```

3. **Jalankan deployment script**:
   ```bash
   sudo ./deploy/ubuntu-deploy.sh
   ```

### 4. Verifikasi Deployment

1. **Cek status service**:
   ```bash
   sudo systemctl status psnchain
   ```

2. **Lihat log real-time**:
   ```bash
   sudo journalctl -u psnchain -f
   ```

3. **Verifikasi integritas data**:
   ```bash
   sudo -u psnchain node /home/brotoasu38/psnchain/deploy/verify-integrity.js
   ```

## Troubleshooting

### Masalah Permission dengan SSH Key

Jika Anda mengalami masalah permission dengan SSH key:

```bash
chmod 600 /home/brotoasu38/.ssh/google_compute_engine
chmod 644 /home/brotoasu38/.ssh/google_compute_engine.pub
```

### Masalah Koneksi

1. **Verifikasi koneksi jaringan**:
   ```bash
   ping 35.239.230.16
   ```

2. **Cek apakah port 22 terbuka**:
   ```bash
   telnet 35.239.230.16 22
   ```

3. **Verifikasi firewall GCP**:
   - Pastikan aturan firewall mengizinkan koneksi SSH (port 22)
   - Pastikan instance memiliki tag network yang sesuai

### Masalah Deployment

1. **Jika script tidak bisa dieksekusi**:
   ```bash
   # Cek permission file
   ls -la deploy/
   
   # Berikan hak akses eksekusi
   chmod +x deploy/*.sh
   ```

2. **Jika service tidak start**:
   ```bash
   # Cek log error
   sudo journalctl -u psnchain --no-pager
   
   # Cek konfigurasi service
   cat /etc/systemd/system/psnchain.service
   ```

## Keamanan Tambahan

1. **Backup SSH Key**:
   - Simpan copy dari SSH key di lokasi yang aman
   - Jangan bagikan private key dengan siapapun

2. **Monitoring Akses**:
   - Periksa log auth untuk aktivitas mencurigakan:
   ```bash
   sudo grep "Accepted\|Failed" /var/log/auth.log
   ```

3. **Update Berkala**:
   - Lakukan update sistem secara berkala:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Kesimpulan

Dengan menggunakan SSH key yang telah dibuat, Anda dapat dengan aman terhubung ke instance GCP Anda dan mendeploy KDE Blockchain dengan mudah. Proses deployment mencakup konfigurasi keamanan yang kuat, verifikasi integritas data, dan monitoring yang memadai untuk memastikan sistem berjalan dengan optimal.

Setelah deployment selesai, Anda dapat mengakses:
- **Frontend**: http://35.239.230.16:3000
- **API/Node**: http://35.239.230.16:8080 (jika dikonfigurasi)

Pastikan untuk memantau sistem secara berkala dan menerapkan pembaruan keamanan untuk menjaga integritas dan keamanan sistem blockchain Anda.