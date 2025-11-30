# 🚀 Gyors Telepítési Útmutató

## 3 Lépésben Üzembe Helyezés

### 1️⃣ Raspberry Pi Előkészítés

```bash
# SSH kapcsolat
ssh pi@<raspberry-pi-ip>

# Projekt klónozás
git clone <your-repo-url> angular_prj2
cd angular_prj2
```

### 2️⃣ Telepítés Futtatása

```bash
sudo bash deployment/setup.sh
```

**Kérdések a telepítés során:**
- IP cím: Add meg a Raspberry Pi IP címét (pl. `192.168.0.151`)
- Konfirmálás: Erősítsd meg (y)

**Időtartam:** 10-20 perc ☕

### 3️⃣ Újraindítás

```bash
sudo reboot
```

## ✅ Kész!

**Frontend:** `http://<ip-cím>`
**Backend API:** `http://<ip-cím>:3000`

---

## 📝 Hasznos Parancsok

```bash
# Backend státusz
pm2 list

# Backend logok
pm2 logs iot-backend

# Backend újraindítás
pm2 restart iot-backend

# Nginx újraindítás
sudo systemctl restart nginx

# Database elérés
mysql -u Sanyi -psakkiraly11 nest-nh3
```

---

## 🔄 Alkalmazás Frissítése

Kód módosítás után:

```bash
sudo bash deployment/update.sh
```

---

## ❓ Problémák?

Nézd meg a részletes dokumentációt: [README.md](README.md)

**Logok:**
- Deployment: `/var/log/iot-deployment.log`
- Backend: `pm2 logs iot-backend`
- Nginx: `/var/log/nginx/error.log`

---

## 📦 Mit Telepít?

✅ Node.js 20.x
✅ npm
✅ nginx (web server)
✅ MariaDB (MySQL database)
✅ PM2 (process manager)
✅ Angular 19 Frontend
✅ NestJS Backend
✅ Automatikus indítás boot-kor

---

## 🎯 Követelmények

- Raspberry Pi 3B+ vagy újabb
- Min. 1GB RAM
- Min. 2GB szabad hely
- Raspberry Pi OS (Debian)
- Internet kapcsolat

---

**Részletes dokumentáció:** [README.md](README.md)
