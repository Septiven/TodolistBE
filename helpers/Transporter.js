const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'septivencorp@gmail.com', // Email Sender
        pass: 'udutgfgpvxbuaipc' // Password Windows Computer
    },
    tls: {
        rejectUnauthorized: false
      }
})

module.exports = transporter