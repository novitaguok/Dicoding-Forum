# 🚀 CI/CD Setup - Forum API

## Quick Start

### ✅ Yang Sudah Dibuat

#### 1. Continuous Integration (CI)
- **File**: `.github/workflows/ci.yml`
- **Trigger**: Pull Request ke `main`
- **Database**: PostgreSQL service container
- **Tests**: Unit + Integration + Functional

#### 2. Continuous Deployment (CD)
- **File**: `.github/workflows/cd.yml`
- **Trigger**: Push ke `main`
- **Method**: SSH deployment
- **Process Manager**: PM2
- **Server**: VPS/Cloud server dengan SSH access

#### 3. Demo Branches
- `feature/health-check-success` - CI akan PASS ✅
- `feature/health-check-fail` - CI akan FAIL ❌

## 🎯 Langkah Setup

### Step 1: Setup GitHub Secrets
Tambahkan secrets di GitHub: `Settings` → `Secrets and variables` → `Actions`

**Required Secrets**:
```
SSH_HOST              # IP server Anda
SSH_USERNAME          # ec2-user (Amazon Linux) atau ubuntu (Ubuntu)
SSH_PRIVATE_KEY       # Private key SSH
SSH_PORT              # Port SSH (biasanya 22)
ACCESS_TOKEN_KEY      # JWT access token key
REFRESH_TOKEN_KEY     # JWT refresh token key
```

### Step 2: Generate SSH Key
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions"
cat ~/.ssh/id_rsa      # Copy untuk GitHub Secret
cat ~/.ssh/id_rsa.pub  # Copy untuk server
```

### Step 3: Setup Server

**Untuk Ubuntu/Debian:**
```bash
# Install Node.js, PM2, PostgreSQL
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib
sudo npm install -g pm2
```

**Untuk Amazon Linux 2023:**
```bash
# Install Node.js, PM2, PostgreSQL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs postgresql15 postgresql15-server
sudo npm install -g pm2
sudo postgresql-setup --initdb
sudo systemctl start postgresql
```

**Setup Aplikasi (semua OS):**
```bash
# Clone & setup aplikasi
cd ~
git clone https://github.com/novitaguok/Dicoding-Forum.git forum-api
cd forum-api
npm install
npm run migrate up
pm2 start npm --name "forum-api" -- start

# Setup SSH key
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys  # Paste public key
chmod 600 ~/.ssh/authorized_keys
```

**📖 Panduan Lengkap:**
- Ubuntu/Debian: Lihat `DEPLOYMENT-GUIDE.md`
- Amazon Linux 2023: Lihat `SETUP-AMAZON-LINUX.md`

### Step 4: Test CI/CD

#### Test CI:
1. Buka: https://github.com/novitaguok/Dicoding-Forum/pulls
2. Buat PR dari `feature/health-check-success` ke `main`
3. Lihat CI berjalan di tab "Checks" → Harus PASS ✅
4. Buat PR dari `feature/health-check-fail` ke `main`
5. Lihat CI berjalan → Harus FAIL ❌

#### Test CD:
1. Merge PR yang berhasil ke `main`
2. CD akan otomatis berjalan
3. Verifikasi: `curl http://your-server-ip:3000/health`

## 📁 File Structure

```
.github/workflows/
├── ci.yml                          # CI workflow
└── cd.yml                          # CD workflow (SSH)

# Dokumentasi
├── README-CICD.md                  # Quick start (file ini)
├── DEPLOYMENT-GUIDE.md             # Panduan lengkap
├── CI-SETUP.md                     # Detail CI
└── CD-SETUP.md                     # Detail CD
```

## 🔍 Verifikasi

### Cek CI Status
- Buka tab **Actions** di GitHub
- Lihat workflow "Continuous Integration"
- Harus ada minimal 2 runs: 1 success, 1 failed

### Cek CD Status
- Buka tab **Actions** di GitHub
- Lihat workflow "Continuous Deployment"
- Harus ada minimal 1 run yang success

### Cek Aplikasi di Server
```bash
# Health check
curl http://your-server-ip:3000/health

# PM2 status
ssh username@server-ip "pm2 status"
```

## 📚 Dokumentasi Lengkap

Baca file berikut untuk detail:
- **DEPLOYMENT-GUIDE.md** - Panduan lengkap CI/CD
- **CI-SETUP.md** - Setup CI dengan PostgreSQL container
- **CD-SETUP.md** - Setup CD dengan SSH dan alternatif

## ✨ Features

### Health Check Endpoint
```bash
GET /health

Response:
{
  "status": "success",
  "data": {
    "message": "Server is healthy",
    "timestamp": "2024-11-20T..."
  }
}
```

## 🎓 Kriteria Dicoding Terpenuhi

### CI ✅
- ✅ Unit Test, Integration Test, Functional Test
- ✅ Trigger: Pull Request ke main
- ✅ GitHub Actions
- ✅ PostgreSQL service containers
- ✅ 2 skenario: 1 berhasil, 1 gagal

### CD ✅
- ✅ Deploy otomatis ke server
- ✅ Trigger: Push ke main
- ✅ SSH deployment
- ✅ Minimal 1 proses CD berhasil

## 🆘 Need Help?

Lihat troubleshooting di **DEPLOYMENT-GUIDE.md** atau **CD-SETUP.md**
