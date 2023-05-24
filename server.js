const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')

dotenv.config()

const authRoutes = require('./routes/auth')
const budgetRoutes = require('./routes/budget')
const expenseRoutes = require('./routes/expense')
const categoryRoutes = require('./routes/category')
const departmentRoutes = require('./routes/department')
const expenseReportRoutes = require('./routes/expenseReport')
const budgetReportRoutes = require('./routes/budgetReport')
const mergeReportRoutes = require('./routes/mergeReport')
const tokenRoutes = require('./routes/token')
const statRoutes = require('./routes/statistics')
const settingRoutes = require('./routes/setting')
const resetPasswordRoutes = require('./routes/resetPassword')
  
 
mongoose.set('strictQuery', true)
mongoose.connect(process.env.MONGO_URL, {  
    useNewUrlParser: true,    
    useUnifiedTopology: true, 
}) 
.then(()=> console.log('connected to database'))
.catch((err)=> console.log(err))

app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}))
app.use(express.urlencoded({ extended: true })); 
app.use(express.json())
app.use(cookieParser())
app.use('/images', express.static(path.join(__dirname, 'images')))
  

app.use('/budget', budgetRoutes)
app.use('/expense', expenseRoutes)
app.use('/category', categoryRoutes)
app.use('/department', departmentRoutes) 
app.use('/expense-report', expenseReportRoutes)
app.use('/budget-report', budgetReportRoutes)
app.use('/report', mergeReportRoutes)
app.use('/token', tokenRoutes) 
app.use('/stat', statRoutes) 
app.use('/setting', settingRoutes) 
app.use('/reset-password', resetPasswordRoutes) 
app.use('/auth', authRoutes) 


app.listen(process.env.PORT || 5000, ()=> { 
    console.log(`serve is running to port ${process.env.PORT}`)
})