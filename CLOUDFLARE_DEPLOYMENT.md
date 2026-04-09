# Cloudflare Deployment Guide

## Деплой на Cloudflare Pages

### 1. Подготовка проекта

```bash
# Убедитесь что .env.local в .gitignore
git add .
git commit -m "Setup Firebase env variables"
git push
```

### 2. Настройка в Cloudflare Dashboard

1. **Зайдите на [pages.cloudflare.com](https://pages.cloudflare.com)**
2. Нажмите "Create a project" → "Connect to Git"
3. Выберите ваш GitHub репозиторий

### 3. Конфигурация сборки

В Cloudflare Pages установите:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node.js version:** 18.x

### 4. Environment Variables

В разделе "Settings" → "Environment variables" добавьте:

```
VITE_FIREBASE_API_KEY = AIzaSyBY8A2Y3NdfHgLKWT8kaU461AoGsz7pfks
VITE_FIREBASE_AUTH_DOMAIN = mafia-e5634.firebaseapp.com
VITE_FIREBASE_DATABASE_URL = https://mafia-e5634-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID = mafia-e5634
VITE_FIREBASE_STORAGE_BUCKET = mafia-e5634.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 128375195392
VITE_FIREBASE_APP_ID = 1:128375195392:web:194c4f7547c25d652b15e5
```

### 5. Запуск деплоя

После добавления переменных окружения:
1. Нажмите "Save and Deploy"
2. Cloudflare начнёт сборку и деплой
3. Готово! Приложение будет доступно на `your-project.pages.dev`

## CORS для Firebase

Убедитесь что в Firebase добавлены домены:
1. Перейдите в Firebase Console → Settings → Authorized domains
2. Добавьте `your-project.pages.dev`

## Security Rules для Realtime Database

Используйте эти правила (Settings → Rules):

```json
{
  "rules": {
    "games": {
      "$gameCode": {
        ".read": true,
        ".write": true,
        "players": {
          ".read": true,
          ".write": true,
          "$playerId": {
            ".read": true,
            ".write": true
          }
        }
      }
    }
  }
}
```

## Troubleshooting

**Ошибка: Переменные окружения не подхватываются**
- Проверьте что все `VITE_` переменные добавлены в Cloudflare
- Пересоберите проект (Re-deploy)

**CORS ошибки с Firebase**
- Добавьте домен в Authorized domains в Firebase
- Очистите кэш браузера

**Приложение не загружается**
- Проверьте Deploy logs в Cloudflare
- Убедитесь что `dist` папка не в `.gitignore`
