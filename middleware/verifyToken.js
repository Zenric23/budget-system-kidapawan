
const jwt = require('jsonwebtoken')


const verifyToken = (req, res, next) => {
    const token = req.cookies['token']
    if(!token) return res.status(401).json('You are not authenticated.')

    jwt.verify(token, process.env.JWT_KEY, (err, user)=> {
        if(err) return res.status(403).json('Token is invalid.')
        req.user = user
        next()
    })
}

const verifyTokenAndAuth = (req, res, next) => {
    verifyToken(req, res, ()=> {
        if(req.user._id === req.params.id) {
            next()
        } else 
        res.status(401).json('You are not allowed to do that.')
    })
}

module.exports = { verifyToken, verifyTokenAndAuth }