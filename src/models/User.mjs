import mongoose from 'mongoose'
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Name is required"], minlength: [3, "Must be minimum 3 characters long"], maxlength: [30, "Can not be longer than 30 characters"] },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Must be minimum 6 characters long"],
        maxlength: [100, "Can not be longer than 100 characters"]
    },
    age: {
        type: Number,
        default: null,
        min: 1,
        max: [110, "Can not be more than 110"]
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    resetToken: String,
    resetTokenExpiry: Date,
}, {
    timestamps: true
})

UserSchema.pre('save', async function (next) {

    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema)

export default User