# Hackaton 2026 #1 — RTS 2D Multiplayer

Gra RTS w czasie rzeczywistym dla **4 graczy** online, tworzona w ramach **Hackaton 2026 #1**.

**Repozytorium:** [github.com/MatthewMill02/Hackaton-2026-1-RTS](https://github.com/MatthewMill02/Hackaton-2026-1-RTS)

---

## Założenia hackatonu

| Wymaganie | Status |
|-----------|--------|
| Multiplayer (min. 4 osoby) | ✅ Architektura P2P (PeerJS), do 4 graczy |
| Temat: RTS | ✅ Real-time strategy — jednostki, rozkazy ruchu |
| Grafika: dowolna | ✅ Phaser 3 (2D) |
| Min. 1 BOT | 🔜 W planie |
| GitHub | ✅ |
| Gotowy build (bez instalacji silnika) | ✅ Build Vite → folder `dist/` |

### Zasady projektu

- Kod tworzony z wykorzystaniem czatu AI (Cursor) — zgodnie z wymaganiami hackatonu
- Bez gotowych gier / template'ów — projekt pisany od zera
- Limit rozgrywki: **max. 1 godzina** na grę (docelowo)

### Kryteria oceny

- Mechanika
- Pomysłowość
- Grafika / styl graficzny

---

## Technologie

| Technologia | Rola |
|-------------|------|
| [Vite](https://vitejs.dev/) | Bundler, dev server, produkcyjny build |
| [TypeScript](https://www.typescriptlang.org/) | Typowany JavaScript |
| [Phaser 3](https://phaser.io/) | Silnik gry 2D |
| [PeerJS](https://peerjs.com/) | Multiplayer P2P (WebRTC) |
| [EasyStar.js](https://github.com/prettymuchbryce/easystarjs) | Pathfinding (planowany) |

---

## Struktura projektu

```
src/
├── main.ts                 # Punkt wejścia
├── shared/types.ts         # Wspólne typy i stałe
├── network/                # Logika sieciowa (PeerJS)
│   ├── NetworkManager.ts
│   └── types.ts
├── game/                   # Widoki / sceny Phaser
│   ├── GameConfig.ts
│   └── scenes/
│       ├── BootScene.ts
│       ├── MenuScene.ts
│       └── GameScene.ts
└── units/                  # Sterowanie jednostkami
    ├── Unit.ts
    └── UnitController.ts
```

---

## Uruchomienie — dla jurorów (bez instalacji silnika)

Juror **nie musi** instalować Node.js, Phaser ani żadnego silnika gry. Wystarczy **przeglądarka** (Chrome, Firefox lub Edge).

### Opcja A — host udostępnia build (zalecane)

1. Host buduje grę: `npm run build` (lub używa gotowego folderu `dist/`).
2. Host serwuje folder `dist/` dowolnym serwerem statycznym, np.:
   ```bash
   npm run preview
   ```
3. Juror otwiera w przeglądarce adres podany przez hosta, np.:
   ```
   http://192.168.x.x:4173
   ```
   lub adres Radmin VPN hosta.

### Opcja B — lokalny podgląd buildu (jeśli masz Node.js)

```bash
npm install
npm run build
npm run preview
```

Gra dostępna pod: **http://localhost:4173**

---

## Uruchomienie — dla deweloperów

### Wymagania

- [Node.js](https://nodejs.org/) 18 lub nowszy
- npm (dołączony do Node.js)

### Szybki start (Windows)

Dwukrotnie kliknij plik **`uruchom.bat`**. Skrypt:

1. Zainstaluje zależności (jeśli brakuje `node_modules`)
2. Uruchomi serwer deweloperski Vite

Gra: **http://localhost:5173**

### Ręcznie (Windows / macOS / Linux)

```bash
npm install
npm run dev
```

### Skrypty npm

| Komenda | Opis |
|---------|------|
| `npm run dev` | Serwer deweloperski (http://localhost:5173) |
| `npm run build` | Kompilacja TypeScript + build produkcyjny → `dist/` |
| `npm run preview` | Podgląd buildu produkcyjnego (http://localhost:4173) |

---

## Multiplayer — jak zagrać w 4 osoby

Połączenie odbywa się przez **Radmin VPN** (wirtualna sieć lokalna) + **PeerJS** (sygnalizacja i transfer danych P2P).

### Krok po kroku

1. **Wszyscy gracze** łączą się do tej samej sieci w [Radmin VPN](https://www.radmin-vpn.com/).
2. **Host** uruchamia grę (`uruchom.bat` lub `npm run dev` / `npm run preview` po buildzie).
3. Host sprawdza swój **IP w Radmin** (np. `26.36.235.88`) i podaje innym adres:
   ```
   http://26.36.235.88:5173
   ```
   (port `4173` jeśli używasz `npm run preview` po buildzie)
4. **Pozostali gracze** otwierają ten adres w przeglądarce — **bez instalacji Node.js**.
5. W menu gry:
   - **Host** → „Utwórz grę (Host)” → kopiuje wyświetlone **Peer ID**
   - **Gracze 2–4** → „Dołącz do gry” → wklejają Peer ID hosta
6. Gra startuje automatycznie po dołączeniu **4 graczy**.

### Sterowanie (obecna wersja)

| Akcja | Klawisz / mysz |
|-------|----------------|
| Zaznacz jednostkę | LPM |
| Rozkaz ruchu | PPM |
| Powrót do menu | ESC |

---

## Stan projektu (tydzień hackatonu)

### Zrobione

- [x] Konfiguracja projektu (Vite, TypeScript, Phaser 3, PeerJS)
- [x] Modułowa struktura kodu (`network/`, `game/`, `units/`)
- [x] Menu host / join (multiplayer P2P)
- [x] Podstawowe sterowanie jednostką + synchronizacja ruchu
- [x] Build produkcyjny gotowy dla jurorów
- [x] Obsługa Radmin VPN (serwer nasłuchuje na sieci)

### W planie

- [ ] Min. 1 BOT (wymaganie hackatonu)
- [ ] Pathfinding (EasyStar.js)
- [ ] Mechaniki RTS (zbieractwo, budowanie, walka)
- [ ] Grafika / styl wizualny
- [ ] Limit czasu gry (1 h)

---

## Licencja

Projekt hackatonowy — Hackaton 2026 #1.
