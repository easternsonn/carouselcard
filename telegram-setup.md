# Инструкция по настройке отправки заявок в Telegram

## Шаг 1: Создание Telegram бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Придумайте имя для бота (например: "Карусель Центр")
   - Придумайте username для бота (должен заканчиваться на `bot`, например: `karusel_center_bot`)
4. Сохраните токен, который вам даст BotFather (выглядит как: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Шаг 2: Получение Chat ID

**Способ 1: Через @userinfobot**
1. Найдите в Telegram [@userinfobot](https://t.me/userinfobot)
2. Отправьте боту любое сообщение
3. Он ответит вам вашим Chat ID (например: `123456789`)

**Способ 2: Через группу (если хотите получать заявки в группу)**
1. Создайте группу в Telegram
2. Добавьте вашего бота в группу (как администратора, необязательно)
3. Отправьте любое сообщение в группу
4. Откройте в браузере: `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
5. Найдите в ответе `chat.id` - это ID группы (будет отрицательным числом)

## Шаг 3: Настройка формы на сайте

Откройте файл `script.js` и найдите строки:

```javascript
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';
```

Замените:
- `YOUR_BOT_TOKEN` на токен, полученный от BotFather
- `YOUR_CHAT_ID` на ваш Chat ID

Пример:
```javascript
const TELEGRAM_BOT_TOKEN = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';
const TELEGRAM_CHAT_ID = '123456789';
```

## Варианты реализации

### ⚠️ Вариант 1: Прямая отправка (простой, но небезопасный)

**Плюсы:**
- Простая настройка
- Не требует backend

**Минусы:**
- Токен бота будет виден в исходном коде сайта
- Любой может посмотреть токен и использовать вашего бота

**Когда использовать:**
- Для тестирования
- Для простых проектов с низкой важностью безопасности

Текущий код в `script.js` уже использует этот вариант.

---

### ✅ Вариант 2: Через промежуточный сервер (рекомендуется)

**Плюсы:**
- Безопасно (токен хранится на сервере)
- Можно добавить дополнительную логику (валидация, сохранение в БД)
- Можно защитить от спама

**Минусы:**
- Требует backend сервер

#### Реализация через Node.js (Express)

Создайте файл `server.js`:

```javascript
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';

app.post('/api/send-telegram', async (req, res) => {
    try {
        const { message } = req.body;
        
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, error: data.description });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

**package.json:**
```json
{
  "name": "telegram-bot-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "node-fetch": "^2.6.7",
    "cors": "^2.8.5"
  }
}
```

**Установка:**
```bash
npm install
node server.js
```

**В script.js замените:**
```javascript
// Закомментируйте строку:
// await sendToTelegramDirect(telegramMessage);

// Раскомментируйте строку:
await sendToTelegramViaServer(telegramMessage);
```

И обновите URL в функции `sendToTelegramViaServer`:
```javascript
const BACKEND_URL = 'http://localhost:3000/api/send-telegram';
// или
const BACKEND_URL = 'https://your-domain.com/api/send-telegram';
```

#### Реализация через Python (Flask)

Создайте файл `server.py`:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN'
TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID'

@app.route('/api/send-telegram', methods=['POST'])
def send_telegram():
    try:
        data = request.get_json()
        message = data.get('message')
        
        url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
        
        response = requests.post(url, json={
            'chat_id': TELEGRAM_CHAT_ID,
            'text': message,
            'parse_mode': 'HTML'
        })
        
        if response.status_code == 200:
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': response.text}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000)
```

**requirements.txt:**
```
Flask==2.3.3
flask-cors==4.0.0
requests==2.31.0
```

**Установка:**
```bash
pip install -r requirements.txt
python server.py
```

---

### Вариант 3: Использование serverless функций

#### Netlify Functions

Создайте папку `netlify/functions/` и файл `send-telegram.js`:

```javascript
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    try {
        const { message } = JSON.parse(event.body);
        
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        
        return {
            statusCode: 200,
            body: JSON.stringify({ success: data.ok })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
```

В `script.js`:
```javascript
const BACKEND_URL = '/.netlify/functions/send-telegram';
```

#### Vercel Serverless Functions

Создайте папку `api/` и файл `send-telegram.js`:

```javascript
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    try {
        const { message } = req.body;
        
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        
        res.status(200).json({ success: data.ok });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

В `script.js`:
```javascript
const BACKEND_URL = '/api/send-telegram';
```

## Тестирование

1. Откройте сайт в браузере
2. Заполните форму
3. Отправьте заявку
4. Проверьте Telegram - должно прийти сообщение с данными заявки

## Безопасность

⚠️ **Важно:**
- Никогда не публикуйте токен бота в публичных репозиториях
- Для production используйте Вариант 2 (через backend)
- Добавьте защиту от спама (rate limiting)
- Рассмотрите возможность добавления reCAPTCHA

## Решение проблем

**Сообщения не приходят:**
1. Проверьте, что токен и Chat ID указаны правильно
2. Убедитесь, что бот запущен (напишите ему в Telegram)
3. Проверьте консоль браузера на ошибки (F12)
4. Проверьте права бота в группе (если используете группу)

**Ошибка 401 Unauthorized:**
- Неправильный токен бота

**Ошибка 400 Bad Request:**
- Неправильный Chat ID
- Неверный формат сообщения

## Дополнительно

Для более продвинутой настройки можно:
- Добавить сохранение заявок в базу данных
- Настроить уведомления на email
- Добавить вебхуки для двусторонней связи
- Интегрировать с CRM системой
