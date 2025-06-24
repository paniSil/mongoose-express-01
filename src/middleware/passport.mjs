import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { findUserByEmail, findUserById } from '../controllers/users/userHelpers.mjs';
import bcrypt from 'bcrypt';

export const initPassport = () => {

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await findUserById(id)
            done(null, user);
        } catch (err) {
            console.error("Deserialize user error", err);
            done(err);
        }
    });


    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await findUserByEmail(email);
            if (!user) {
                console.log('User not found:', email);
                return done(null, false, { message: 'Wrong email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log('Password mismatch for:', email);
                return done(null, false, { message: 'Wrong email or password' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));
};