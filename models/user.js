const mongoose = require('mongoose');

const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    name: String,
    password: String,
    verified: {
        type: Boolean,
        default: false
    },
    code: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);