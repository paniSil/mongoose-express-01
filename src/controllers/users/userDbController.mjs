import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import User from '../../models/User.mjs';

const createUserInDb = async (name, email, password, age) => {
    const saltRounds = 10;

    const newUser = new User({
        name,
        email,
        password,
        age: parseInt(age, 10),
        role: 'admin',
        resetToken: null,
        resetTokenExpiry: null,
    });

    const result = await newUser.save()
    return result
};

const updateUserInDb = async (user, update) => {
    Object.assign(user, update);
    return await user.save();
};

export { createUserInDb, updateUserInDb }