const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const User = require('../model/User');

//REGISTER
router.post('/register', async (req, res)=> {
    const user = req.body
    try {
        const foundUser = await User.findOne({email: user.email})
        if(foundUser) return res.status(403).json('User is already exist.')

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(user.pass, salt)

        const newUser =  new User({
            email: user.email,
            pass: hashedPass
        })

        await newUser.save()
        res.status(200).json('User added.')

    } catch (error) {
        console.log(error)
    }
})


//LOGIN
router.post('/login', async (req, res)=> {
    const user = req.body
    try {
        const foundUser = await User.findOne({email: user.email})
        if(!foundUser) return res.status(404).json('Email does not exist.')

        const isPassValid = await bcrypt.compare(user.pass,foundUser.pass )
        if(!isPassValid) return res.status(401).json('Password is not valid.')

        const {pass, ...others} = foundUser._doc
        const token = jwt.sign(others, process.env.JWT_KEY)

        res
        .cookie("token", token, {
            maxAge: 1000 * 18000,
            httpOnly: true,
            sameSite: "strict",
            domain: "budget-system.netlify.app"
        })
        .cookie("isLogin", true, {
            maxAge: 1000 * 18000,
            sameSite: "strict",
            domain: "budget-system.netlify.app"
        })
        .status(200).json(others)

    } catch (error) {
        console.log(error)
    }
})


// LOGOUT
router.delete("/logout", (req, res) => {
  try {
    res
    .clearCookie('token')
    .clearCookie('isLogin')
    .status(202)
    .json("cookies cleared")
  } catch (error) {
    console.log(error)
  }
});




module.exports = router