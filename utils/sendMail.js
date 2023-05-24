
const nodemailer = require('nodemailer')


module.exports = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "kingcanis14@gmail.com",
                pass: process.env.GOOGLE_EMAIL_PASS
            }
        })

        await transporter.sendMail({
            from: 'vaxcertkidapawan@gmail.com',
            to: email,
            subject,
            text
        })

        console.log('email sent successfully')

    } catch (error) {
        console.log(error)
    }
}
