# 🎭 Vistula Family — Party Games

Веб-платформа для вечеринок с двумя играми: **Мафия** и **Русская рулетка**. Синхронизация в реальном времени через Firebase, деплой на Cloudflare Pages.

## 🎮 Игры

### 🎭 Мафия
Классическая игра на дедукцию. Ведущий распределяет роли, игроки ищут мафию голосованием.

**Роли:**
| Роль | Действие |
|------|----------|
| 🔪 Мафия | Убивает мирных по ночам |
| ⭐ Шериф | Раскрывает мафию днём |
| 💊 Доктор | Спасает игрока по ночам |
| 😈 Маньяк | Убивает каждую ночь |
| 👯 Путана | Блокирует способность цели |
| 👤 Мирный | Голосует днём |

### 🔫 Русская рулетка
6 камор, от 1 до 5 пуль. Игроки по очереди нажимают на курок — выживший побеждает.

- Хост настраивает количество пуль перед игрой
- Порядок ходов перемешивается случайно
- После 6 выстрелов барабан перезаряжается
- Побеждает последний живой игрок

---

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- npm

### Установка

```bash
npm install
cp .env.example .env.local   # заполни Firebase конфиг
npm run dev
```

Приложение: [http://localhost:5173](http://localhost:5173)

```bash
npm run build    # production сборка
npm run preview  # предпросмотр сборки
```

---

## 🔧 Настройка Firebase

Подробно — в [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

### Переменные окружения (`.env.local`)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Firebase Rules

Скопируй правила из [FIREBASE_RULES.md](./FIREBASE_RULES.md) в Firebase Console → Realtime Database → Rules.

> Правила разрешают запись в пути `games/` (Мафия) и `roulette/` (Русская рулетка).

---

## 🚀 Деплой

Cloudflare Pages — инструкция в [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md).

1. Запуши код на GitHub
2. Подключи репозиторий в Cloudflare Pages
3. Добавь переменные `VITE_*` в настройках проекта
4. Deploy готов

---

## 📋 Структура проекта

```
src/
├── pages/
│   ├── Home.tsx                  # Главная — выбор игры
│   │
│   ├── HostAuth.tsx              # Авторизация ведущего (Мафия)
│   ├── HostChoice.tsx            # Создать / присоединиться
│   ├── HostEditor.tsx            # Настройка ролей
│   ├── HostWaiting.tsx           # Зал ожидания (хост)
│   ├── HostGame.tsx              # Активная игра (хост)
│   ├── PlayerJoin.tsx            # Вход игрока
│   ├── PlayerWaiting.tsx         # Ожидание роли (игрок)
│   │
│   ├── RouletteHome.tsx          # Лендинг рулетки
│   ├── RouletteHostSetup.tsx     # Настройка и зал ожидания (хост)
│   ├── RouletteHostPlay.tsx      # Активная игра (хост)
│   ├── RouletteJoin.tsx          # Вход игрока в рулетку
│   └── RoulettePlay.tsx          # Активная игра (игрок)
│
├── services/
│   ├── firebase.ts               # Firebase инициализация
│   ├── gameService.ts            # Сервис Мафии
│   └── rouletteService.ts        # Сервис Русской рулетки
│
├── types/
│   ├── game.ts                   # Типы Мафии
│   └── roulette.ts               # Типы Рулетки
│
├── utils/
│   └── gameLogic.ts              # Логика ролей и генерации кода
│
└── App.tsx                       # Роутер
```

### Маршруты

| Путь | Страница |
|------|----------|
| `/` | Главная |
| `/host-auth` | Авторизация ведущего |
| `/host-choice` | Выбор режима хоста |
| `/host-editor` | Настройка ролей |
| `/host-waiting/:code` | Ожидание игроков (хост) |
| `/host-game/:code` | Активная игра (хост) |
| `/player-join` | Присоединение игрока |
| `/player-waiting/:code` | Ожидание старта (игрок) |
| `/roulette` | Лендинг рулетки |
| `/roulette/host-setup` | Настройка рулетки (хост) |
| `/roulette/host-play/:code` | Активная рулетка (хост) |
| `/roulette/join` | Вход в рулетку |
| `/roulette/play/:code` | Активная рулетка (игрок) |

---

## 🎯 Как играть

### Мафия — для ведущего

1. Главная → **Host** → введи пароль `7250mafia!`
2. Настрой количество ролей
3. Поделись кодом комнаты с игроками
4. Нажми **Start Game** — роли раздадутся автоматически
5. Веди игру по списку ролей, делай заметки

### Мафия — для игрока

1. Главная → **Play** → введи код комнаты и имя
2. Жди старта — получишь роль
3. Действуй согласно своей роли

### Русская рулетка — для хоста

1. Главная → **Russian Roulette** → **Host**
2. Выбери количество пуль (1–5 из 6 камор)
3. Поделись кодом комнаты — жди минимум 2 игроков
4. Нажми **Start Game**
5. Нажимай **Pull Trigger** за текущего игрока или жди пока игрок сам нажмёт

### Русская рулетка — для игрока

1. Главная → **Russian Roulette** → **Play** → введи код и имя
2. Жди старта
3. Когда твой ход — нажми **PULL TRIGGER**
4. Выживи

---

## 🗄️ Структура Firebase

```
games/
  {gameCode}/           # Игры Мафии
    status, players, roles, ...

roulette/
  {gameCode}/           # Игры Рулетки
    status, players, bulletChambers, currentChamber, ...
```

---

## 📱 Контакты

- **Дон:** @0nlymaxon
- **Instagram:** [@vistula.family](https://instagram.com/vistula.family)

---

Создано с ❤️ для Vistula Family
