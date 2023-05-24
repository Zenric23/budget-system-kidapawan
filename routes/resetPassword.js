const Token = require('../model/Token')
const User = require('../model/User')
const crypto = require("crypto")
const sendMail = require('../utils/sendMail')
const router = require('express').Router()
const bcrypt = require('bcrypt');


// SEND PASSWORD RESET LINK
router.post('/send-link', async (req, res)=> {
    try {
        
        const user = await User.findOne({email: req.body.email})
        if(!user) return res.status(404).json('User not found.')

        let token = await Token.findOne({ userId: user._id })
        if(!token) {
            token =  await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString('hex')
            }).save()
        }

        const url = `${process.env.BASE_URL}/change-password/${user._id}/${token.token}`;
        await sendMail(user.email, 'Password Reset', url)
        res.status(200).json('Password reset link sent to your email.') 

    } catch (error) { 
        res.status(500).json(error)
        console.log(error)    
    }
})

// VERIFY PASSWORD RESET LINK
router.get('/:id/:token', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(400).json('Invalid Link. Reset link expired.')

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token
        })
        if(!token) return res.status(400).json('Invalid Link. Reset link expired.')

        res.status(200).json('Valid url')

    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }
})

// CHANGE PASSWORD
router.post('/:id/:token', async (req, res)=> {

    const {pass, pass2} = req.body

    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(400).json('Invalid link')

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token
        })
        if(!token) return res.status(400).json('Invalid link')

        if(pass !== pass2) return res.status(403).json("Password doesn't matched")

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(pass, salt);
  
        user.pass = hashedPass 
        await user.save()
        await token.remove()
 
        res.status(200).json('Password reset successfully.')

    } catch (error) {
        console.log(error)
    }
})


module.exports = router