const router = require('express').Router()
const Budget = require('../model/Budget');
const Department = require('../model/Department');
const Expense = require('../model/Expense');
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/verifyToken');
const ObjectId = mongoose.Types.ObjectId

router.get('/select-department', verifyToken, async (req, res)=> {
    try {
        const departments = await Department.find().sort({ createdAt: -1 })
        res.status(200).json(departments)
    } catch (error) {
        console.log(error)
    }
})


router.get('/', async (req, res)=> {

    let departments = [];
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
            departments = await Department.find({department: new RegExp(search, "i")})
            totalData = await Department.find({department: new RegExp(search, "i")}).count()
            totalPage = Math.ceil(totalData / limit)
            return res.status(200).json({departments, totalData, totalPage})
        }

        departments = await Department.find().skip(page * limit).limit(limit).sort({createdAt: -1})
        totalData = await Department.countDocuments()
        totalPage = Math.ceil(totalData / limit)
        res.status(200).json({departments, totalData, totalPage})
    } catch (error) {
        console.log(error)
    }
})


router.post('/', verifyToken, async (req, res)=> {
    const {department} = req.body
    try {
        const isCatExist = await Department.findOne({department})
        if(isCatExist) return res.status(403).json('department is already exist!')

        const newDepartment = new Department(req.body)
        await newDepartment.save()
        res.status(200).json('Department added.')
    } catch (error) {
        console.log(error)
    }
})


router.put('/:id', verifyToken, async (req,res)=> {
    try {
        await Department.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body },
            { new: true }
        )
        res.status(200).json('Department edited')
    } catch (error) {
        console.log(error)
    }
})


router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params
                
    try {
        await Budget.deleteMany({departmentId: ObjectId(id)})
        await Expense.deleteMany({departmentId: ObjectId(id)})
        await Department.findByIdAndDelete(req.params.id)
        res.status(200).json('Department deleted.')
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})
 

module.exports = router