const Expense = require('../model/Expense')
const router = require('express').Router()
const mongoose = require('mongoose')
const { verifyToken } = require('../middleware/verifyToken')
const ObjectId = mongoose.Types.ObjectId

router.get('/', verifyToken, async (req, res)=> {
    let expenses
    let total 

    const { 
        cat,
        dateRange
    } = req.query

    try {

        if(cat || dateRange) {

            if(dateRange && cat) {
                const date1 = dateRange.split(',')[0]
                const date2 = dateRange.split(',')[1]

                expenses = await Expense.find(
                    {
                        createdAt: {
                            $gte: new Date(date1), 
                            $lte: new Date(date2)
                        },
                        categoryId: ObjectId(cat)
                    }
                ).populate({
                    path: "categoryId",
                    select: {
                        category: 1
                    }
                }).populate({
                    path: 'departmentId',
                    select: {
                        department: 1
                    }
                })
                

                total = await Expense.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(date1),
                                $lte: new Date(date2)
                            },
                            categoryId: ObjectId(cat)
                        }
                    },
                    { 
                        $project: {
                            amount: 1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalExpense: { $sum: "$amount" }
                        }
                    }
                ])

                return res.status(200).json({ expenses, total })

            }

            if(dateRange) {
                const date1 = dateRange.split(',')[0]
                const date2 = dateRange.split(',')[1]

                expenses = await Expense
                    .find({
                            createdAt: {
                                $gte: new Date(date1),
                                $lte: new Date(date2)
                            }
                        })
                    .populate({
                        path: 'categoryId',
                        select: {
                            category: 1
                        }
                    }).populate({
                        path: 'departmentId',
                        select: {
                            department: 1
                        }
                    })

                total  = await Expense.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(date1),
                                $lte: new Date(date2)
                            }
                        }
                    },
                    {
                        $project: {
                            amount: 1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalExpense: { $sum: "$amount" }
                        }  
                    } 
                ])

                return res.status(200).json({expenses, total})
            }

            if(cat) {
                expenses = await Expense
                    .find({categoryId: ObjectId(cat)})
                    .populate({
                        path: 'categoryId',
                        select: {
                            category: 1
                        }
                    }).populate({
                        path: 'departmentId',
                        select: {
                            department: 1
                        }
                    })
                    
                
                total = await Expense.aggregate([
                    {
                        $match: {
                            categoryId: ObjectId(cat)
                        }
                    },
                    {
                        $project: {
                            amount: 1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalExpense: { $sum: "$amount" }  
                        }
                    }
                ])
    
                return res.status(200).json({expenses, total})
            }
        }

        expenses = await Expense.find()
            .populate({
                path: 'categoryId',
                select: {
                    category: 1,  
                },
            }).populate({
                path: 'departmentId',
                select: {
                    department: 1
                }
            })


        total = await Expense.aggregate([
            {
                $project: {
                    amount: 1
                },
            },
            {
                $group: {
                    _id: null,
                    totalExpense: { $sum: "$amount" } 
                }
            }
        ])

        res.status(200).json({expenses, total})
    } catch (error) {
        console.log(error)
    }   
})

module.exports = router

