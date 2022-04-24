const connection = require("mysql")

var pool = connection.createPool({
    // Modo certo a se fazer
    //"user": process.env.MYSQL_USER,
    //"host": process.env.MYSQL_HOST,
    //"port": process.env.MYSQL_PORT,
    //"password": process.env.MYSQL_PASSWORD,
    //"database": process.env.MYSQL_DATABASE

    // Esse é o modo simples pra estudos.
    "user": "root",
    "password": "5DaJ10.,Xw,8",
    "host": "localhost",
    "port": 3306,
    "database": "ecommerce"
})

exports.pool = pool;