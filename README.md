# Bevásárlólista alkalmazás indítása git pull után

Ez a projekt egy MEAN stack alapú bevásárlólista alkalmazás:

- MongoDB
- Express.js backend
- Angular frontend
- Node.js

## Gyors indítás

Projekt gyökeréből:

```bash
git pull
./run-compose.sh
```

A script elvégzi ezeket:

- elindítja a MongoDB Docker konténert
- létrehozza a `backend/.env` fájlt, ha még nincs
- telepíti a backend függőségeket, ha hiányzik a `node_modules`
- telepíti a frontend függőségeket, ha hiányzik a `node_modules`
- elindítja a backendet
- elindítja a frontendet

Elérési URL-ek:

```text
Frontend: http://localhost:4200/
Backend:  http://localhost:3000/
```

A backend és frontend leállításához nyomj `Ctrl+C`-t abban a terminálban, ahol a script fut.

## Első indítás előtt

Legyen telepítve:

- Docker
- Docker Compose
- Node.js
- npm

Ha a Dockerhez csak `sudo`-val van jogosultságod, a script automatikusan megpróbálja a `sudo docker compose` parancsot. Ilyenkor a terminál jelszót kérhet.

## Környezeti változók

Ha nincs `backend/.env`, a script létrehozza a `backend/.env.example` alapján.

Ajánlott tartalom:

```env
MONGO_URI=mongodb://admin:password@localhost:27017/shopping-list?authSource=admin
PORT=3000
JWT_SECRET=change-this-development-secret
```

## Kézi indítás

Ha nem a scriptet szeretnéd használni, ezekkel a parancsokkal indítható külön.

MongoDB:

```bash
sudo docker compose up -d mongodb
```

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend másik terminálban:

```bash
cd frontend
npm install
npm start
```

## Használat

Nyisd meg böngészőben:

```text
http://localhost:4200/
```

Az első regisztrált felhasználó automatikusan admin jogosultságot kap.

## Gyakori hibák

### EADDRINUSE: address already in use :::3000

Ez azt jelenti, hogy már fut egy backend példány a `3000`-es porton.

Folyamatok keresése:

```bash
pgrep -af "node server.js|nodemon server.js"
```

Folyamat leállítása:

```bash
kill <PID>
```

Ezután indítsd újra:

```bash
./run-compose.sh
```

### Docker permission denied

Ha ezt látod:

```text
permission denied while trying to connect to the docker API
```

akkor a script megpróbál `sudo`-val továbbmenni. Ha mégis megáll, indítsd a MongoDB-t kézzel:

```bash
sudo docker compose up -d mongodb
```

majd futtasd újra:

```bash
./run-compose.sh
```
