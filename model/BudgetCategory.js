const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BudgetCategory = new Schema({
    category: {
        type: String,
        required: true,
        unique: true
    },
    budget: {
        type: Number,
        required: true
    },
    lastExpense: {
        type: Number,
        required: true
    },
     lastExpense: {
        type: Date,
        required: true
    },
})

module.exports = mongoose.model('BudgetCategory', BudgetCategory)