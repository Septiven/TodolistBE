const mysql = require('mysql')

// Connection
const db = mysql.createConnection({
    user: 'root',
    password: 'Lukas',
    database: 'authentic_system',
    port: 3306
})

module.exports = db