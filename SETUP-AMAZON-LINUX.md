# Setup Server - Amazon Linux 2023

## 📍 Lokasi: DI SERVER (setelah SSH dari Mac)

### Koneksi ke Server

```bash
# Di Mac (terminal lokal)
ssh -i /path/to/your-key.pem ec2-user@your-ec2-ip

# Contoh:
ssh -i ~/Downloads/my-key.pem ec2-user@54.123.45.67
```

**Note**: Default user untuk Amazon Linux 2023 adalah `ec2-user` (bukan `ubuntu` atau `root`)

---

## 🚀 Setup Server (Jalankan di Server)

### 1. Update System
```bash
sudo dnf update -y
```

### 2. Install Node.js 18.x
```bash
# Install Node.js dari NodeSource
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js
sudo dnf install -y nodejs

# Verifikasi instalasi
node --version
npm --version
```

### 3. Install PM2
```bash
sudo npm install -g pm2

# Verifikasi
pm2 --version
```

### 4. Install PostgreSQL
```bash
# Install PostgreSQL 15
sudo dnf install -y postgresql15 postgresql15-server

# Initialize database
sudo postgresql-setup --initdb

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verifikasi status
sudo systemctl status postgresql
```

### 5. Setup PostgreSQL Database
```bash
# Switch ke user postgres
sudo -u postgres psql

# Di dalam psql prompt, jalankan:
CREATE DATABASE forumapi;
CREATE USER developer WITH PASSWORD 'supersecretpassword';
GRANT ALL PRIVILEGES ON DATABASE forumapi TO developer;

# Keluar dari psql
\q
```

### 6. Configure PostgreSQL untuk Accept Connections
```bash
# Edit pg_hba.conf
sudo nano /var/lib/pgsql/data/pg_hba.conf

# Tambahkan line ini sebelum line lainnya (di bawah # IPv4 local connections):
# local   all             developer                               md5
# host    all             developer       127.0.0.1/32            md5

# Atau ganti line yang ada:
# Ubah dari: local   all             all                                     peer
# Menjadi:   local   all             all                                     md5

# Save dan keluar (Ctrl+X, Y, Enter)

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 7. Install Git (jika belum ada)
```bash
sudo dnf install -y git

# Verifikasi
git --version
```

### 8. Clone Repository
```bash
# Pindah ke home directory
cd ~

# Clone repository
git clone https://github.com/novitaguok/Dicoding-Forum.git forum-api

# Masuk ke folder
cd forum-api
```

### 9. Setup Environment Variables
```bash
# Copy .env example (jika ada) atau buat baru
nano .env
```

Isi file `.env`:
```env
# HTTP SERVER
HOST=0.0.0.0
PORT=3000

# POSTGRES
PGHOST=localhost
PGUSER=developer
PGDATABASE=forumapi
PGPASSWORD=supersecretpassword
PGPORT=5432

# POSTGRES TEST
PGHOST_TEST=localhost
PGUSER_TEST=developer
PGDATABASE_TEST=forumapi_test
PGPASSWORD_TEST=supersecretpassword
PGPORT_TEST=5432

# TOKENIZE
ACCESS_TOKEN_KEY=8b7b4ef375716ab08b2a3951b29d52fc00b1c855f9d1a847229b8c5935bef56d9d271e76a9cf08e614300395c3b90ebe559cf968a0741b18c9505549394b2c70
REFRESH_TOKEN_KEY=5078605e074a462b1460608fcbe0d0963c644402e04ad334455ff5a856cb43fd99825861dde02957d5e3184c90c532ca7d0249df20fe93d535632f3d11be7bad
ACCESS_TOKEN_AGE=3000
```

Save dan keluar (Ctrl+X, Y, Enter)

### 10. Install Dependencies
```bash
npm install
```

### 11. Run Database Migrations
```bash
npm run migrate up
```

### 12. Test Aplikasi
```bash
# Test run aplikasi
npm start

# Jika berhasil, tekan Ctrl+C untuk stop
```

### 13. Setup PM2
```bash
# Start aplikasi dengan PM2
pm2 start npm --name "forum-api" -- start

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup

# Copy dan jalankan command yang muncul (biasanya dimulai dengan sudo)
# Contoh: sudo env PATH=$PATH:/usr/bin...
```

### 14. Setup SSH Key untuk GitHub Actions
```bash
# Buat folder .ssh jika belum ada
mkdir -p ~/.ssh

# Edit authorized_keys
nano ~/.ssh/authorized_keys

# Paste public key dari Mac Anda (dari cat ~/.ssh/id_rsa.pub)
# Save dan keluar (Ctrl+X, Y, Enter)

# Set permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 15. Configure Security Group (AWS Console)
```
1. Buka AWS EC2 Console
2. Pilih instance Anda
3. Tab "Security" → Klik Security Group
4. Edit Inbound Rules:
   - SSH (22) - Your IP atau 0.0.0.0/0
   - Custom TCP (3000) - 0.0.0.0/0
5. Save rules
```

---

## ✅ Verifikasi Setup

### Cek Service Status
```bash
# Cek PM2
pm2 status

# Cek PostgreSQL
sudo systemctl status postgresql

# Cek aplikasi berjalan
curl http://localhost:3000/health
```

### Cek dari Luar (di Mac)
```bash
# Test health endpoint
curl http://your-ec2-ip:3000/health

# Expected response:
# {"status":"success","data":{"message":"Server is healthy","timestamp":"..."}}
```

---

## 🔧 Troubleshooting

### PostgreSQL Connection Error
```bash
# Cek PostgreSQL running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Test connection
psql -U developer -d forumapi -h localhost
# Password: supersecretpassword
```

### PM2 Not Found
```bash
# Install ulang PM2
sudo npm install -g pm2

# Atau tambahkan ke PATH
export PATH=$PATH:/usr/bin
```

### Port 3000 Tidak Bisa Diakses
```bash
# Cek aplikasi berjalan
pm2 status

# Cek port listening
sudo netstat -tlnp | grep 3000

# Cek Security Group di AWS Console
# Pastikan port 3000 terbuka untuk 0.0.0.0/0
```

### Git Clone Error (Permission Denied)
```bash
# Pastikan repository public atau setup SSH key untuk GitHub
# Atau gunakan HTTPS:
git clone https://github.com/novitaguok/Dicoding-Forum.git forum-api
```

---

## 📝 GitHub Secrets untuk Amazon Linux 2023

Tambahkan di GitHub Settings → Secrets:

```
SSH_HOST = your-ec2-public-ip (misal: 54.123.45.67)
SSH_USERNAME = ec2-user (bukan ubuntu!)
SSH_PRIVATE_KEY = (isi dari cat ~/.ssh/id_rsa di Mac)
SSH_PORT = 22
ACCESS_TOKEN_KEY = (dari .env)
REFRESH_TOKEN_KEY = (dari .env)
```

---

## 🎯 Perbedaan Amazon Linux 2023 vs Ubuntu

| Aspek | Amazon Linux 2023 | Ubuntu |
|-------|------------------|--------|
| Package Manager | `dnf` | `apt-get` |
| Default User | `ec2-user` | `ubuntu` |
| PostgreSQL Path | `/var/lib/pgsql/data/` | `/etc/postgresql/` |
| Service Manager | `systemctl` | `systemctl` |
| SSH Key | `.pem` file | `.pem` atau password |

---

## 🚀 Next Steps

Setelah setup selesai:

1. ✅ Verifikasi aplikasi berjalan: `curl http://localhost:3000/health`
2. ✅ Verifikasi dari luar: `curl http://ec2-ip:3000/health`
3. ✅ Setup GitHub Secrets dengan `SSH_USERNAME = ec2-user`
4. ✅ Buat PR dan test CI/CD

---

## 💡 Tips Amazon Linux 2023

- Gunakan `ec2-user` sebagai default user
- Security Group harus membuka port 22 (SSH) dan 3000 (aplikasi)
- Elastic IP recommended agar IP tidak berubah saat restart
- Gunakan `.pem` file untuk SSH authentication
- PostgreSQL config ada di `/var/lib/pgsql/data/`
