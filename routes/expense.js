const router = require('express').Router()
const { verifyToken } = require('../middleware/verifyToken');
const Expense = require('../model/Expense')


router.get('/', verifyToken, async (req, res)=> {
    let expenses;
    let count;
    let {dateRange, page, limit, search} = req.query
    page = page - 1 || 0
    limit = limit || 10

    try {

        if(search || dateRange) {

            if(dateRange && search) {
                const date1 = dateRange.split(',')[0] 
                const date2 = dateRange.split(',')[1] 

                expenses = await Expense.find({
                    createdAt: {
                        $gte: new Date(date1),
                        $lte: new Date(date2)
                    }
                })
                .populate({
                    path: 'departmentId',
                    select: {
                        department: 1
                    }
                })
                .populate({  
                    path: 'categoryId',
                    select: {
                        category: 1, 
                    },
                    match: { 
                        category: new RegExp(search, "i")
                    },
                })
                .skip(page * limit)
                .limit(limit)
                .sort({createdAt: -1})

                const filteredExpenses = expenses.filter(expense=> expense.categoryId)

                count =  await Expense.find({
                    createdAt: {
                        $gte: new Date(date1),
                        $lte: new Date(date2)
                    }
                    })
                    .populate({  
                        path: 'categoryId',
                        select: {
                            category: 1, 
                        },
                        match: { 
                            category: new RegExp(search, "i")
                        },
                    })

                const filteredCount = count.filter(item=> item.categoryId).length

                const totalPage = Math.ceil(filteredCount / limit)

                return res.status(200).json({expenses: filteredExpenses, totalPage, count: filteredCount})

            }

            if(search) {
    
                expenses = await Expense.find()
                .populate({
                    path: 'departmentId',
                    select: {
                        department: 1
                    }
                }) 
                .populate({  
                    path: 'categoryId',
                    select: {
                        category: 1,  
                    },
                    match: {  
                        category: new RegExp(search, "i")
                    },
                })
                .skip(page * limit) 
                .limit(limit)
                .sort({createdAt: -1})
    
                const filteredExpense = expenses.filter(expense=> expense.categoryId)
                
                count = await Expense.find()
                .populate({  
                    path: 'categoryId',
                    select: {  
                        category: 1,  
                    },
                    match: {
                        category: new RegExp(search, "i")
                    }
                })
    
                const filteredCount = count.filter(item=> item.categoryId).length
    
                const totalPage = Math.ceil(filteredCount / limit)
    
                return res.status(200).json({expenses: filteredExpense, totalPage: totalPage, count: filteredCount})
            }
    
            if(dateRange) {
                const date1 = dateRange.split(',')[0] 
                const date2 = dateRange.split(',')[1] 
    
                expenses = await Expense.find({
                    createdAt: { 
                        $gte: new Date(date1),
                        $lte: new Date(date2),
                    }   
                })
                .skip(page * limit)
                .limit(limit)
                .sort({createdAt: -1})
                .populate({
                    path: 'departmentId',
                    select: {
                        department: 1
                    }
                })
                .populate({
                    path: 'categoryId', 
                    select: {
                        category: 1
                    }
                })
    
                count = await Expense.find({
                    createdAt: {
                        $gte: new Date(date1), 
                        $lte: new Date(date2),
                    }
                }).count()
    
                const totalPage = Math.ceil(count / limit)
    
                return res.status(200).json({expenses, totalPage, count})
            }
        }
  

        expenses = await Expense.find()
            .skip(page * limit)
            .limit(limit)
            .sort({createdAt: -1})
            .populate({
                path: 'departmentId',
                select: {
                    department: 1
                }
            })
            .populate({   
                path: 'categoryId',
                select: {
                    category: 1, 
                },
            })
        
        count = await Expense.countDocuments()

        const totalPage = Math.ceil(count / limit)

        res.status(200).json({expenses, totalPage, count})

    } catch (error) { 
        console.log(error)
    }
})


router.post('/', verifyToken, async (req, res)=> {
    try {
        const newExpense = new Expense(req.body)
        await newExpense.save()
        res.status(200).json('expense added.')
    } catch (error) {
        console.log(error)
    }
})


router.put('/:id', verifyToken, async (req,res)=> {
    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body },
            { new: true }
        )
        res.status(200).json(updatedExpense)
    } catch (error) {
        console.log(error)
    }  
})
 
  
router.delete('/:id', verifyToken,  async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id)
        res.status(200).json('Expense deleted.') 
    } catch (error) {
        console.log(error)
    }
})


module.exports = router