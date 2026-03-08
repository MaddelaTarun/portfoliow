const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const nodemailer = require('nodemailer')
require('dotenv').config()

const app = express()
const PORT = 3000 || process.env.PORT

app.use(cors())
app.use(bodyParser.json())

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/send-message',(req,res)=> {
    const {name, email, message} = req.body;

    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `[Portfolio Alert] New message from ${name}`,
        text: `You have a new message:\n\nName: ${name}\nEmail: ${email}\n\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions,(error,info) => {
        if(error) {
            console.log("Error: ", error);
            return res.status(500).json({status: 'fail'});
        }
        console.log('Email sent: '+info.response);
        res.status(200).json({status: 'success'});
    });
});

app.listen(PORT,() => {
    console.log(`Server running at http://localhost:${PORT}`);
});