const router = require('express').Router()
const { verifyToken } = require('../middleware/verifyToken')
const Setting = require('../model/Setting')
const deleteFile = require('../utils/deleteFile')
const upload = require('../utils/uploadFile')


router.get('/', verifyToken, async (req, res)=> {
    try {
        const settings = await Setting.findById('640e78c578c18e6a2f931780')
        res.status(200).json(settings)
    } catch (error) {
        console.log(error)
    }
})


router.put('/',  upload.single('image'), async (req, res)=> {
    const { systemName, alertAmount } = req.body
    
    try {  

        if(req.file) {
            const filename = req.file.filename
            const url = req.protocol + "://" + req.get("host");
            const img = url + "/images/" + filename;

            const directoryPath = "../server/images/"
            const prevFileName = req.body.prevFileName
            await deleteFile(directoryPath + prevFileName)

            await Setting.findByIdAndUpdate('640e78c578c18e6a2f931780',{
              $set: {
                logo: img,
                systemName,
                alertAmount
              }
            })

            return res.status(200).json('Setting updated.') 
        } 

        await Setting.findByIdAndUpdate('640e78c578c18e6a2f931780', {
            $set: req.body
        })

        return res.status(200).json('Setting updated.') 
       
    } catch (error) {
        console.log(error) 
    }
})


router.delete('/:filename', verifyToken, async (req, res) => {
    const directoryPath = "../server/images/"
    const filename = req.params.filename

    try {
        await deleteFile(directoryPath + filename)
        await Setting.findByIdAndDelete(req.params.id)
        res.status(200).json('Setting deleted.')
    } catch (error) {
        console.log(error)
    }
})


module.exports = router