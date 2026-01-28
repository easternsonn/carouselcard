# Настройка получения заявок на email

Ниже — рабочая схема отправки заявок через Node.js сервер и SMTP.

## 1) Установите зависимости

```bash
npm install
```

## 2) Создайте файл `.env`

В корне проекта создайте файл `.env` и укажите настройки SMTP:

```
PORT=3000
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=mail@yourdomain.com
SMTP_PASS=your_password
EMAIL_FROM=mail@yourdomain.com
EMAIL_TO=receiver@yourdomain.com
```

Пояснения:
- `SMTP_HOST` — адрес SMTP сервера (вашего хостинга/почты)
- `SMTP_PORT` — обычно `587` (STARTTLS) или `465` (SSL)
- `SMTP_USER` / `SMTP_PASS` — логин и пароль
- `EMAIL_FROM` — от какого адреса отправлять
- `EMAIL_TO` — куда приходят заявки

## 3) Запустите сервер

```bash
npm start
```

Проверка:
- `http://localhost:3000/health` → должен вернуть `emailConfigured: true`

## 4) Укажите URL сервера на фронтенде

В `script.js` замените:

```javascript
const EMAIL_SERVER_URL = 'http://localhost:3000/api/send-email';
```

на ваш домен, например:

```javascript
const EMAIL_SERVER_URL = 'https://yourdomain.com/api/send-email';
```

## 5) Размещение на хостинге

Если используете VPS:
- загрузите проект
- установите Node.js (LTS)
- `npm install`
- создайте `.env`
- запустите через `pm2` или `node server.js`

Если используете shared‑hosting без Node.js — нужен VPS или другой backend.
