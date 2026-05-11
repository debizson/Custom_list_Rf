# Bevásárlólista alkalmazás dokumentáció

## Projekt áttekintése

A projekt egy MEAN stack alapú bevásárlólista rendszer, amelynek célja, hogy a felhasználók hosszú távon is kényelmesen tudják kezelni a vásárlásaikat. A rendszer nem csak egyszerű listaírásra alkalmas, hanem teljes körű vásárlásmenedzsmentet valósít meg: a felhasználó saját listákat hozhat létre, azokhoz termékeket rendelhet, kategóriákba sorolhatja az elemeket, boltot társíthat a listákhoz, rendezheti az itemeket, és nyomon követheti a vásárlási állapotot.

Az alkalmazás felhasználói és adminisztrátori szerepköröket is kezel. A felhasználók saját bevásárlólistáikat kezelik, az admin pedig külön menedzser felületen áttekintheti és törölheti a regisztrált felhasználókat.

## Választott technológiai stack

Az alkalmazás a MEAN stackre épül:

- MongoDB: dokumentumorientált adatbázis
- Express.js: backend API keretrendszer
- Angular: frontend keretrendszer
- Node.js: JavaScript futtatókörnyezet

Kiegészítő technológiák:

- Mongoose: MongoDB modellezés és séma kezelés
- JWT: token alapú autentikáció
- bcryptjs: jelszavak biztonságos hash-elése
- Docker Compose: MongoDB konténer futtatása
- SCSS: frontend stílusok kezelése

## Technológiai döntések indoklása

### MongoDB

A MongoDB jól illeszkedik egy bevásárlólista alkalmazáshoz, mert a rendszer adatai természetes módon dokumentumszerűek. A felhasználókhoz listák, a listákhoz itemek, az itemekhez kategóriák kapcsolódnak. A MongoDB rugalmas sémakezelése előnyös, mert az alkalmazás később könnyen bővíthető új mezőkkel, például mennyiségi egységgel, kedvenc termékekkel vagy további statisztikai adatokkal.

### Express.js és Node.js

Az Express.js egyszerű, gyors és jól átlátható API réteget biztosít. A backend REST végpontokon keresztül szolgálja ki az Angular frontendet. A Node.js használata azért előnyös, mert a teljes alkalmazás JavaScript/TypeScript környezetben tartható, így a frontend és backend fejlesztése egységes szemléletben történhet.

### Angular

Az Angular egy nagyobb tanulási görbével rendelkező keretrendszer, viszont cserébe erős struktúrát, nagy ökoszisztémát és jól támogatott fejlesztői környezetet ad. Minden fontos frontend képesség egyben elérhető benne: komponensek, adatkötés, űrlapkezelés, HTTP kliens, interceptorok, routing és jól szervezhető alkalmazásstruktúra.

Ebben a projektben különösen előnyös az Angular kétirányú adatkötése és komponensalapú működése. A felhasználói műveletek után az adatok gyorsan frissülnek a felületen, az oldalak nem töltődnek újra, az alkalmazás SPA jellegű élményt ad.

### Mongoose

A Mongoose segít a MongoDB kollekciók strukturált kezelésében. A projektben modellek készültek a felhasználókhoz, listákhoz, itemekhez, kategóriákhoz és boltokhoz. Ez átláthatóvá teszi az adatmodellt és egyszerűsíti a validációt.

### JWT és bcryptjs

Az autentikáció JWT tokenekkel működik, így a frontend minden védett API kéréshez tokennel azonosítja a felhasználót. A jelszavak nem nyersen kerülnek az adatbázisba, hanem bcryptjs segítségével hash-elve. Ez alapvető biztonsági követelmény minden felhasználói fiókokat kezelő rendszerben.

## Adatbázis felépítése

A projekt jelenleg öt fő kollekciót használ:

### users

A regisztrált felhasználók adatait tartalmazza.

Főbb mezők:

- name
- email
- passwordHash
- role
- createdAt

A role lehet:

- user
- admin

### lists

A bevásárlólistákat tárolja.

Főbb mezők:

- name
- userId
- storeId
- createdAt

### items

A listákhoz tartozó termékeket tárolja.

Főbb mezők:

- name
- quantity
- price
- completed
- order
- listId
- categoryId
- createdAt

### categories

A felhasználó saját termékkategóriáit tárolja.

Példák:

- Gyümölcs
- Zöldség
- Tejtermék
- Hús
- Háztartás

### stores

A felhasználó által létrehozott boltokat tárolja.

Példák:

- Lidl
- Aldi
- Tesco
- Spar

## Adatmodell kapcsolatok

Az adatmodell fő kapcsolatai:

```text
User 1 - N List
User 1 - N Category
User 1 - N Store
Store 1 - N List
List 1 - N Item
Category 1 - N Item
```

Ez a struktúra lehetővé teszi, hogy minden felhasználó csak a saját listáit, kategóriáit és boltjait kezelje.

## Megvalósított funkcionális követelmények

### Felhasználói regisztráció és bejelentkezés

A rendszer lehetővé teszi új felhasználók regisztrációját és meglévő felhasználók bejelentkezését. A jelszavak hash-elve kerülnek mentésre az adatbázisba. A belépés után a frontend JWT tokent tárol, és ezzel hitelesíti a további kéréseket.

### Adminisztrátori jogosultság

Az első regisztrált felhasználó automatikusan admin szerepkört kap. Az admin külön menedzser oldalon látja a regisztrált usereket, és szükség esetén törölheti őket. A törlés előtt a rendszer megerősítést kér, sikeres törlés után snackbar üzenet jelenik meg.

### Bevásárlólisták kezelése

A felhasználó saját bevásárlólistákat hozhat létre, megtekintheti azokat, kereshet közöttük, kiválaszthat egy aktív listát, valamint törölheti a listákat. A törlés előtt a rendszer rákérdez, hogy a felhasználó valóban törölni szeretné-e az adott listát.

### Listaelemek kezelése

A kiválasztott listához termékek adhatók hozzá névvel, mennyiséggel és árral. Az itemek kipipálhatók, törölhetők, illetve húzással sorrendezhetők. A sorrendezés a backendben is mentésre kerül.

### Kategóriák kezelése

A felhasználó saját kategóriákat hozhat létre, majd ezeket hozzárendelheti a listaelemekhez. A kategória neve megjelenik az item sorában, így a bevásárlólista áttekinthetőbbé válik.

### Boltok kezelése

A felhasználó boltokat hozhat létre, majd az aktuális listához boltot rendelhet. A bolt módosítása után a lista adatai azonnal frissülnek a felületen. Ár-összehasonlítás nem része a rendszernek.

### Keresés a listák között

A bal oldali sávban keresőmező található. Gépelés közben a listák megjelenített halmaza azonnal változik, így a felhasználó gyorsan megtalálhatja a kívánt listát.

### Világos és sötét mód

A főoldalon jobb felső sarokban található ikon segítségével váltható a világos és sötét megjelenítés. A választás localStorage-ban tárolódik, ezért frissítés után is megmarad.

### Egységes vizuális megjelenés

Az alkalmazás minden oldalán egységes, halvány bevásárlós/gyümölcsös háttér jelenik meg. Ez vizuálisan összeköti a bejelentkezési, regisztrációs, főoldali és admin felületeket.

### Komplex, hosszú távra tervezett rendszer

A rendszer nem csak egyszerű listaíró alkalmazás, hanem komplex bevásárlásmenedzsment felület. A vásárlás teljes folyamata kezelhető: listák létrehozása, termékek kezelése, kategorizálás, bolthoz rendelés, teljesítettség követése és sorrendezés. Az adatmodell bővíthető, ezért a projekt hosszú távú használatra és továbbfejlesztésre is alkalmas.

## Megvalósított nem-funkcionális követelmények

### Jó adatkötés a rétegek között

Az Angular frontend és az Express backend között jól működnek az adatkötések. A frontend service rétegei strukturáltan hívják a backend REST API-kat, a backend pedig Mongoose modelleken keresztül kommunikál a MongoDB adatbázissal.

Rétegek:

```text
Angular komponens
Angular service
Express route
Mongoose model
MongoDB kollekció
```

Ez az elválasztás átláthatóvá és karbantarthatóvá teszi a rendszert.

### Azonnali felületi frissülés

A változások a legtöbb művelet után azonnal láthatóak a felületen. Ha a felhasználó listát hoz létre, itemet ad hozzá, kipipál egy terméket, boltot módosít vagy sorrendet változtat, a frontend állapota rögtön frissül. Ez nagy előnye az Angular technológiának és az SPA működésnek.

### Oldalújratöltés nélküli működés

Az alkalmazás SPA jellegű, ezért az oldalak nem töltődnek újra minden műveletnél. A felhasználói élmény gyorsabb és folyamatosabb, mert a változások komponensszinten történnek.

### Reszponzív, telefonos nézet

A frontend reszponzív kialakítást kapott. A kétpaneles elrendezés kisebb képernyőn egymás alá rendeződik, így telefonos nézetben is használható marad. Az űrlapok, item sorok és admin sorok mobilon is egyoszlopos elrendezésben jelennek meg.

### Biztonságos jelszókezelés

A jelszavak nem nyers formában tárolódnak. A backend bcryptjs segítségével hash-eli a jelszót, és csak a hash kerül mentésre. Ez fontos biztonsági követelmény.

### Token alapú védelem

A védett route-ok csak érvényes JWT tokennel érhetők el. A listák, kategóriák és boltok userhez kötöttek, így a felhasználók csak a saját adataikat kezelik.

### Jogosultságkezelés

A rendszer elkülöníti a user és admin szerepkört. Az admin külön funkciókat ér el, de saját magát nem törölheti. Ez csökkenti a véletlen jogosultsági hibák esélyét.

### Karbantarthatóság

A projekt jól elkülönített fájlstruktúrával rendelkezik:

- backend modellek
- backend route-ok
- auth middleware
- frontend service-ek
- frontend modellek
- Angular komponens

Ez megkönnyíti a későbbi fejlesztést és hibakeresést.

### Bővíthetőség

A rendszer adatmodellje bővíthető. A későbbiekben hozzáadható például kedvenc termékek kezelése, megosztott listák, mennyiségi egységek, értesítések vagy részletesebb statisztika.

## Fontosabb API végpontok

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### Admin

```text
GET /api/admin/users
DELETE /api/admin/users/:id
```

### Lists

```text
GET /api/lists
POST /api/lists
GET /api/lists/:id
PUT /api/lists/:id
DELETE /api/lists/:id
```

### Items

```text
GET /api/lists/:listId/items
POST /api/lists/:listId/items
PUT /api/lists/:listId/items/:itemId
DELETE /api/lists/:listId/items/:itemId
PUT /api/lists/:listId/reorder
```

### Categories

```text
GET /api/categories
POST /api/categories
DELETE /api/categories/:id
```

### Stores

```text
GET /api/stores
POST /api/stores
DELETE /api/stores/:id
```

## Indítás

### MongoDB

Docker Compose használatával:

```bash
sudo docker compose restart mongodb
```

### Backend

```bash
cd backend
npm run dev
```

Backend URL:

```text
http://localhost:3000/
```

### Frontend

```bash
cd frontend
npm start
```

Frontend URL:

```text
http://localhost:4200/
```

## Környezeti változók

A backendhez szükséges környezeti változók példája:

```env
MONGO_URI=mongodb://localhost:27017/shopping-list
PORT=3000
JWT_SECRET=change-this-development-secret
```

## Összegzés

A projekt egy komplex, hosszú távon is használható bevásárlólista rendszer. A választott MEAN stack jól illeszkedik a feladathoz, mert egységes JavaScript/TypeScript alapú fejlesztést tesz lehetővé. Az Angular erős adatkötései, komponensalapú felépítése és nagy ökoszisztémája miatt a frontend jól strukturált és gyorsan reagál a felhasználói műveletekre. A backend Express és Mongoose alapokon átlátható API-t és adatkezelést biztosít, a MongoDB pedig rugalmasan támogatja a bővíthető adatmodellt.

Az alkalmazás megfelel a fő funkcionális követelményeknek: felhasználókezelés, admin kezelés, listák, itemek, kategóriák, boltok, keresés, rendezés és vizuális testreszabás. A nem-funkcionális követelmények közül teljesül a biztonságos jelszókezelés, a token alapú védelem, az azonnali felületi frissülés, az oldalújratöltés nélküli működés és a reszponzív telefonos nézet.
