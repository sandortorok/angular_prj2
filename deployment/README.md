# IoT Monitoring Application - Deployment Guide

Automatizált deployment megoldás az Angular 19 + NestJS IoT monitoring alkalmazáshoz Raspberry Pi eszközökre.

## Tartalomjegyzék

- [Áttekintés](#áttekintés)
- [Követelmények](#követelmények)
- [Gyors Kezdés](#gyors-kezdés)
- [Részletes Használat](#részletes-használat)
- [Hibaelhárítás](#hibaelhárítás)
- [Karbantartás](#karbantartás)

## Áttekintés

Ez a deployment rendszer egyetlen `setup.sh` script futtatásával telepíti az összes szükséges komponenst egy friss Raspberry Pi-re:

- ✅ Node.js 20.x
- ✅ npm package manager
- ✅ nginx web server
- ✅ MariaDB (MySQL) database
- ✅ PM2 process manager
- ✅ Angular 19 frontend
- ✅ NestJS backend
- ✅ Automatikus service indítás boot-kor

### Architektúra

```
┌─────────────────────────────────────────────────┐
│         Raspberry Pi (Debian-based OS)         │
│                                                 │
│  ┌──────────────┐      ┌──────────────┐        │
│  │   Nginx      │      │   PM2        │        │
│  │   Port 80    │      │   Process    │        │
│  │              │      │   Manager    │        │
│  │  Frontend    │      │              │        │
│  │  (Angular)   │      │  Backend     │        │
│  │              │◄────►│  (NestJS)    │        │
│  └──────────────┘      │  Port 3000   │        │
│                        └──────┬───────┘        │
│                               │                 │
│                        ┌──────▼───────┐        │
│                        │   MariaDB    │        │
│                        │   Port 3306  │        │
│                        └──────────────┘        │
│                                                 │
│  Serial Devices: /dev/ttyUSB0, /dev/ttyUSB1    │
└─────────────────────────────────────────────────┘
```

## Követelmények

### Hardware
- Raspberry Pi (Model 3B+ vagy újabb ajánlott)
- Minimum 1GB RAM
- Minimum 8GB SD kártya (16GB+ ajánlott)
- Minimum 2GB szabad hely

### Software
- Raspberry Pi OS (Debian-based)
- Internet kapcsolat
- SSH hozzáférés

### Előkészületek
1. Raspberry Pi OS telepítése SD kártyára
2. SSH engedélyezése
3. Hálózati kapcsolat beállítása (WiFi vagy Ethernet)

## Gyors Kezdés

### 1. Csatlakozás a Raspberry Pi-hez

```bash
ssh pi@<raspberry-pi-ip>
```

### 2. Projekt letöltése

```bash
git clone <repository-url> angular_prj2
cd angular_prj2
```

### 3. Deployment futtatása

```bash
sudo bash deployment/setup.sh
```

### 4. IP cím megadása

A script kéri az IP címet:
```
Enter the IP address for this Raspberry Pi [192.168.0.151]: 192.168.0.200
```

### 5. Várakozás

A telepítés 10-20 percet vesz igénybe (Pi modelltől és internet sebességtől függően).

### 6. Reboot

```bash
sudo reboot
```

### 7. Alkalmazás használata

- Frontend: `http://<ip-cím>`
- Backend API: `http://<ip-cím>:3000`

## Részletes Használat

### setup.sh - Teljes Telepítés

Ez a fő script, ami az első telepítéshez használandó.

```bash
sudo bash deployment/setup.sh
```

**Mit csinál?**

1. **Pre-flight checks** - Ellenőrzi a rendszerkövetelményeket
2. **IP konfiguráció** - Interaktív IP cím bekérés
3. **System packages** - Node.js, nginx, MariaDB, PM2 telepítése
4. **Database setup** - MySQL user, database létrehozás, dump import
5. **Frontend build** - Angular build IP konfigurációval
6. **Backend build** - NestJS build, Prisma client generálás
7. **Services config** - nginx, PM2, systemd beállítás
8. **Validation** - Minden service ellenőrzése

**Idempotencia:** A script újrafuttatható. Már végrehajtott lépéseket kihagyja.

**IP változtatás:** Ha más IP-vel futtatod, csak a frontend rebuild-elődik.

### update.sh - Alkalmazás Frissítése

Meglévő deployment frissítéséhez kód változások után.

```bash
sudo bash deployment/update.sh
```

**Mit csinál?**

1. Git pull (opcionális)
2. Frontend rebuild
3. Backend rebuild
4. Database migrations futtatása
5. Services újraindítása
6. Validáció

**Mikor használd?**

- Kód változás után
- Frontend/backend frissítés
- Database schema változás (Prisma migrations)

### Helper Scripts

A `deployment/scripts/` mappában találhatók a moduláris scriptek:

- `install-dependencies.sh` - System csomagok
- `setup-database.sh` - Database konfiguráció
- `build-frontend.sh` - Frontend build
- `build-backend.sh` - Backend build
- `configure-services.sh` - Services setup
- `validate-deployment.sh` - Egészség ellenőrzés

Ezek külön is futtathatók, de általában nem szükséges.

## Konfiguráció

### Módosítható Beállítások

#### IP Cím

Az IP cím a telepítés során kérhető, vagy módosítható a state fájlban:

```bash
# .deployment-state fájlban
INITIAL_IP_ADDRESS=192.168.0.200
```

Majd futtasd újra a setup script-et az új IP-vel.

#### Database Credentials

Alapértelmezett credentials (bele van égetve):

```
User:     Sanyi@localhost
Password: sakkiraly11
Database: nest-nh3
```

Ha változtatni szeretnéd:
1. Módosítsd `backend/.env` fájlt
2. Módosítsd `deployment/scripts/setup-database.sh` fájlt
3. Futtasd újra a setup script-et

#### PM2 Konfiguráció

A PM2 konfiguráció a `backend/ecosystem.config.js` fájlban található (generált):

```javascript
module.exports = {
  apps: [{
    name: 'iot-backend',
    script: './dist/main.js',
    instances: 1,
    max_memory_restart: '300M',
    // ... további beállítások
  }]
};
```

Módosítás után:
```bash
pm2 restart iot-backend
```

### Environment Fájlok

**Frontend:** `frontend/src/environments/environment.ts`
```typescript
export const environment = {
  backend_url: 'http://192.168.0.200:3000',
  production: true,
};
```

**Backend:** `backend/.env`
```
DATABASE_URL="mysql://Sanyi:sakkiraly11@localhost:3306/nest-nh3"
```

## Hasznos Parancsok

### PM2 - Backend Kezelés

```bash
# Backend státusz
pm2 list

# Backend újraindítás
pm2 restart iot-backend

# Backend leállítás
pm2 stop iot-backend

# Backend indítás
pm2 start iot-backend

# Logok nézése (real-time)
pm2 logs iot-backend

# Monitoring
pm2 monit

# Backend törlése PM2-ből
pm2 delete iot-backend
```

### Nginx - Frontend Kezelés

```bash
# Nginx újraindítás
sudo systemctl restart nginx

# Nginx státusz
sudo systemctl status nginx

# Nginx konfiguráció teszt
sudo nginx -t

# Nginx logok
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Kezelés

```bash
# MySQL belépés
mysql -u Sanyi -psakkiraly11 nest-nh3

# Táblák listázása
mysql -u Sanyi -psakkiraly11 nest-nh3 -e "SHOW TABLES;"

# Database backup
mysqldump -u Sanyi -psakkiraly11 nest-nh3 > backup.sql

# Database restore
mysql -u Sanyi -psakkiraly11 nest-nh3 < backup.sql
```

### Serial Port Ellenőrzés

```bash
# USB eszközök listázása
ls -la /dev/ttyUSB*
ls -la /dev/ttyACM*

# User dialout groupban?
groups $USER

# Serial port jogok
sudo chmod 666 /dev/ttyUSB0
```

### System Információk

```bash
# Disk használat
df -h

# Memory használat
free -h

# CPU terhelés
top

# Futó processek
ps aux | grep node
```

## Hibaelhárítás

### Frontend nem töltődik be

**Probléma:** Böngészőben nem elérhető a frontend

**Megoldás:**
```bash
# Nginx fut?
sudo systemctl status nginx

# Frontend fájlok jók?
ls -la /var/www/html/

# Nginx konfiguráció OK?
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Backend nem válaszol

**Probléma:** Backend API nem elérhető

**Megoldás:**
```bash
# PM2 státusz
pm2 list

# Backend logok
pm2 logs iot-backend --lines 50

# Backend újraindítás
pm2 restart iot-backend

# Port foglalt?
sudo netstat -tlnp | grep 3000
```

### Database kapcsolat hiba

**Probléma:** Backend nem tud csatlakozni az adatbázishoz

**Megoldás:**
```bash
# MySQL fut?
sudo systemctl status mariadb

# Credentials jók?
mysql -u Sanyi -psakkiraly11 nest-nh3 -e "SELECT 1;"

# .env fájl létezik?
cat backend/.env

# MySQL restart
sudo systemctl restart mariadb
```

### Serial port hozzáférés megtagadva

**Probléma:** Permission denied `/dev/ttyUSB0`

**Megoldás:**
```bash
# User hozzáadása dialout grouphoz
sudo usermod -a -G dialout $USER

# FONTOS: Reboot szükséges!
sudo reboot

# Ellenőrzés reboot után
groups $USER | grep dialout
```

### npm install hibák

**Probléma:** Native module build fail (pl. serialport)

**Megoldás:**
```bash
# Build tools telepítése
sudo apt-get install -y build-essential python3

# Cache törlés
cd frontend  # vagy backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Nem elég hely

**Probléma:** Disk space low

**Megoldás:**
```bash
# Régi package cache
sudo apt-get clean
sudo apt-get autoclean

# npm cache
npm cache clean --force

# PM2 logok rotálása
pm2 flush

# Régi kernels
sudo apt-get autoremove
```

### Port már használatban

**Probléma:** Port 80 vagy 3000 már foglalt

**Megoldás:**
```bash
# Ki használja a portot?
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000

# Process leállítása
sudo kill <PID>

# Vagy service leállítása
sudo systemctl stop <service-name>
```

## Karbantartás

### Rendszeres Feladatok

#### Database Backup (Ajánlott: Hetente)

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u Sanyi -psakkiraly11 nest-nh3 > ~/backups/nest-nh3_${DATE}.sql
# Régebbiek törlése (30 napnál régebbi)
find ~/backups/ -name "nest-nh3_*.sql" -mtime +30 -delete
```

#### Log Rotáció

PM2 automatikusan kezeli, de ellenőrizd:

```bash
# PM2 logok mérete
du -sh /var/log/pm2/

# Logok törlése
pm2 flush
```

#### System Frissítések

```bash
# System update
sudo apt-get update
sudo apt-get upgrade -y

# Node.js/npm update (óvatosan!)
# Csak ha szükséges, tesztelés után
```

#### Monitoring

Opcionális monitoring tools:

```bash
# htop telepítése
sudo apt-get install htop

# Használat
htop
```

### Alkalmazás Frissítés Workflow

1. **Fejlesztés lokálisan**
   ```bash
   # Változtatások commitálása
   git add .
   git commit -m "Feature: új funkció"
   git push
   ```

2. **Frissítés Raspberry Pi-n**
   ```bash
   ssh pi@<ip>
   cd angular_prj2
   sudo bash deployment/update.sh
   ```

3. **Tesztelés**
   - Frontend tesztelése böngészőben
   - Backend API tesztelése
   - Serial kommunikáció ellenőrzése

4. **Rollback szükség esetén**
   ```bash
   cd angular_prj2
   git checkout <previous-commit>
   sudo bash deployment/update.sh
   ```

## State Fájl (.deployment-state)

A script nyomon követi a telepítés állapotát:

```bash
SYSTEM_PACKAGES_INSTALLED=true
DATABASE_INITIALIZED=true
FRONTEND_DEPLOYED=true
BACKEND_BUILT=true
SERVICES_CONFIGURED=true
INITIAL_IP_ADDRESS=192.168.0.200
DEPLOYMENT_DATE=2025-11-30T15:30:00Z
```

**Mikor töröld:**
- Teljes újratelepítés szükséges
- Database újra inicializálása kell

```bash
rm .deployment-state
sudo bash deployment/setup.sh
```

## Biztonsági Megjegyzések

⚠️ **Figyelem:** Ez egy alapértelmezett konfiguráció fejlesztési/belső hálózati használatra.

**Production használathoz ajánlott:**

1. **Változtasd meg az alapértelmezett jelszavakat**
   - MySQL root password
   - Database user password

2. **Firewall beállítás**
   ```bash
   sudo apt-get install ufw
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 3000/tcp
   sudo ufw enable
   ```

3. **SSL/TLS (HTTPS)**
   - Let's Encrypt használata
   - Certbot telepítése

4. **Regular updates**
   - OS security updates
   - npm dependencies audit

## További Információk

### Logok Helye

- **Deployment log:** `/var/log/iot-deployment.log`
- **Backend log:** `/var/log/pm2/iot-backend-*.log`
- **Nginx access:** `/var/log/nginx/access.log`
- **Nginx error:** `/var/log/nginx/error.log`
- **MySQL error:** `/var/log/mysql/error.log`

### Konfiguráció Fájlok

- **Nginx site:** `/etc/nginx/sites-available/iot-monitoring`
- **PM2 ecosystem:** `backend/ecosystem.config.js`
- **Backend env:** `backend/.env`
- **Frontend env:** `frontend/src/environments/environment.ts`

### Támogatás

Problémák esetén ellenőrizd:
1. Deployment log (`/var/log/iot-deployment.log`)
2. Backend logs (`pm2 logs iot-backend`)
3. System logs (`journalctl -xe`)

## Changelog

### v1.0 (2025-11-30)
- ✅ Kezdeti verzió
- ✅ Automatikus telepítés support
- ✅ Idempotens script
- ✅ Update script
- ✅ Teljes validáció
- ✅ PM2 integration
- ✅ Nginx konfiguráció
- ✅ Serial port support
