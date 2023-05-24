const router = require('express').Router()
const Token = require('../model/Token')


router.get('/', async (req, res)=> {
    try {
        const Tokens = await Token.find()
        res.status(200).json(Tokens)
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id', async (req, res)=> {
    try {
        const user = await Token.findOne({userId: req.params.id})
        if(!user) return res.status(404).json('user not found.')
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
    }
})

router.post('/', async (req, res)=> {
    try {
        const newToken = new Token(req.body)
        await newToken.save()
        res.status(200).json('Token added.') 
    } catch (error) {
        console.log(error) 
    }
})

router.put('/:id', async (req,res)=> {
    try {
        const updatedToken = await Token.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body },
            { new: true }
        )
        res.status(200).json(updatedToken)
    } catch (error) {
        console.log(error)
    }
})

router.delete(':/id', async (req, res) => {
    try {
        await Token.findByIdAndDelete(req.params.id)
        res.status(200).json('Token deleted.')
    } catch (error) {
        console.log(error)
    }
})


module.exports = router