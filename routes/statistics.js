const Budget = require("../model/Budget");
const Category = require("../model/Category");
const Expense = require("../model/Expense");
const router = require("express").Router();
const mongoose = require('mongoose');
const { verifyToken } = require("../middleware/verifyToken");
const Department = require("../model/Department");
const ObjectId = mongoose.Types.ObjectId


//budget-categories
router.get('/budget-categories', async (req, res)=> {
  const catId = req.query.catId;
  let result;

  try {
    if(catId){
      result = await Category.aggregate([
        {
          '$match': {
            '_id': ObjectId(catId)
          }
        }, {
          '$lookup': {
            'from': 'budgets', 
            'localField': '_id', 
            'foreignField': 'categoryId', 
            'as': 'result'
          }
        }, {
          '$unwind': {
            'path': '$result', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$group': {
            '_id': '$_id', 
            'categoryName': {
              '$first': '$category'
            }, 
            'totalBudgets': {
              '$sum': '$result.amount'
            }
          }
        }, {
          '$lookup': {
            'from': 'expenses', 
            'localField': '_id', 
            'foreignField': 'categoryId', 
            'as': 'result'
          }
        }, {
          '$unwind': {
            'path': '$result', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$group': {
            '_id': '$_id', 
            'categoryName': {
              '$first': '$categoryName'
            }, 
            'totalExpenses': {
              '$sum': '$result.amount'
            }, 
            'totalBudgets': {
              '$first': '$totalBudgets'
            }
          }
        }, {
          '$addFields': {
            'balance': {
              '$subtract': [
                '$totalBudgets', '$totalExpenses'
              ]
            }
          }
        }
      ])
    } else {
        result = await Category.aggregate([
          {
              '$lookup': {
                  'from': 'budgets', 
                  'localField': '_id', 
                  'foreignField': 'categoryId', 
                  'as': 'budgetResult'
              }
          }, {
              '$unwind': {
                  'path': '$budgetResult', 
                  'preserveNullAndEmptyArrays': true
              }
          }, {
              '$group': {
                  '_id': '$_id', 
                  'categoryName': {
                      '$first': '$category'
                  }, 
                  'totalBudgets': {
                      '$sum': '$budgetResult.amount'
                  }
              }
          }, {
              '$lookup': {
                  'from': 'expenses', 
                  'localField': '_id', 
                  'foreignField': 'categoryId', 
                  'as': 'expenseResult'
              }
          }, {
              '$unwind': {
                  'path': '$expenseResult', 
                  'preserveNullAndEmptyArrays': true
              }
          }, {
              '$group': {
                  '_id': '$_id', 
                  'categoryName': {
                      '$first': '$categoryName'
                  }, 
                  'totalExpenses': {
                      '$sum': '$expenseResult.amount'
                  }, 
                  'totalBudgets': {
                      '$first': '$totalBudgets'
                  }
              }
          }, {
              '$addFields': {
                  'balance': {
                      '$subtract': [
                          '$totalBudgets', '$totalExpenses'
                      ]
                  }
              }
          }, {
              '$sort': {
                  'totalBudgets': -1
              }
          }
      ]) 
    }

    res.status(200).json(result)
  } catch (error) {
    console.log(error)
  }
})

// top widgets
router.get("/top-widget", verifyToken, async (req, res) => {
  try {

    const totalBudget = await Budget.aggregate([
      {
        $project: {
          amount: 1,  
        }, 
      },
      {
        $group: {
          _id: null,
          totalBudget: {
            $sum: "$amount",
          },
        },
      },
    ]) || 0;

    const totalExpense = await Expense.aggregate([
      {
        $project: {
          amount: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalExpense: {
            $sum: "$amount",
          },
        },
      },
    ]) || 0;


    const finalBudget = totalBudget.length === 0 ? 0 : totalBudget[0].totalBudget
    const finalExpense = totalExpense.length === 0 ? 0 : totalExpense[0].totalExpense

    const balance = finalBudget - finalExpense;

    res.status(200).json({ totalBudget: finalBudget, totalExpense: finalExpense, balance });
  } catch (error) {
    console.log(error);
  }
});


// chart stat
router.get("/chart", verifyToken,  async (req, res) => {
  const date = new Date();
  let expense;
  let budget;

  try {
    if (req.query.type === "weekly") {
      const prevDay = new Date(date.setDate(date.getDate() - 7));

      budget = await Budget.aggregate([
        {
          $match: {
            createdAt: {
              $gte: prevDay,
            },
          },
        },
        {
          $project: {
            amount: 1,
            dayOfWeek: { $dayOfWeek: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$dayOfWeek",
            totalBudget: {
              $sum: "$amount",
            },
          },
        },
      ]);

      expense = await Expense.aggregate([
        {
          $match: {
            createdAt: {
              $gte: prevDay,
            },
          },
        },
        {
          $project: {
            amount: 1,
            dayOfWeek: { $dayOfWeek: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$dayOfWeek",
            totalExpense: {
              $sum: "$amount",
            },
          },
        },
      ]);

      return res.status(200).json({ budget, expense });
    }

      
    const prevMonth = new Date(date.setMonth(date.getMonth() - 1));

    budget = await Budget.aggregate([
      {
        $match: {
          createdAt: {
            $gte: prevMonth,
          },
        },
      },
      {
        $project: {
          amount: 1,
          month: {
            $month: "$createdAt",
          },
        },
      },
      {
        $group: {
          _id: "$month",
          totalBudget: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    expense = await Expense.aggregate([
      {
        $match: {
          createdAt: {
            $gte: prevMonth,
          },
        },
      },
      {
        $project: {
          amount: 1,
          month: {
            $month: "$createdAt",
          },
        },
      },
      {
        $group: {
          _id: "$month",
          totalExpense: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.status(200).json({ budget, expense });
  } catch (error) {
    console.log(error);
  }
});


router.get("/today-expense", verifyToken,  async (req, res) => {
    const date = new Date();
    const prevDay = new Date(date.setDate(date.getDate() - 1));
  
    try {
      const data = await Expense.aggregate([
        {
          $match: {
            createdAt: {
              $gt: prevDay,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalExpense: {
              $sum: "$amount",
            },
          },
        },
      ]);
  
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
    }
  });
  

router.get("/today-budget", verifyToken, async (req, res) => {

const date = new Date();
const prevDay = new Date(date.setDate(date.getDate() - 1));

try {
    const data = await Budget.aggregate([
    {
        $match: {
        createdAt: {
            $gt: prevDay,
        },
        },
    },
    {
        $group: {
        _id: null,
        totalExpense: {
            $sum: "$amount",
        },
        },
    },
    ]);

    res.status(200).json(data);
} catch (error) {
    console.log(error);
}
});

module.exports = router;
