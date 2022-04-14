const express = require("express")
const router = express.Router()
const DB = require("../database/DB").pool


// Retorna todos os produtos
router.get("/", (request, response, next) => {
    
    DB.getConnection((error, conn) => { 
        conn.query("SELECT * FROM produtos", (error, resultado, field) => {
            conn.release()

            if(error){
                return resultado.status(500).send({
                    "error": error,
                    "response": null
                })
            }
            
            response.status(200).send({
                mensagem: "Listando todos os produtos.",
                produtos: resultado
                
            })
        })
    })
})

// Retorna dados de um produto
router.get("/:id_produto", (request, response, next) => {
    const id = request.params.id_produto
    DB.getConnection((error, conn) => {
        conn.query(`SELECT * FROM produtos WHERE id=${id}`, (error, resultado, field) =>{
            conn.release()

            if(error){
                return resultado.status(500).send({
                    "error": error,
                    "response": null
                })
            }

            response.status(200).send({
                mensagem: `Listando apenas o produto com id=${id}`,
                produto: resultado
            })
        })
    })
})

// Insere um produto
router.post("/", (request, response, next) => {
    // Criamos um objeto que vai receber os valores vindos do body, que é uma requisição via POST.
    if(!isNaN(request.body.preco) && request.body.preco !== false && request.body.preco > 0 && request.body.nome.length > 0){
        
        const produto = {
            "nome": request.body.nome,
            "preco": request.body.preco
        }
        console.log("Caiu no if"+ produto.nome, produto.preco)
        DB.getConnection((error, conn) => { 
            console.log("erro"+error)
            try {
                conn.query(
                    "INSERT INTO produtos (nome, preco) VALUES (? ,?)",
                    [produto.nome, produto.preco], 
                    (error, resultado, field) => {
                        // Assim que a query for executada e entrar nesse calback, é preciso liberar a conexão usando conn.release()
                        conn.release()
        
                        if(error){ 
                            return response.status(500).send({
                                "error": error,
                                "response": null
                            }) 
                        }
                        response.status(201).send({
                            "mensagem": `Produto inserido com sucesso.`,
                            "id_produto": resultado.insertId
                        })
                    }
                )
            } catch (error) {
                response.status(500).send({
                    code: 'ER_ACCESS_DENIED_ERROR',
                    errno: 1045,
                    sqlMessage: "Access denied for user ''@'172.17.0.1' (using password: NO)",
                    sqlState: '28000',
                    fatal: true
                })
            }
            
        })

    }else{
        console.log("caiu no else")
        response.status(500).send({
            "error": "Campos precisam ser preenchidos corretamente (String, Float).",
            "response": null
        })
    }
    
})

// Atualiza um produto
router.patch("/", (request, response, next) => {
    response.status(201).send({
        mensagem: "PATCH - atualizando produto."
    })
})

// Deleta um produto
router.delete("/", (request, response, next) => {
    response.status(201).send({
        mensagem: "DELETE - deletando produto."
    })
})




module.exports = router

