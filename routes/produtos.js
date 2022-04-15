const express = require("express")
const router = express.Router()
const DB = require("../database/DB").pool


// Retorna todos os produtos
router.get("/", (request, res, next) => {
    
    DB.getConnection((error, conn) => { 
        conn.query("SELECT * FROM produtos", (error, result, field) => {
            conn.release()

            if(error){
                return res.status(500).send({"error": error})
            }

            // Transformando um retorno simples em um retorno com mais detalhes
            const response = {
                quantidade: result.length,
                produtos: result.map(prod => {
                    return {
                        "id": prod.id,
                        "nome": prod.nome,
                        "preco": prod.preco,
                        "request": {
                            tipo: "GET",
                            descricao: "Retorna todos os produtos",
                            url: `http://localhost:3000/produtos/${prod.id}`
                        }
                    }
                })
            }
            
            return res.status(200).send({response})  
        })
    })
})

// Retorna dados de um produto
router.get("/:id_produto", (request, res, next) => {
    const id = request.params.id_produto

    if(!isNaN(id)){
        DB.getConnection((error, conn) => {
            conn.query(`SELECT * FROM produtos WHERE id=${id}`, (error, result, field) =>{
                conn.release()
    
                if(error){
                    return res.status(500).send({"error": error})
                }

                if(result.length == 0){
                    return res.status(404).send({"mensagem":`Não foi encontrado produto com id ${id}`})
                }
                // Transformando um retorno simples em um retorno com mais detalhes
                const response = {
                    quantidade: result.length,
                    produto: result.map(prod => {
                        return {
                            "id": prod.id,
                            "nome": prod.nome,
                            "preco": prod.preco,
                            "request": {
                                tipo: "GET",
                                descricao: `Retorna apenas produto com id ${prod.id}`,
                                url: `http://localhost:3000/produtos/${prod.id}`
                            }
                        }
                    })
                }
    
                return res.status(200).send({response})
            })
        })
    }else{
        return res.status(500).send({
            "error": "ID com valor inválido (Não Numérico)",
        })
    }
    
})

// Insere um produto
router.post("/", (req, res, next) => {
    // Criamos um objeto que vai receber os valores vindos do body, que é uma requisição via POST.
    if(!isNaN(req.body.preco) && req.body.preco !== false && req.body.preco > 0 && req.body.nome.length > 0){
        
        const produto = {
            "nome": req.body.nome,
            "preco": req.body.preco
        }
        
        DB.getConnection((error, conn) => { 
            if(error){return res.status(500).send({"error": error})}
            try {
                conn.query(
                    "INSERT INTO produtos (nome, preco) VALUES (? ,?)",
                    [produto.nome, produto.preco], 
                    (error, result, field) => {
                        // Assim que a query for executada e entrar nesse calback, é preciso liberar a conexão usando conn.release()
                        conn.release()
        
                        if(error){ 
                            return res.status(500).send({"error": error}) 
                        }
                        const response = {
                            "mensagem": "Produto inserido com sucesso",
                            "produto": {
                                "id": result.insertId,
                                "nome": produto.nome,
                                "preco": produto.preco,
                                "request": {
                                    "tipo": "POST",
                                    "descricao": "Insere um produto",
                                    "url": `http://localhost:3000/produtos/${result.insertId}`
                                }
                            }
                        }

                        return res.status(201).send(response)
                    }
                )
            } catch (error) {
                return res.status(500).send({
                    code: 'ER_ACCESS_DENIED_ERROR',
                    errno: 1045,
                    sqlMessage: "Access denied for user ''@'172.17.0.1' (using password: NO)",
                    sqlState: '28000',
                    fatal: true
                })
            }
            
        })

    }else{
        return res.status(500).send({
            "error": "Campos precisam ser preenchidos corretamente (String, Float).",
        })
    }
    
})

// Atualiza um produto
router.patch("/", (request, res, next) => {
    var produto = {
        "id": request.body.id,
        "nome": request.body.nome,
        "preco": request.body.preco
    }

    DB.getConnection((error, conn) => {
        conn.query(`UPDATE produtos SET nome=?, preco=? WHERE id=?`, [produto.nome, produto.preco, produto.id], (error, result, field) => {
            conn.release()

            if(error){
                return res.status(500).send({"error": error})
            }
            if(result.affectedRows == 0){
                return res.status(404).send({"mensagem":`Produto não encontrado com id ${produto.id}`})
            }
            const response = {
                "mensagem": "Item atualizado com sucesso",
                "produto": {
                    "id": produto.id,
                    "nome": produto.nome,
                    "preco": produto.preco,
                    "request": {
                        "tipo": "PATCH",
                        "descricao": "Atualiza um produto",
                        "url": `http://localhost:3000/produtos/${produto.id}`,
                    }
                }
            }
            return res.status(202).send(response)
         
            
        })
    })

})

// Deleta um produto
router.delete("/", (request, res, next) => {
    var id = request.body.id
    if(!isNaN(id) && id !== 0){
        DB.getConnection((error, conn) => {
            if(error){return res.status(500).send({"error": error})}

            conn.query(`DELETE FROM produtos WHERE id=${id}`, (error, result, field) => {

                if(error){
                    return res.status(500).send({"error": error})
                }

                if(result.affectedRows == 0){
                    return res.status(404).send({"mensagem": "Produto não encontrado."})
                }

                const response = {
                    "mensagem": "Item excluido com sucesso",
                    "produto": {
                        "id": `http://localhost:3000/produtos/${id}`,
                        "request": {
                            "tipo": "DELETE",
                            "descricao": "Deleta um produto pelo id",
                            "url": `http://localhost:3000/produtos/${id}`,
                        }
                    }

                }

                return res.status(200).send(response)
            })
        })
    }
    
})

module.exports = router

