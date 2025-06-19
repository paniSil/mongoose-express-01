import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { findUserByEmail } from '../users/userHelpers.mjs';
import User from '../../models/User.mjs';

const getForgotPasswordPage = (req, res) => {
    const theme = req.cookies.theme || 'light';
    res.render('auth/forgot.pug', { theme });
}

const postForgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        const theme = req.cookies.theme || 'light';
        return res.render('auth/forgot', { message: 'Будь ласка, введіть Email.', theme });
    }

    try {
        const user = await findUserByEmail(email);
        const theme = req.cookies.theme || 'light';

        if (!user) {
            console.log(`Спроба скидання пароля для неіснуючого email: ${email}`);
            return res.render('auth/forgot', { message: 'Якщо цей email зареєстрований, ви отримаєте лист з інструкціями.', theme });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000;

        await user.save();

        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        const resetLink = `http://localhost:3000/auth/reset/${token}`;

        const info = await transporter.sendMail({
            to: user.email,
            subject: 'Скидання пароля для вашого акаунта',
            html: `<p>Ви запросили скидання пароля. Будь ласка, перейдіть за цим посиланням, щоб скинути пароль:</p>
                   <a href="${resetLink}">${resetLink}</a>
                   <p>Посилання дійсне протягом 1 години.</p>`
        });

        console.log('Попередній перегляд Ethereal Email: ' + nodemailer.getTestMessageUrl(info));
        res.render('auth/forgot', { message: 'Перевірте ваш Email для отримання посилання на скидання пароля.', theme });

    } catch (error) {
        console.error('Помилка при обробці запиту на скидання пароля:', error);
        const theme = req.cookies.theme || 'light';
        res.status(500).render('auth/forgot', { message: 'Виникла помилка при обробці вашого запиту.', theme });
    }
}

const getResetPasswordPage = async (req, res) => {
    const { token } = req.params;
    const theme = req.cookies.theme || 'light';

    const resetUser = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!resetUser) {
        return res.render('auth/reset', { message: 'Посилання для скидання пароля недійсне або термін його дії закінчився.', theme, token: null });
    }

    res.render('auth/reset', { token: token, theme, message: null })
}

const postResetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const theme = req.cookies.theme || 'light';
    const user = await User.findOne({ // Використовуємо Mongoose Model напряму
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return res.render('auth/reset', { message: 'Посилання для скидання пароля недійсне або термін його дії закінчився.', theme, token: null });
    }

    if (!password || password.length < 6) {
        return res.render('auth/reset', { message: 'Пароль повинен бути не менше 6 символів.', theme, token });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    try {
        await user.save();
    } catch (error) {
        console.error('Error saving new password:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).render('auth/reset', {
                message: 'Помилка валідації пароля: ' + messages.join(', '), theme, token
            });
        }
        return res.status(500).render('auth/reset', { message: 'Виникла помилка при встановленні нового пароля.', theme, token });
    }

    res.redirect('/auth/login');
}

export { getForgotPasswordPage, postForgotPassword, getResetPasswordPage, postResetPassword }