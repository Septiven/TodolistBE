const jwt = require('jsonwebtoken')

jwt.sign({id: 1, email: 'Lukas@yahoo.com', password: '31a5edc3080cba342d0dee2961aa3138e4547863a0103e1ab669c23346f777ee', is_email_confirmed: 1}, '123abc', (err, token) => {
    try {
        if(err) throw err

        console.log(token)
    } catch (error) {
        console.log(error)
    }
})

let tokenResult = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJMdWthc0B5YWhvby5jb20iLCJwYXNzd29yZCI6IjMxYTVlZGMzMDgwY2JhMzQyZDBkZWUyOTYxYWEzMTM4ZTQ1NDc4NjNhMDEwM2UxYWI2NjljMjMzNDZmNzc3ZWUiLCJpc19lbWFpbF9jb25maXJtZWQiOjEsImlhdCI6MTYxODM3NTU5OH0.lCCbVpVxoyrR7USJ4BO3fY0SZVxZEfZ3GiHEiIx4s0M'

jwt.verify(tokenResult, '123abc', (err, dataToken) => {
    try {
        if(err) throw err

        console.log(dataToken)
    } catch (error) {
        console.log(error)
    }
})