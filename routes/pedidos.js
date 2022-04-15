const express = require("express")
const router = express.Router()
const DB = require("../database/DB").pool


// Retorna todos os pedidos
router.get("/", (req, res, next) => {
    
    DB.getConnection((error, conn) => {

        conn.query("SELECT * FROM pedidos", (error, result, field) => {
            conn.release()
            if(error){return res.status(500).send({"error": error})}

            // Transformando um retorno simples em um retorno com mais detalhes
            const response = {
                quantidade: result.length,
                pedidos: result.map(ped => {
                    return {
                        "id": ped.id,
                        "nome": ped.id_produto,
                        "preco": ped.preco,
                        "request": {
                            tipo: "GET",
                            descricao: "Retorna todos os pedidos",
                            url: `http://localhost:3000/pedidos/${ped.id}`
                        }
                    }
                })
            }

            return res.status(200).send(response)
        })
    })
})

// Retorna dados de um pedido
router.get("/:id_pedido", (req, res, next) => {
    const id = req.params.id_pedido

    if(!isNaN(id) && id > 0){

        DB.getConnection((error, conn) => {
            conn.query("SELECT * FROM pedidos WHERE id=?", id, (error, result) =>{
                conn.release()

                if(error){return res.status(500).send({"error": error})}

                if(result.length == 0){return res.status(404).send({
                    "mensagem": "Erro ao buscar pedido pelo id.",
                    "error": `Pedido com ID ${id} não encontrado.`
                })}

                const response = {
                    quantidade: result.length,
                    pedido: result.map(ped => {
                        return {
                            "id": ped.id,
                            "nome": ped.nome,
                            "preco": ped.preco,
                            "request": {
                                tipo: "GET",
                                descricao: `Retorna apenas pedido pelo id ${ped.id}`,
                                url: `http://localhost:3000/pedidos/${ped.id}`
                            }
                        }
                    })
                }

                return res.status(200).send(response)
            })
        })
    }
})

// Insere um pedido
router.post("/", (req, res, next) => {
    if(!isNaN(req.body.id_produto) && !isNaN(req.body.preco)){
        var pedido = {
            "id_produto": req.body.id_produto,
            "preco": req.body.preco
        }

        if(pedido.id_produto > 0 && pedido.preco > 0){
            DB.getConnection((error, conn) => {
                conn.query("INSERT INTO pedidos (id_produto, preco) VALUES (?, ?)", [pedido.id_produto, pedido.preco], (error, result) => {
                    conn.release()

                    if(error){return res.status(500).send({"error": error})}

                    const response = {
                        "mensagem": "Pedido inserido com sucesso",
                        "pedido": {
                            "id": result.insertId,
                            "id_produto": pedido.id_produto,
                            "preco": pedido.preco,
                            "request": {
                                "tipo": "POST",
                                "descricao": "Insere um pedido",
                                "url": `http://localhost:3000/pedidos/${result.insertId}`
                            }
                        }
                    }
                    return res.status(201).send(response)
                })
            })
            
        }else{
            return res.status(500).send({
                "mensagem": "Erro ao inserir pedido.",
                "error": "É preciso preencher os campos com valores numéricos acima de zero.",
                "pedido": {
                    "idProduto": "Integer > 0",
                    "preco": "Float > 0"
                }
            })
        }

        



    }else{
        return res.status(500).send({
            "mensagem": "Erro ao inserir pedido.",
            "error": "É preciso preencher os campos com dados válidos.",
            "pedido": {
                "id": "Integer",
                "idProduto": "Integer",
                "preco": "Float"
            }
        })
    }
})

// Atualiza um pedido

router.patch("/", (req, res, next) => {

    if(!isNaN(req.body.id) && !isNaN(req.body.id_produto) && !isNaN(req.body.preco)){

        var pedido = {
            "id": req.body.id,
            "id_produto": req.body.id_produto,
            "preco": req.body.preco
        }

        if(pedido.id > 0 && pedido.id_produto > 0 && pedido.preco > 0){
            DB.getConnection((error, conn) => {
                conn.query(`UPDATE pedidos SET id_produto=?, preco=? WHERE id=?`, [pedido.id_produto, pedido.preco, pedido.id], (error, result, field) => {
                    conn.release()
        
                    if(error){
                        return res.status(500).send({"error": error})
                    }
                    if(result.affectedRows == 0){
                        return res.status(404).send({"mensagem":`pedido não encontrado com id ${pedido.id}`})
                    }
                    const response = {
                        "mensagem": "Item atualizado com sucesso",
                        "pedido": {
                            "id": pedido.id,
                            "id_produto": pedido.id_produto,
                            "preco": pedido.preco,
                            "request": {
                                "tipo": "PATCH",
                                "descricao": "Atualiza um pedido",
                                "url": `http://localhost:3000/pedidos/${pedido.id}`,
                            }
                        }
                    }
                    return res.status(202).send(response)
                 
                    
                })
            })
        }else{
            return res.status(500).send({
                "mensagem": "Erro ao atualizar pedido.",
                "error": "É preciso que valores sejam numéricos e acima de zero.",
                "pedido": {
                    "id": "Integer > 0",
                    "id_produto": "Integer > 0",
                    "preco": "Float > 0"
                }
            })
        }
    
        

    }else{
        return res.status(500).send({
            "mensagem": "Erro ao atualizar pedido.",
            "error": "É preciso preencher os campos com dados numéricos válidos.",
            "pedido": {
                "id": "Integer",
                "idProduto": "Integer",
                "preco": "Float"
            }
        })
    }


})

// Deleta um pedido
router.delete("/", (req, res, next) => {
    var id = req.body.id

    if(!isNaN(id) && id > 0){
        DB.getConnection((error, conn) => {
            conn.query("DELETE FROM pedidos WHERE id=?", id, (error, result) => {
                conn.release()

                if(error){return res.status(500).send({"error": error})}

                if(result.affectedRows == 0){
                    return res.status(404).send({
                        "mensagem": "Não foi possível excluir item.",
                        "erro": `ID ${id} não encontrado.`
                    })}
                
                res.status(201).send({
                    "mensagem": `Pedido com ID ${id} excluído com sucesso.`,
                    "request": {
                        "tipo": "DELETE",
                        "descricao": "Deleta um pedido pelo id",
                        "url": "http://localhost:3000/pedidos/"+id
                    }
                })
            })
        })
    }
})




module.exports = router