const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    username: String,
    userId: String,
    name: String,
    description: String,
    srno: Number,
    timestamp: Date,
    image: String,
    image_id: String,
    size: Number
});

module.exports = new mongoose.model("Image", imageSchema);