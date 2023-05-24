const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Department = new Schema({
    department: {
        type: String,
        required: true,
        unique: true
    },

}, {timestamps: true})

module.exports = mongoose.model('Department', Department)