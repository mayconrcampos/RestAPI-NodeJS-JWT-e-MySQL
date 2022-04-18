const express = require("express")
const router = express.Router()
const DB = require("../database/DB").pool
const bcrypt = require("bcrypt")

router.post("/cadastro", (req, res, next) => {

    DB.getConnection((error, conn) => {
        if(error){return res.status(500).send({"error": error})}
        bcrypt.hash(req.body.password, 10, (errorBcrypt, hash) => {
            if(errorBcrypt){return res.status(500).send({"error": errorBcrypt})}

            conn.query("INSERT INTO usuarios (email, password) VALUES (? , ?)", [req.body.email, hash], (error, results) => {
                if(error){return res.status(500).send({"error": error})}
            })
        })

    })

})

module.exports = router