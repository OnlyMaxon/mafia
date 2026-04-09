# Firebase Configuration Instructions

## Шаг 1: Создание Firebase Проекта

1. Перейдите на [console.firebase.google.com](https://console.firebase.google.com)
2. Нажмите "Add project" и назовите его (например, "mafia-game")
3. Отключите Google Analytics (опционально)

## Шаг 2: Включение Realtime Database

1. В левом меню выберите "Realtime Database"
2. Нажмите "Create Database"
3. Выберите "Start in test mode" (для разработки)
4. Выберите регион (лучше выбрать ближайший к вам)
5. Скопируйте Database URL (будет вида: `https://xxx-xxx.firebaseio.com`)

## Шаг 3: Включение Authentication

1. В левом меню выберите "Authentication"
2. Нажмите "Get started"
3. Официально Authentication не требуется для базовой функциональности, но рекомендуется для безопасности

## Шаг 4: Получение Firebase Config

1. Перейдите в Project Settings (иконка шестеренки)
2. Выберите вашу web app (или создайте новую)
3. Скопируйте конфиг объект

## Шаг 5: Обновление конфигурации в приложении

Firebase конфигурация уже добавлена в файл `src/services/firebase.ts` ✅

Ваша Database URL: `https://mafia-e5634-default-rtdb.firebaseio.com`

## Security Rules для Realtime Database

Если вы не в режиме test mode, используйте эти правила:

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

**Внимание:** Эти правила для разработки! Для production используйте более строгие правила.

## Готово!

Теперь приложение будет синхронизироваться с Firebase в реальном времени.
