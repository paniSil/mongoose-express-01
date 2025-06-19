import User from "../../models/User.mjs";

const findUserByEmail = async (email) => {
    return await User.findOne({ email })
};

const findUserById = async (id) => {
    return await User.findById(id);
};

export { findUserByEmail, findUserById }