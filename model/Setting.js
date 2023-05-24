const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Setting = new Schema({
    alertAmount: {
        type: Number,
    },
    systemName: {
        type: String
    },
    logo: {
        type: String
    },
})

module.exports = mongoose.model('Setting', Setting)