const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    username: String,
    userId: String,
    images: [{
        name: String,
        description: String,
        timestamp: Date,
        image: {
            data: Buffer,
            contentType: String
        }
    }]
});

module.exports = new mongoose.model("Image", imageSchema);