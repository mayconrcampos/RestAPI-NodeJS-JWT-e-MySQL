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
                        "quantidade": ped.preco,
                        "total": ped.total,
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
                            "quantidade": ped.quantidade,
                            "total": ped.quantidade,
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
    if(!isNaN(req.body.id_produto)){
        var pedido = {
            "id_produto": req.body.id_produto,
            "quantidade": req.body.quantidade
        }
       
        if(pedido.id_produto > 0){
            // Verificar se existe id_produto na tabela de produtos
            DB.getConnection((error, conn) =>{
                conn.query("SELECT * FROM produtos WHERE id=?", pedido.id_produto, (error, result) => {

                    if(error){return res.status(500).send({"error": error})}

                    
                    if(result.length == 0){
                        return res.status(404).send({
                            "mensagem": "Erro ao inserir pedido.",
                            "error": `Produto ID ${pedido.id_produto} não existe na tabela produtos.`})

                    }else{
                        var preco = result[0].preco
                        var total = pedido.quantidade * preco
                        
                        conn.query("INSERT INTO pedidos (id_produto, quantidade, total) VALUES (?, ?, ?)", [pedido.id_produto, pedido.quantidade, total], (error, result) => {
                            conn.release()
        
                            if(error){return res.status(500).send({"error": error})}
        
                            const response = {
                                "mensagem": "Pedido inserido com sucesso",
                                "pedido": {
                                    "id": result.insertId,
                                    "id_produto": pedido.id_produto,
                                    "quantidade": pedido.quantidade,
                                    "total": result.total,
                                    "request": {
                                        "tipo": "POST",
                                        "descricao": "Insere um pedido",
                                        "url": `http://localhost:3000/pedidos/${result.insertId}`
                                    }
                                }
                            }
                            return res.status(201).send(response)  
                        })
                        
                    }
                })
            })
            
            
        }else{
            return res.status(500).send({
                "mensagem": "Erro ao inserir pedido.",
                "error": "É preciso preencher os campos com valores numéricos acima de zero.",
                "pedido": {
                    "idProduto": "Integer > 0",
                    "quantidade": "Integer > 0"
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
                "quantidade": "Integer"
            
            }
        })
    }
})

// Atualiza um pedido

router.patch("/", (req, res, next) => {

    if(!isNaN(req.body.id) && !isNaN(req.body.id_produto) && !isNaN(req.body.quantidade)){

        var pedido = {
            "id": req.body.id,
            "id_produto": req.body.id_produto,
            "quantidade": req.body.quantidade,
        }

        if(pedido.id > 0 && pedido.id_produto > 0 && pedido.quantidade > 0){
            DB.getConnection((error, conn)=> {
                conn.query("SELECT preco FROM produtos WHERE id=?",pedido.id_produto, (error, result)=> {
                    if(error){return res.status(500).send({"error": error})}

                    if(result.length == 0){
                        return res.status(404).send({"mensagem": "Produto não encontrado."})
                    }
                    var total = result[0].preco * pedido.quantidade
                    console.log(total)
                    /**
                     * Ver aqui na segunda, patch, atualizar pedido
                     * 
                     */
                    DB.getConnection((error, conn) => {
                        conn.query(`UPDATE pedidos SET id_produto=?, quantidade=?, total=? WHERE id=?`, [pedido.id_produto, pedido.quantidade, total, pedido.id], (error, result, field) => {
                            conn.release()
                
                            if(error){
                                return res.status(500).send({"error": error})
                            }
                            if(result.affectedRows == 0){
                                console.log(result)
                                return res.status(404).send({"mensagem":`pedido não encontrado com id ${pedido.id}`})
                            }
                            const response = {
                                "mensagem": "Item atualizado com sucesso",
                                "pedido": {
                                    "id": pedido.id,
                                    "id_produto": pedido.id_produto,
                                    "quantidade": pedido.quantidade,
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