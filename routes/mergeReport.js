const router = require('express').Router()
const Department = require('../model/Department')

router.get('/', async (req, res)=> {
    try {
        const report = await Department.aggregate([
          {
            $lookup: {
              from: "budgets",
              localField: "_id",
              foreignField: "departmentId",
              pipeline: [
                {
                  $lookup: {
                    from: "expenses",
                    localField: "categoryId",
                    foreignField: "categoryId",
                    pipeline: [
                      {
                        $project: {
                          categoryId: 1,
                          amount: 1,
                        },
                      },
                      {
                        $group: {
                          _id: "$categoryId",
                          expense: {
                            $sum: "$amount",
                          },
                        },
                      },
                    ],
                    as: "expenseRes",
                  },
                },
                {
                  $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categories",
                  },
                },
                {
                  $unwind: {
                    path: "$categories",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $group: {
                    _id: "$categories.category",
                    budget: {
                      $sum: "$amount",
                    },
                    expenseList: {
                      $first: "$expenseRes",
                    },
                  },
                },
                {
                  $unwind: {
                    path: "$expenseList",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $group: {
                    _id: "$_id",
                    budget: {
                      $first: "$budget",
                    },
                    expense: {
                      $first: "$expenseList.expense",
                    },
                  },
                },
                {
                  $addFields: {
                    balance: {
                      $subtract: ["$budget", "$expense"],
                    },
                  },
                },
                {
                  $sort: {
                    _id: 1
                  }
                }
              ],
              as: "categories",
            },
          },
          {
            $addFields: {
              cat2: "$categories",
            },
          },
        
          {
            $unwind: {
              path: "$cat2",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: "$department",
              categories: {
                $first: "$categories",
              },
              totalBudget: {
                $sum: "$cat2.budget",
              },
              totalExpense: {
                $sum: "$cat2.expense",
              },
              totalBalance: {
                $sum: "$cat2.balance",
              },
            },
          },
          {
            $sort: {
              _id: 1
            }
          }
        ])
          
        res.status(200).json(report)
    } catch (error) {
        console.log(error)
    }
})



module.exports  = router