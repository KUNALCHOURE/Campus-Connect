import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const Userschema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "password is required"],
    },
    profileimage: {
        type: String,
        default: "",
    },
    refreshtoken: {
        type: String,
    },
    likedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'  
    }],
    likedDiscussions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion'
    }],
    preferences: [{
        type: String
    }]
}, { timestamps: true });

Userschema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

Userschema.methods.ispasswordcorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

Userschema.methods.generateAcessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        },
    );
};

Userschema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        },
    );
};

const user = new mongoose.model('user', Userschema);
export { user };