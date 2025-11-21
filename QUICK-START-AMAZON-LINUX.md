# 🚀 Quick Start - Amazon Linux 2023

## 📍 Step by Step

### 1️⃣ Di Mac (Terminal Lokal)
```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "github-actions"

# Copy private key (untuk GitHub Secret)
cat ~/.ssh/id_rsa

# Copy public key (untuk server)
cat ~/.ssh/id_rsa.pub
```

---

### 2️⃣ Di Browser (GitHub.com)
```
1. Buka: https://github.com/novitaguok/Dicoding-Forum/settings/secrets/actions
2. Klik "New repository secret"
3. Tambahkan secrets:

   Name: SSH_HOST
   Value: (IP EC2 Anda, misal: 54.123.45.67)

   Name: SSH_USERNAME
   Value: ec2-user

   Name: SSH_PRIVATE_KEY
   Value: (paste dari cat ~/.ssh/id_rsa)

   Name: SSH_PORT
   Value: 22

   Name: ACCESS_TOKEN_KEY
   Value: 8b7b4ef375716ab08b2a3951b29d52fc00b1c855f9d1a847229b8c5935bef56d9d271e76a9cf08e614300395c3b90ebe559cf968a0741b18c9505549394b2c70

   Name: REFRESH_TOKEN_KEY
   Value: 5078605e074a462b1460608fcbe0d0963c644402e04ad334455ff5a856cb43fd99825861dde02957d5e3184c90c532ca7d0249df20fe93d535632f3d11be7bad
```

---

### 3️⃣ Di Mac (SSH ke Server)
```bash
# Connect ke EC2
ssh -i ~/path/to/your-key.pem ec2-user@your-ec2-ip

# Contoh:
ssh -i ~/Downloads/my-key.pem ec2-user@54.123.45.67
```

---

### 4️⃣ Di Server (Setelah SSH)

#### A. Install Dependencies
```bash
# Update system
sudo dnf update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo dnf install -y postgresql15 postgresql15-server
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Git
sudo dnf install -y git
```

#### B. Setup Database
```bash
# Masuk ke PostgreSQL
sudo -u postgres psql

# Jalankan SQL (copy paste semua):
CREATE DATABASE forumapi;
CREATE USER developer WITH PASSWORD 'supersecretpassword';
GRANT ALL PRIVILEGES ON DATABASE forumapi TO developer;
\q
```

#### C. Configure PostgreSQL
```bash
# Edit config
sudo nano /var/lib/pgsql/data/pg_hba.conf

# Cari line yang ada "local   all             all"
# Ubah "peer" menjadi "md5"
# Atau tambahkan line ini di bawah # IPv4 local connections:
local   all             developer                               md5
host    all             developer       127.0.0.1/32            md5

# Save: Ctrl+X, Y, Enter

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### D. Clone & Setup Aplikasi
```bash
# Clone repository
cd ~
git clone https://github.com/novitaguok/Dicoding-Forum.git forum-api
cd forum-api

# Install dependencies
npm install

# Create .env file
nano .env
```

Paste ini ke `.env`:
```env
HOST=0.0.0.0
PORT=3000
PGHOST=localhost
PGUSER=developer
PGDATABASE=forumapi
PGPASSWORD=supersecretpassword
PGPORT=5432
PGHOST_TEST=localhost
PGUSER_TEST=developer
PGDATABASE_TEST=forumapi_test
PGPASSWORD_TEST=supersecretpassword
PGPORT_TEST=5432
ACCESS_TOKEN_KEY=8b7b4ef375716ab08b2a3951b29d52fc00b1c855f9d1a847229b8c5935bef56d9d271e76a9cf08e614300395c3b90ebe559cf968a0741b18c9505549394b2c70
REFRESH_TOKEN_KEY=5078605e074a462b1460608fcbe0d0963c644402e04ad334455ff5a856cb43fd99825861dde02957d5e3184c90c532ca7d0249df20fe93d535632f3d11be7bad
ACCESS_TOKEN_AGE=3000
```

Save: Ctrl+X, Y, Enter

```bash
# Run migrations
npm run migrate up

# Start dengan PM2
pm2 start npm --name "forum-api" -- start
pm2 save
pm2 startup
# Copy dan jalankan command yang muncul (dimulai dengan sudo)
```

#### E. Setup SSH Key
```bash
# Buat folder .ssh
mkdir -p ~/.ssh

# Edit authorized_keys
nano ~/.ssh/authorized_keys

# Paste public key dari Mac (dari cat ~/.ssh/id_rsa.pub)
# Save: Ctrl+X, Y, Enter

# Set permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

### 5️⃣ Di AWS Console (Browser)

#### Configure Security Group
```
1. Buka: https://console.aws.amazon.com/ec2/
2. Klik "Instances"
3. Pilih instance Anda
4. Tab "Security" → Klik Security Group name
5. Tab "Inbound rules" → "Edit inbound rules"
6. Pastikan ada rules:
   - Type: SSH, Port: 22, Source: 0.0.0.0/0
   - Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0
7. "Save rules"
```

---

### 6️⃣ Test (Di Mac)

```bash
# Test health endpoint
curl http://your-ec2-ip:3000/health

# Expected:
# {"status":"success","data":{"message":"Server is healthy",...}}
```

---

### 7️⃣ Test CI/CD (Di Browser)

#### Test CI
```
1. Buka: https://github.com/novitaguok/Dicoding-Forum/pulls
2. Klik "New pull request"
3. Base: main, Compare: feature/health-check-success
4. Create pull request
5. Lihat tab "Checks" → CI harus PASS ✅
```

#### Test CD
```
1. Merge PR yang berhasil
2. Buka tab "Actions"
3. Lihat workflow "Continuous Deployment" berjalan
4. Setelah selesai, test: curl http://ec2-ip:3000/health
```

---

## ✅ Checklist

- [ ] SSH key generated di Mac
- [ ] GitHub Secrets ditambahkan (6 secrets)
- [ ] SSH ke EC2 berhasil
- [ ] Node.js, PM2, PostgreSQL terinstall
- [ ] Database forumapi dibuat
- [ ] Repository di-clone
- [ ] npm install berhasil
- [ ] Migration berhasil
- [ ] PM2 running
- [ ] SSH authorized_keys di-setup
- [ ] Security Group port 3000 terbuka
- [ ] curl http://ec2-ip:3000/health berhasil
- [ ] PR dibuat dan CI PASS
- [ ] PR di-merge dan CD berhasil

---

## 🆘 Troubleshooting

### Cannot connect to PostgreSQL
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### PM2 not found
```bash
sudo npm install -g pm2
export PATH=$PATH:/usr/bin
```

### Port 3000 tidak bisa diakses
```bash
# Cek PM2
pm2 status

# Cek Security Group di AWS Console
# Pastikan port 3000 terbuka
```

### SSH Permission denied
```bash
# Pastikan menggunakan ec2-user (bukan ubuntu)
ssh -i key.pem ec2-user@ip

# Pastikan public key sudah di authorized_keys
```

---

## 📚 Dokumentasi Lengkap

- `SETUP-AMAZON-LINUX.md` - Panduan detail Amazon Linux 2023
- `DEPLOYMENT-GUIDE.md` - Panduan lengkap CI/CD
- `README-CICD.md` - Overview CI/CD
