const validator = require('validator')
const fs = require('fs')
const handlebars = require('handlebars')
const jwt = require('jsonwebtoken') 

// Import Helpers
const hashPassword = require('./../helpers/Hash')
const activationCode = require('./../helpers/ActivationCode')

// Import Connection
const db = require('./../connection/Connection')

// Import Transporter
const transporter = require('../helpers/Transporter')

//### register
const register = (req, res) => {
    try {
        // Step1. Get all data dari FE
        const data = req.body
        console.log(data)

        // Step2. Validasi data
        if(!data.email || !data.password) throw { message: 'Data Must Be Filled' }

        if(!(validator.isEmail(data.email))) throw { message: 'Email Invalid' }

        if(data.password.length < 6) throw { message: 'Password Have Minimum Length 6 Character' }

        // Step3. Hash data password
        try {
            const passwordHashed = hashPassword(data.password) 
            data.password = passwordHashed
            data.activation_code = activationCode()
            // let newDataToSend = {
            //     email: data.email,
            //     password: passwordHashed
            // }

            // Step4. Store data ke DB
            // let query = 'SELECT * FROM users WHERE email = ?'
            // db.query(query, data.email, (err, result) => {
            //     try {
            //         if(err) throw err

            //         if(result.length === 0){
               
                        db.query('INSERT INTO users SET ?', data, (err, result) => {
                            try {
                                if(err) throw err
                                
                                // Step5. Send Email Confirmation
                                fs.readFile('C:/Users/ACER/Desktop/Backend/Authentic_System/template/EmailConfirmation.html', {encoding: 'utf-8'}, (err, file) => {
                                    if(err) throw err

                                    const template = handlebars.compile(file)
                                    const templateResult = template({email: data.email, link: `http://localhost:3000/confirmation/${result.insertId}/${passwordHashed}`,code: data.activation_code})

                                    transporter.sendMail({
                                        from: 'septivencorp@gmail.com', // Sender Address
                                        to: 'septivenlukas@gmail.com', // Email User
                                        subject: 'Email Confirmation Test',
                                        html: templateResult
                                    })
                                
                                    .then((response) => {
                                        res.status(200).send({
                                            error: false,
                                            message: 'Register Success. Check Email To Activation Account!'
                                        })
                                    })
                                    .catch((error) => {
                                        res.status(500).send({
                                            error: true,
                                            message: 'register failed'
                                        })
                                    })
                                })

                            } catch (error) {
                                res.status(500).send({
                                    error: true,
                                    message: error.message
                                })
                            }
                        })
            //         }else{
            //             res.status(200).send({
            //                 error: true,
            //                 message: 'Email Already Exist'
            //             })
            //         }
            //     } catch (error) {
            //         res.status(500).send({
            //             error: true,
            //             message: error.message
            //         })
            //     }
            // })
        } catch (error) {
            res.status(500).send({
                error: true,
                message: 'Failed to Hash Password'
            })
        }
    } catch (error) {
        res.status(406).send({
            error: true, 
            message: error.message
        })
    }
}


const sendEmail = (req, res) => {
    transporter.sendMail({
        from: 'septivencorp@gmail.com', // Sender Address
        to: 'septivenlukas@gmail.com', // Email User
        subject: 'Email Confirmation Test',
        html: '<h1>Hi, Welcome!</h1>'
    })

    .then((response) => {
        console.log(response)
    })
    .catch((error) => {
        console.log(error)
    })
}

// ######### Login
const login = (req, res) => {
    try { 
        // Step1. Get All Data
        const data = req.body
        
        // Step2. Validasi Data 
        if(!data.email || !data.password) throw { message: 'Data Must Be Filled' }
        
        // Step3. Hash Password Untuk Mencocokan Data Dengan yg Ada di DB
        const passwordHashed = hashPassword(data.password)

        // Step4. Cari Email & Password
        db.query('SELECT * FROM users WHERE email = ? AND password = ?', [data.email, passwordHashed], (err, result) => {
            try {
                if(err) throw err

                if(result.length === 1){
                    jwt.sign({id: result[0].id, activation_code: result[0].activation_code}, '123abc', (err, token) =>{
                        try {
                            if(err) throw err

                            res.status(200).send({
                                error: false,
                                message: 'Login Success',
                                data: {
                                    token: token
                                }
                            })
                        } catch (error) {
                            res.status(500).send({
                                error: true,
                                message: 'Token Error'
                            })
                        }
                    })
                }else{
                    res.status(200).send({
                        error: true,
                        message: 'Acc not found'
                    })
                }
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })
    } catch (error) {
        res.status(406).send({
            error: true,
            message: error.message
        })
    }
}

// ########## Email Confirmation (by link)
const emailConfirmation = (req, res) => {
    
    // Step1. Get All Data
    const data = req.body

    // Step2. Check Apakah Akun Tersebut Sudah Aktif
    db.query(`SELECT * FROM users WHERE id = ? AND password = ?`, [data.dataToSend.id, data.dataToSend.password], (err, result) => {
        try {
            if(err) throw err

            if(result[0].is_email_confirmed === 0){
                // Step3. Apabila Akun Belum Aktif, Update is_email_confirmed
                db.query(`UPDATE users SET is_email_confirmed = 1 WHERE id = ? AND password = ?`, [data.dataToSend.id, data.dataToSend.password], (err, result) => {
                    try {
                        if(err) throw err

                        res.status(200).send({
                            error: false, 
                            message: 'Account Actived!'
                        })
                    } catch (error) {
                        res.status(500).send({
                            error: true,
                            message: error.message
                        })
                    }
                })
            }else{
                res.status(200).send({
                    error: true,
                    message: 'Your Account Already Active'
                })
            }
        } catch (error) {
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    })   
}

// ########## Email Confirmation (by code)
// const emailConfirmationCode = (req,res) => {
//     // step1. get all data
//     const data = req.body
//     // step 2. check apakah akun sudah aktif?
//     db.query(`SELECT * FROM users WHERE id = ? AND password = ?`, [data.dataToSend.id, data.dataToSend.password] ,( err , result ) => {
//         try{
//             if (err) throw err

//             if(result[0].is_email_confirmed === 0){
//                 // step 3. check apakah code inputan telah sesuai dengan code yg ada di db
//                 db.query(`SELECT * FROM users WHERE activation_code = ?`, [data.dataToSendCode.code], (err, result) => {
//                     console.log(dataToSendCode)

//                 })
//             }else{
//                 res.status(200).send({
//                     error: true,
//                     message: 'Your Account Already Active'
//                 })
//             }
//         }
//         catch (error){
//             res.status(500).send({
//                 error: true,
//                 message: error.message
//             })
//         }
//     })
// }

// Forgot Password
const forgotPassword = (req, res) => {
    try {
        const data = req.body
        const inputEmail = data.inputEmail
        console.log (inputEmail)

        data.password = newPassword ()
        let newPass = data.password
        
        let newPassHashed = hashPassword(data.password)
        data.password = newPassHashed
        // console.log (inputEmail)

        let queryCheck = `SELECT * FROM users WHERE email = '${inputEmail}'`
        db.query (queryCheck, (err, result) => {
            console.log ("check1")
            try {
                if (err) throw err

                if (result.length === 1){
                    // Patch password
                    let queryPatch = `UPDATE users SET password = '${data.password}' WHERE email = '${inputEmail}'`
                    db.query (queryPatch, (err, result) => {
                        console.log ("check2")
                        try {
                            if (err) throw err
                            
                            fs.readFile ('C:/Users/ACER/Desktop/Backend/Authentic_System/template/ForgotPass.html', {encoding: "utf-8"}, (err, file) => {
                                if (err) throw err

                                const template = handlebars.compile (file)
                                const templateRes = template ({email: data.inputEmail, newPassword: newPass})

                                transporter.sendMail ({
                                    from: "septivencorp@gmail.com",
                                    to:"septivenlukas@gmail.com",
                                    // to: data.email,
                                    subject: "New Password Request",
                                    html: templateRes
                                })

                                .then ((response) => {
                                    res.status (200).send ({
                                        error: false,
                                        message: "New Password has been sent to your email."
                                    })
                                })

                                .catch ((err) => {
                                    res.status (500).send ({
                                        error: true,
                                        message: err.message
                                    })
                                })
                            })


                        } catch (error) {
                            res.status(500).send({
                                error: true,
                                message: error.message
                            })
                        }
                    })
                } else {
                    res.status(200).send({
                        error: true,
                        message: "Invalid Email"
                    })
                }


            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                }) 
            }
        })


    } catch (error) {
        res.status(406).send ({
            error: true,
            message: error.message
        })   
    }
}

// ########## Check user verify(tanpa middleware)
// const checkUserVerify = (req, res) => {
//     // Step1. Get All Data (Token)
//     let data = req.body
    
//     // Step2. Validasi Data (Token)
//     if(!(data.token)) return res.status(406).send({ error: true, message: 'Token Not Found!' })

//     // Step2. Verify Token (Decode Token)
//     jwt.verify(data.token, '123abc', (err, dataToken) => {
//         try {
//             if(err) throw err

//             // Step3. Query
//             db.query('SELECT * FROM users WHERE id = ?', dataToken.id, (err, result) => {
//                 try {
//                     if(err) throw err

//                     res.status(200).send({
//                         error: false, 
//                         is_email_confirmed: result[0].is_email_confirmed
//                     })
//                 } catch (error) {
//                     res.status(500).send({
//                         error: true, 
//                         message: error.message
//                     })
//                 }
//             })
//         } catch (error) {
//             res.status(500).send({
//                 error: true,
//                 message: 'Token Error'
//             })
//         }
//     })
// }

// ########## Check user verify(dengan middleware)
const checkUserVerify = (req, res) => {
    // Step1. Get All Data (Data Token Yang Sudah Di Decode Di Middleware)
    let data = req.dataToken

    // Step2. Query
    db.query('SELECT * FROM users WHERE id = ?', data.id, (err, result) => {
        try {
            if(err) throw err

            res.status(200).send({
                error: false, 
                is_email_confirmed: result[0].is_email_confirmed
            })
        } catch (error) {
            res.status(500).send({
                error: true, 
                message: error.message
            })
        }
    })
}

const example = (req, res) => {
    console.log('Controller')
}

module.exports = {
    register: register,
    sendEmail: sendEmail,
    login: login,
    emailConfirmation: emailConfirmation,
    checkUserVerify: checkUserVerify,
    example: example
}