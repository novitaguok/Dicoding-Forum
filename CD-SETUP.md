# Setup Continuous Deployment (CD)

## Ringkasan
Workflow CD akan otomatis melakukan deployment ke server setiap kali ada push ke branch `main`.

## Konfigurasi CD

### File Workflow
- **Lokasi**: `.github/workflows/cd.yml`
- **Trigger**: Push ke branch `main`
- **Node Version**: 18.x

### Proses CD
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run tests (untuk memastikan code yang akan di-deploy sudah lulus test)
5. Deploy ke server via SSH:
   - Pull latest code dari GitHub
   - Install dependencies
   - Run database migrations
   - Restart aplikasi dengan PM2

## Setup GitHub Secrets

Untuk menjalankan CD, Anda perlu menambahkan secrets di GitHub repository:

### Cara Menambahkan Secrets:
1. Buka repository di GitHub
2. Klik **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Tambahkan secrets berikut:

### Required Secrets:

#### 1. SSH_HOST
- **Name**: `SSH_HOST`
- **Value**: IP address atau domain server Anda
- **Contoh**: `203.0.113.1` atau `api.example.com`

#### 2. SSH_USERNAME
- **Name**: `SSH_USERNAME`
- **Value**: Username SSH untuk login ke server
- **Contoh**: `ubuntu` atau `root`

#### 3. SSH_PRIVATE_KEY
- **Name**: `SSH_PRIVATE_KEY`
- **Value**: Private key SSH untuk autentikasi
- **Cara mendapatkan**:
  ```bash
  # Di komputer lokal, generate SSH key pair
  ssh-keygen -t rsa -b 4096 -C "github-actions"

  # Copy private key (untuk GitHub Secret)
  cat ~/.ssh/id_rsa

  # Copy public key (untuk server)
  cat ~/.ssh/id_rsa.pub
  ```

#### 4. SSH_PORT
- **Name**: `SSH_PORT`
- **Value**: Port SSH server (biasanya 22)
- **Contoh**: `22`

#### 5. ACCESS_TOKEN_KEY
- **Name**: `ACCESS_TOKEN_KEY`
- **Value**: Key untuk JWT access token (dari .env)

#### 6. REFRESH_TOKEN_KEY
- **Name**: `REFRESH_TOKEN_KEY`
- **Value**: Key untuk JWT refresh token (dari .env)

## Setup Server

### 1. Install Dependencies di Server
```bash
# Login ke server via SSH
ssh username@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Setup database
sudo -u postgres psql
CREATE DATABASE forumapi;
CREATE USER developer WITH PASSWORD 'supersecretpassword';
GRANT ALL PRIVILEGES ON DATABASE forumapi TO developer;
\q
```

### 2. Clone Repository di Server
```bash
# Clone repository
cd ~
git clone https://github.com/novitaguok/Dicoding-Forum.git forum-api
cd forum-api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
nano .env  # Edit sesuai konfigurasi server

# Run migrations
npm run migrate up

# Start aplikasi dengan PM2
pm2 start npm --name "forum-api" -- start
pm2 save
pm2 startup
```

### 3. Setup SSH Key di Server
```bash
# Di server, tambahkan public key ke authorized_keys
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Paste public key yang di-generate tadi
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## Testing CD

### Cara Test:
1. Merge salah satu PR (misalnya `feature/health-check-success`) ke branch `main`
2. GitHub Actions akan otomatis menjalankan workflow CD
3. Cek status di tab **Actions** di GitHub repository
4. Verifikasi deployment berhasil dengan mengakses server

### Verifikasi Deployment:
```bash
# Cek aplikasi berjalan di server
curl http://your-server-ip:3000/health

# Expected response:
# {
#   "status": "success",
#   "data": {
#     "message": "Server is healthy",
#     "timestamp": "2024-11-20T..."
#   }
# }
```

## Alternatif: Deploy ke Cloud Services

### AWS EC2 dengan CodeDeploy
Jika menggunakan AWS EC2, Anda bisa menggunakan AWS CodeDeploy:

1. Install CodeDeploy agent di EC2
2. Buat `appspec.yml` di root project
3. Update workflow untuk menggunakan AWS CodeDeploy action

### Heroku
```yaml
- name: Deploy to Heroku
  uses: akhileshns/heroku-deploy@v3.12.12
  with:
    heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
    heroku_app_name: "your-app-name"
    heroku_email: "your-email@example.com"
```

### DigitalOcean App Platform
```yaml
- name: Deploy to DigitalOcean
  uses: digitalocean/app_action@main
  with:
    app_name: forum-api
    token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
```

## Troubleshooting

### Error: Permission denied (publickey)
- Pastikan SSH private key sudah ditambahkan ke GitHub Secrets
- Pastikan public key sudah ditambahkan ke `~/.ssh/authorized_keys` di server

### Error: pm2 command not found
- Install PM2 di server: `sudo npm install -g pm2`

### Error: Database connection failed
- Pastikan PostgreSQL sudah running di server
- Pastikan environment variables sudah di-set dengan benar di server

### Error: Port already in use
- Restart PM2: `pm2 restart forum-api`
- Atau kill process: `pm2 delete forum-api && pm2 start npm --name "forum-api" -- start`

## Monitoring

### Cek Status Aplikasi di Server:
```bash
# Cek PM2 status
pm2 status

# Cek logs
pm2 logs forum-api

# Cek logs real-time
pm2 logs forum-api --lines 100
```

## Security Best Practices

1. ✅ Gunakan SSH key authentication (bukan password)
2. ✅ Simpan semua credentials di GitHub Secrets
3. ✅ Jangan commit `.env` file ke repository
4. ✅ Gunakan firewall untuk membatasi akses ke server
5. ✅ Update dependencies secara berkala
6. ✅ Gunakan HTTPS untuk production
