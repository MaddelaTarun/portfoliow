const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
const path = require('path')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname)))

// --- EMAIL ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

app.post('/send-message', (req, res) => {
    const { name, email, message } = req.body
    if (!name || !message) {
        return res.status(400).json({ status: 'missing fields' })
    }
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `[Portfolio] New message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error: ", error)
            return res.status(500).json({ status: 'fail' })
        }
        console.log('Email sent: ' + info.response)
        res.status(200).json({ status: 'success' })
    })
})
module.exports = app