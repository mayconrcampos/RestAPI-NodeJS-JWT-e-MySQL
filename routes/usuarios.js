const express = require("express")
const router = express.Router()
const DB = require("../database/DB").pool
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

router.post("/cadastro", (req, res, next) => {

    DB.getConnection((error, conn) => {
        if(error){return res.status(500).send({"error": error})}

        // Consultar tabela pra ver se email já está cadastrado
        conn.query("SELECT email FROM usuarios WHERE email=?", req.body.email, (error, result) => {
            if(error){return res.status(500).send({"error": error})}

            if(result.length > 0){
                return res.status(401).send({"mensagem": `O usuário ${req.body.email} já está cadastrado.`})            
            }

            // Transforma req.body.password em hash
            bcrypt.hash(req.body.password, 10, (errorBcrypt, hash) => {
                if(errorBcrypt){return res.status(500).send({"error": errorBcrypt})}

                // Se chegou até aqui, deu tudo certo com a cripto
                conn.query("INSERT INTO usuarios (email, password) VALUES (?, ?)", [req.body.email, hash], (error, result) => {
                    conn.release()
                    if(error){return res.status(500).send({"error": error})}

                    const response = {
                        "mensagem": "Usuário criado com sucesso",
                        "usuario": {
                            "id": result.insertId,
                            "email": req.body.email,
                            "request": {
                                "tipo": "POST",
                                "descricao": "Insere um usuário",
                            }
                        }
                    }

                    return res.status(201).send(response)
                })
            })

        })
    })
})

router.post("/login", (req, res, next) => {
    DB.getConnection((error, conn) => {
        if(error){ return res.status(500).send({"error": error}) }

        conn.query("SELECT * FROM usuarios WHERE email = ?", req.body.email, (error, result) => {
            conn.release()
            if(error){ return res.status(500).send({"error": error}) }

            if(result.length < 1){
                return res.status(401).send({"mensagem": "Falha na autenticação."})
            }

            bcrypt.compare(req.body.password, result[0].password, (error, results) => {
                if(error){ return res.status(500).send({"error": error}) }

                if(results){
                    const token = jwt.sign({
                        "id": result[0].id,
                        "email": result[0].email

                    }, /*process.env.JWT_KEY*/"secreto",{
                        "expiresIn": "1h"
                    })
                    return res.status(200).send({
                        "mensagem": "Autenticado com sucesso.",
                        "token": token
                    })
                }

                return res.status(401).send({"mensagem": "Falha na autenticação."})
            })
        })
    })
})

module.exports = router