# Panduan Lengkap CI/CD untuk Forum API

## 📋 Ringkasan

Proyek ini telah dikonfigurasi dengan:
- ✅ **Continuous Integration (CI)** - Otomatis test pada setiap Pull Request
- ✅ **Continuous Deployment (CD)** - Otomatis deploy via SSH pada setiap push ke main

## 🔄 Continuous Integration (CI)

### File: `.github/workflows/ci.yml`

**Trigger**: Pull Request ke branch `main`

**Proses**:
1. Setup Node.js (18.x dan 20.x)
2. Setup PostgreSQL service container
3. Install dependencies
4. Run database migrations
5. Run all tests (Unit, Integration, Functional)

**Database**: PostgreSQL service container (lokal, gratis, cepat)

### Demonstrasi CI

Sudah dibuat 2 branch untuk demonstrasi:

1. **feature/health-check-success** ✅
   - Semua test berhasil
   - CI akan PASS

2. **feature/health-check-fail** ❌
   - 1 test sengaja dibuat gagal
   - CI akan FAIL

**Cara membuat PR**:
```bash
# Buka di browser:
https://github.com/novitaguok/Dicoding-Forum/pulls
```

## 🚀 Continuous Deployment (CD)

### Deploy via SSH

**File**: `.github/workflows/cd.yml`

**Trigger**: Push ke branch `main`

**Proses**:
1. Run tests
2. Connect ke server via SSH
3. Pull latest code
4. Install dependencies
5. Run migrations
6. Restart aplikasi dengan PM2

### Setup Required

#### A. GitHub Secrets
Tambahkan di: `Settings` → `Secrets and variables` → `Actions`

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SSH_HOST` | IP/domain server | `203.0.113.1` |
| `SSH_USERNAME` | SSH username | `ubuntu` |
| `SSH_PRIVATE_KEY` | SSH private key | `-----BEGIN RSA...` |
| `SSH_PORT` | SSH port | `22` |
| `ACCESS_TOKEN_KEY` | JWT access token key | (dari .env) |
| `REFRESH_TOKEN_KEY` | JWT refresh token key | (dari .env) |

#### B. Generate SSH Key
```bash
# Di komputer lokal
ssh-keygen -t rsa -b 4096 -C "github-actions"

# Copy private key untuk GitHub Secret
cat ~/.ssh/id_rsa

# Copy public key untuk server
cat ~/.ssh/id_rsa.pub
```

#### C. Setup Server
```bash
# 1. Login ke server
ssh username@your-server-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 5. Setup database
sudo -u postgres psql
CREATE DATABASE forumapi;
CREATE USER developer WITH PASSWORD 'supersecretpassword';
GRANT ALL PRIVILEGES ON DATABASE forumapi TO developer;
\q

# 6. Clone repository
cd ~
git clone https://github.com/novitaguok/Dicoding-Forum.git forum-api
cd forum-api

# 7. Install dependencies
npm install

# 8. Setup .env
cp .env.example .env
nano .env  # Edit sesuai konfigurasi

# 9. Run migrations
npm run migrate up

# 10. Start dengan PM2
pm2 start npm --name "forum-api" -- start
pm2 save
pm2 startup

# 11. Setup SSH key
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys  # Paste public key
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## 🧪 Testing Deployment

### 1. Test CI
```bash
# Buat PR dari branch feature ke main
# CI akan otomatis berjalan
# Cek di tab "Actions" di GitHub
```

### 2. Test CD
```bash
# Merge PR ke main
# CD akan otomatis berjalan
# Cek di tab "Actions" di GitHub

# Verifikasi deployment
curl http://your-server-ip:3000/health
```

**Expected Response**:
```json
{
  "status": "success",
  "data": {
    "message": "Server is healthy",
    "timestamp": "2024-11-20T..."
  }
}
```

## 📊 Monitoring

### Cek Status di Server
```bash
# PM2 status
pm2 status

# Logs
pm2 logs forum-api

# Real-time logs
pm2 logs forum-api --lines 100 --raw
```

### Cek GitHub Actions
1. Buka repository di GitHub
2. Klik tab **Actions**
3. Lihat workflow runs
4. Klik pada run untuk melihat detail logs

## 🔒 Security Checklist

- ✅ SSH key authentication (bukan password)
- ✅ Semua credentials di GitHub Secrets
- ✅ `.env` tidak di-commit
- ✅ Firewall configured di server
- ✅ PostgreSQL hanya listen localhost
- ✅ PM2 running sebagai non-root user

## 🐛 Troubleshooting

### CI Gagal
```bash
# Cek logs di GitHub Actions
# Biasanya karena:
# - Test gagal
# - Database connection error
# - Missing environment variables
```

### CD Gagal - SSH Error
```bash
# Error: Permission denied (publickey)
# Solution: Pastikan SSH key sudah benar di GitHub Secrets dan server

# Verifikasi SSH key di server
cat ~/.ssh/authorized_keys

# Test SSH connection dari lokal
ssh -i ~/.ssh/id_rsa username@server-ip
```

### CD Gagal - PM2 Error
```bash
# Error: pm2 command not found
# Solution: Install PM2 di server
sudo npm install -g pm2
```

### Application Error di Server
```bash
# Cek logs
pm2 logs forum-api

# Restart aplikasi
pm2 restart forum-api

# Atau delete dan start ulang
pm2 delete forum-api
pm2 start npm --name "forum-api" -- start
```

### Database Connection Error
```bash
# Cek PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Cek database exists
sudo -u postgres psql -l
```

## 📝 Langkah Selanjutnya

1. ✅ Setup GitHub Secrets
2. ✅ Setup server (install dependencies, clone repo, setup SSH)
3. ✅ Buat PR dari `feature/health-check-success` ke `main`
4. ✅ Verifikasi CI berjalan dan PASS
5. ✅ Merge PR ke `main`
6. ✅ Verifikasi CD berjalan dan deployment berhasil
7. ✅ Test endpoint di server
8. ✅ Buat PR dari `feature/health-check-fail` untuk demonstrasi CI FAIL

## 📚 Dokumentasi Tambahan

- `README-CICD.md` - Quick start guide
- `CI-SETUP.md` - Detail setup CI
- `CD-SETUP.md` - Detail setup CD

## 🎯 Kriteria Terpenuhi

### CI Requirements ✅
- ✅ Menjalankan Unit Test, Integration Test, Functional Test
- ✅ Diterapkan pada event pull request ke main
- ✅ Menggunakan GitHub Actions
- ✅ Minimal 2 proses CI (1 berhasil, 1 gagal)
- ✅ Menggunakan PostgreSQL service containers

### CD Requirements ✅
- ✅ Melakukan deploying otomatis ke server
- ✅ Diterapkan pada event push ke main
- ✅ Menggunakan SSH untuk GitHub Actions
- ✅ Minimal 1 proses CD yang berhasil
