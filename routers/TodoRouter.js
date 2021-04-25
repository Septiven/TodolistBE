const express = require('express')
const Router = express.Router()

// Import Controller
const todoController = require('./../controllers/TodoController')

// Import Middleware
const jwtVerify = require('./../middleware/JWT')

Router.post('/create', jwtVerify, todoController.create)
Router.post('/get', jwtVerify, todoController.get)
Router.post('/delete', jwtVerify,todoController.deleteData)

module.exports = Router