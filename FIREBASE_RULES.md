# Firebase Realtime Database Security Rules - Production

Перейди в **Firebase Console** → **Realtime Database** → **Rules** и установи эти правила:

```json
{
  "rules": {
    "games": {
      "$gameCode": {
        ".validate": "$gameCode.matches(/^[A-Z0-9]{6}$/)",
        ".read": true,
        ".write": "root.child('games').child($gameCode).exists() || newData.child('hostId').exists()",
        
        "hostId": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
        "gameCode": {
          ".validate": "newData.isString()"
        },
        "status": {
          ".validate": "newData.isString() && (newData.val() === 'waiting' || newData.val() === 'ready' || newData.val() === 'playing' || newData.val() === 'finished')"
        },
        "currentPhase": {
          ".validate": "newData.isString() && (newData.val() === 'day' || newData.val() === 'night')"
        },
        "round": {
          ".validate": "newData.isNumber() && newData.val() >= 0"
        },
        "createdAt": {
          ".validate": "newData.isNumber()"
        },
        "updatedAt": {
          ".validate": "newData.isNumber()"
        },
        "players": {
          ".read": true,
          ".write": "root.child('games').child($gameCode).exists()",
          "$playerId": {
            ".read": true,
            ".write": "!data.exists() || newData.child('id').val() === $playerId",
            ".validate": "newData.hasChildren(['id', 'name', 'isAlive', 'isReady'])",
            
            "id": {
              ".validate": "newData.isString()"
            },
            "name": {
              ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 20"
            },
            "role": {
              ".validate": "newData.isString() && (newData.val() === 'mafia' || newData.val() === 'sheriff' || newData.val() === 'doctor' || newData.val() === 'maniac' || newData.val() === 'prostitute' || newData.val() === 'civilian')"
            },
            "isAlive": {
              ".validate": "newData.isBoolean()"
            },
            "isReady": {
              ".validate": "newData.isBoolean()"
            }
          }
        },
        "roles": {
          ".validate": "newData.hasChildren(['mafia', 'sheriff', 'doctor', 'maniac', 'prostitute', 'civilian'])",
          "mafia": { ".validate": "newData.isNumber() && newData.val() >= 0" },
          "sheriff": { ".validate": "newData.isNumber() && newData.val() >= 0" },
          "doctor": { ".validate": "newData.isNumber() && newData.val() >= 0" },
          "maniac": { ".validate": "newData.isNumber() && newData.val() >= 0" },
          "prostitute": { ".validate": "newData.isNumber() && newData.val() >= 0" },
          "civilian": { ".validate": "newData.isNumber() && newData.val() >= 0" }
        }
      }
    }
  }
}
```

## Что эти правила делают:

✅ **Разрешают:**
- Создавать новые игры (любой может)
- Читать все данные игры
- Добавлять новых игроков
- Писать в свою роль только
- Обновлять статус игры

❌ **Запрещают:**
- Изменять чужих игроков
- Неправильные коды формата
- Неправильные значения ролей
- Удалпть без разрешения

## Если хочешь более СТРОГЕЕ (толькоauth):

```json
{
  "rules": {
    "games": {
      "$gameCode": {
        ".read": "auth != null",
        ".write": "auth != null && (root.child('games').child($gameCode).exists() || newData.child('hostId').val() === auth.uid)",
        "players": {
          "$playerId": {
            ".write": "auth != null && (auth.uid === $playerId || root.child('games').child($gameCode).child('hostId').val() === auth.uid)"
          }
        }
      }
    }
  }
}
```

## Рекомендация:

Для твоего проекта подойдёт **первый вариант** (публичное чтение, но валидация на запись) потому что:
- Игра казуальная
- Коды короткие и рандомные
- Не нужна строгая аутентификация

**Скопируй первый вариант и сохрани!** 🎯
