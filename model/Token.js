const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Token = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true 
    },
    token: { 
        type: String,
        required: true,  
        unique: true
    },
    expireAt: {
        type: Date,
        default: Date.now,
        expires: 600
    }
})

module.exports = mongoose.model('Token', Token)