const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Budget = new Schema({
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    remarks: {
        type: String,
    }
}, {timestamps: true})

module.exports = mongoose.model('Budget', Budget)