/**
 * Сервер отправки заявок на email
 * Node.js + Express + Nodemailer
 */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const http = require('http');

require('dotenv').config();

const app = express();

// Настройки
const PORT = process.env.PORT || 3000;
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;
const EMAIL_TO = process.env.EMAIL_TO || '';

// Middleware
app.use(cors({
    origin: '*', // В production укажите конкретный домен
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Простая защита от спама (rate limiting)
const requestCounts = new Map();
const RATE_LIMIT = 5; // Максимум 5 запросов
const RATE_LIMIT_WINDOW = 60000; // За 60 секунд

function checkRateLimit(ip) {
    const now = Date.now();
    const userRequests = requestCounts.get(ip) || [];
    const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= RATE_LIMIT) {
        return false;
    }

    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);
    return true;
}

function isEmailConfigured() {
    return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && EMAIL_TO);
}

function createTransporter() {
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
}

app.post('/api/send-email', async (req, res) => {
    try {
        const clientIp = req.ip || req.connection.remoteAddress;
        if (!checkRateLimit(clientIp)) {
            return res.status(429).json({
                success: false,
                error: 'Слишком много запросов. Попробуйте позже.'
            });
        }

        if (!isEmailConfigured()) {
            console.error('SMTP/EMAIL настройки не заданы');
            return res.status(500).json({
                success: false,
                error: 'Сервер не настроен. Обратитесь к администратору.'
            });
        }

        const { name, phone, email, organization, message, submittedAt } = req.body || {};

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                error: 'Имя и телефон обязательны'
            });
        }

        const mailSubject = `Заявка с сайта «Карусель»`;
        const mailText =
            `Имя: ${name}\n` +
            `Телефон: ${phone}\n` +
            `Email: ${email || '—'}\n` +
            `Организация: ${organization || '—'}\n` +
            `Сообщение: ${message || '—'}\n` +
            `Время: ${submittedAt || new Date().toISOString()}\n`;

        const mailHtml = `
            <h2>Заявка с сайта «Карусель»</h2>
            <p><strong>Имя:</strong> ${name}</p>
            <p><strong>Телефон:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email || '—'}</p>
            <p><strong>Организация:</strong> ${organization || '—'}</p>
            <p><strong>Сообщение:</strong> ${message || '—'}</p>
            <p><strong>Время:</strong> ${submittedAt || new Date().toISOString()}</p>
        `;

        const transporter = createTransporter();
        await transporter.sendMail({
            from: EMAIL_FROM,
            to: EMAIL_TO,
            replyTo: email || EMAIL_FROM,
            subject: mailSubject,
            text: mailText,
            html: mailHtml
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Ошибка при отправке email:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Внутренняя ошибка сервера'
        });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        emailConfigured: isEmailConfigured()
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint не найден' });
});

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`\n🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📧 Endpoint: http://localhost:${PORT}/api/send-email`);
    console.log(`💚 Health check: http://localhost:${PORT}/health\n`);

    if (!isEmailConfigured()) {
        console.warn('⚠️  ВНИМАНИЕ: SMTP/EMAIL настройки не заданы!');
        console.warn('   Заполните .env и перезапустите сервер.\n');
    }
});

process.on('SIGTERM', () => {
    console.log('SIGTERM получен, завершение работы...');
    server.close(() => {
        console.log('Сервер остановлен');
        process.exit(0);
    });
});
