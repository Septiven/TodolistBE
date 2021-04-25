const express = require('express')
const Router = express.Router()

// Import Controller
const authenticController = require('./../controllers/AuthenticController') 

// Import Middleware
const example = require('./../middleware/Example')
const jwtVerify = require('./../middleware/JWT')

Router.post('/register', authenticController.register)
Router.get('/send-email', authenticController.sendEmail)
Router.post('/login', authenticController.login)
Router.patch('/confirmation', authenticController.emailConfirmation)
Router.post('/user-verify', jwtVerify, authenticController.checkUserVerify)
Router.post('/example', example, authenticController.example)

module.exports = Router