const router = require('express').Router()
const Budget = require('../model/Budget');
const Category = require('../model/Category');
const Expense = require('../model/Expense');
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/verifyToken');
const ObjectId = mongoose.Types.ObjectId

router.get('/select-category', verifyToken, async (req, res)=> {
    try {
        const categories = await Category.find().sort({ createdAt: -1 })
        res.status(200).json(categories)
    } catch (error) {
        console.log(error)
    }
})


router.get('/', async (req, res)=> {

    let categories = [];
    let totalPage = 0;
    let totalData  = 0;
  
    let {
        page,
        limit,
        search
    } = req.query 
    
    page = page - 1 || 0
    limit = limit || 10

    try {
        if(search){
            categories = await Category.find({category: new RegExp(search, "i")})
            totalData = await Category.find({category: new RegExp(search, "i")}).count()
            totalPage = Math.ceil(totalData / limit)
            return res.status(200).json({categories, totalData, totalPage})
        }

        categories = await Category.find().skip(page * limit).limit(limit).sort({createdAt: -1})
        totalData = await Category.countDocuments()
        totalPage = Math.ceil(totalData / limit)
        res.status(200).json({categories, totalData, totalPage})
    } catch (error) {
        console.log(error)
    }
})


router.post('/', verifyToken, async (req, res)=> {
    const {category} = req.body
    try {
        const isCatExist = await Category.findOne({category})
        if(isCatExist) return res.status(403).json('category is already exist!')

        const newCategory = new Category(req.body)
        await newCategory.save()
        res.status(200).json('Category added.')
    } catch (error) {
        console.log(error)
    }
})


router.put('/:id', verifyToken, async (req,res)=> {
    try {
        await Category.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body },
            { new: true }
        )
        res.status(200).json('Category edited')
    } catch (error) {
        console.log(error)
    }
})


router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params
                
    try {
        await Budget.deleteMany({categoryId: ObjectId(id)})
        await Expense.deleteMany({categoryId: ObjectId(id)})
        await Category.findByIdAndDelete(req.params.id)
        res.status(200).json('Category deleted.')
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})
 

module.exports = router