// Import Connection
const db = require('./../connection/Connection')

const create = (req, res) => {
    try {
        // Step1. Get All Data
        const data = req.body
        const dataToken = req.dataToken

        console.log(data)
        console.log(dataToken.id)

        // Step2. Validasi Data
        if(!data.title || !data.description || !data.date) throw { message: 'Data Must Be Filled!' }

        let dataToInsert = {
            title: data.title,
            description: data.description,
            date: data.date,
            users_id: dataToken.id
        }

        // Step3. Insert Data
        db.query(`INSERT INTO todolists SET ?`, dataToInsert, (err, result) => {
            try {
                if(err) throw err

                res.status(200).send({
                    error: false,
                    message: 'Create Todo Success'
                })
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

const get = (req, res) => {
    // Step1. Get All Data (Get Data Token)
    let idUser = req.dataToken.id

    // Step2. Query
    db.query(`SELECT * FROM todolists WHERE users_id = ${idUser}`, (err, result) => {
        try {
            if(err) throw err

            let newData = []

            result.forEach((value) => {
                
                let dateIndex = null

                newData.forEach((val, index) => {
                    if(val.date === (value.date).toString().split(' ')[2] + ' ' + (value.date).toString().split(' ')[1] + ' ' + (value.date).toString().split(' ')[3]){
                        dateIndex = index
                    }
                })

                if(dateIndex === null){
                    newData.push(
                        {
                            date: (value.date).toString().split(' ')[2] + ' ' + (value.date).toString().split(' ')[1] + ' ' + (value.date).toString().split(' ')[3],
                            todolists: [{
                                id: value.id, title: value.title, description: value.description, status: value.status
                            }]
                        }
                    )
                }else{
                    newData[dateIndex].todolists.push({id: value.id, title: value.title, description: value.description, status: value.status})
                }
            })

            res.status(200).send({
                error: false,
                message: 'Get Data Success',
                data: newData
            })
        } catch (error) {
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    })
}

const deleteData = (req, res) => {
    const id = req.body.id
    // console.log (req.body)

    db.query (`DELETE FROM todolists WHERE id = ${id}`, (err, result) => {
        try {
            if (err) throw err

            res.status (200).send ({
                error: false,
                message: "Deleted Successful"
            })
            
        } catch (error) {
            res.status (500).send ({
                error: true,
                message: error.message
            })
        }
    })

}

module.exports = {
    create: create,
    get: get,
    deleteData: deleteData,
}


