const router = require('express').Router()
const { verifyToken } = require('../middleware/verifyToken');
const Budget = require('../model/Budget')


router.get('/', async (req, res)=> {
    let budgets;
    let count;
    let {dateRange, page, limit, search} = req.query
    page = page - 1 || 0
    limit = limit || 10

    try {

        if(search || dateRange) {

            if(dateRange && search) {
                const date1 = dateRange.split(',')[0] 
                const date2 = dateRange.split(',')[1] 

                budgets = await Budget.find({
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

                const filteredBudgets = budgets.filter(budget=> budget.categoryId)

                count =  await Budget.find({
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

                return res.status(200).json({budgets: filteredBudgets, totalPage, count: filteredCount})

            }

            if(search) {
    
                budgets = await Budget.find() 
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
    
                const filteredBudget = budgets.filter(budget=> budget.categoryId)
                
                count = await Budget.find()
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
    
                return res.status(200).json({budgets: filteredBudget, totalPage: totalPage, count: filteredCount})
            }
    
            if(dateRange) {
                const date1 = dateRange.split(',')[0] 
                const date2 = dateRange.split(',')[1] 
    
                budgets = await Budget.find({
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
    
                count = await Budget.find({
                    createdAt: {
                        $gte: new Date(date1), 
                        $lte: new Date(date2),
                    }
                }).count()
    
                const totalPage = Math.ceil(count / limit)
    
                return res.status(200).json({budgets, totalPage, count})
            }
        }
  

        budgets = await Budget.find()
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
        
        count = await Budget.countDocuments()

        const totalPage = Math.ceil(count / limit)

        res.status(200).json({budgets, totalPage, count})

    } catch (error) { 
        console.log(error)
    }
})


router.post('/', verifyToken, async (req, res)=> {
    try {
        const newBudget = new Budget(req.body)
        await newBudget.save()
        res.status(200).json('budget added.')
    } catch (error) {
        console.log(error) 
    }
})


router.put('/:id', verifyToken,  async (req,res)=> {
    try {
        const updatedBudget = await Budget.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body },  
            { new: true }
        )
        res.status(200).json(updatedBudget)
    } catch (error) {
        console.log(error)
    }  
})
 
  
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Budget.findByIdAndDelete(req.params.id)
        res.status(200).json('Budget deleted.') 
    } catch (error) {
        console.log(error)
    }
})


module.exports = router