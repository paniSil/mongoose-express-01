import { findUserByEmail } from '../users/userHelpers.mjs';
import { createUserInDb } from '../users/userDbController.mjs';

const getLoginPage = (req, res) => {
    const errorMessage = req.flash('error');
    const theme = req.cookies.theme || 'light';
    res.render('auth/login', {
        title: 'Вхід',
        theme: theme,
        errorMessage: errorMessage.length ? errorMessage[0] : null
    })
};

const getRegisterPage = (req, res) => {
    const theme = req.cookies.theme || 'light';
    res.render('auth/register.pug', { title: 'Реєстрація', theme: theme });
};

const postRegisterPage = async (req, res) => {
    try {
        const { name, email, password, age } = req.body;
        if (!name || !email || !password) {
            return res.status(400).send('Поля позначені * обов\'язкові для реєстрації.');
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).send('Користувач з таким email вже зареєстрований.');
        }

        const newUser = await createUserInDb(name, email, password, age)

        req.login(newUser, (err) => {
            if (err) {
                console.error('Registration error:', err);
                return res.status(500).send('Помилка при логіні після реєстрації.');
            }
            res.redirect('/');
        });
    } catch (error) {
        res.status(500).send('Помилка при реєстрації.');
    }
}


export { getLoginPage, getRegisterPage, postRegisterPage }