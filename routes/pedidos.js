const express = require("express")
const router = express.Router()
const DB = require("../database/DB").pool
const login = require("../middleware/login")


// Retorna todos os pedidos
router.get("/", login.opcional, (req, res, next) => {
    
    DB.getConnection((error, conn) => {
        if(error){return res.status(500).send({"error": error})}

        conn.query(`SELECT 	pedidos.id as id,
                        pedidos.id_produto as id_produto,
                        produtos.nome as nome,
                        produtos.preco as preco,
                        produtos.imagem_produto as imagem,
                        pedidos.quantidade as qtde,
                        pedidos.total
                    FROM pedidos
                    INNER JOIN produtos
                    ON produtos.id = pedidos.id_produto`, (error, result, field) => {
            conn.release()
            if(error){return res.status(500).send({"error": error})}

            // Transformando um retorno simples em um retorno com mais detalhes
            const response = {
                quantidade: result.length,
                pedidos: result.map(ped => {
                    return {
                        "id_pedido": ped.id,
                        "produto": {
                            "id_produto": ped.id_produto,
                            "nome": ped.nome,
                            "preco": ped.preco,
                            "imagem_produto": ped.imagem
                        },
                        "quantidade": ped.qtde,
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
router.get("/:id_pedido", login.opcional, (req, res, next) => {
    const id = req.params.id_pedido

    if(!isNaN(id) && id > 0){

        DB.getConnection((error, conn) => {
            if(error){return res.status(500).send({"error": error})}

            conn.query(`SELECT 	pedidos.id as id,
                            pedidos.id_produto as id_produto,
                            produtos.nome as nome,
                            produtos.preco as preco,
                            produtos.imagem_produto as imagem,
                            pedidos.quantidade as qtde,
                            pedidos.total
                        FROM pedidos
                        INNER JOIN produtos
                        ON produtos.id = pedidos.id_produto
                        WHERE pedidos.id=?`, id, (error, result) =>{
                conn.release()

                if(error){return res.status(500).send({"error": error})}

                if(result.length == 0){return res.status(404).send({
                    "mensagem": "Erro ao buscar pedido pelo id.",
                    "error": `Pedido com ID ${id} n??o encontrado.`
                })}

                const response = {
                    quantidade: result.length,
                    pedido: result.map(ped => {
                        return {
                            "id_pedido": ped.id,
                            "produto": {
                                "id_produto": ped.id_produto,
                                "nome": ped.nome,
                                "preco": ped.preco,
                                "imagem": ped.imagem
                            },
                            "quantidade": ped.qtde,
                            "total": ped.total,
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
router.post("/", login.obrigatorio, (req, res, next) => {
    if(!isNaN(req.body.id_produto)){
        var pedido = {
            "id_produto": req.body.id_produto,
            "quantidade": req.body.quantidade
        }
       
        if(pedido.id_produto > 0){
            // Verificar se existe id_produto na tabela de produtos
            DB.getConnection((error, conn) =>{
                if(error){return res.status(500).send({"error": error})}

                conn.query("SELECT * FROM produtos WHERE id=?", pedido.id_produto, (error, result) => {

                    if(error){return res.status(500).send({"error": error})}

                    
                    if(result.length == 0){
                        return res.status(404).send({
                            "mensagem": "Erro ao inserir pedido.",
                            "error": `Produto ID ${pedido.id_produto} n??o existe na tabela produtos.`})

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
                                    "total": total,
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
                "error": "?? preciso preencher os campos com valores num??ricos acima de zero.",
                "pedido": {
                    "idProduto": "Integer > 0",
                    "quantidade": "Integer > 0"
                }
            })
        }

        



    }else{
        return res.status(500).send({
            "mensagem": "Erro ao inserir pedido.",
            "error": "?? preciso preencher os campos com dados v??lidos.",
            "pedido": {
                "id": "Integer",
                "idProduto": "Integer",
                "quantidade": "Integer"
            
            }
        })
    }
})

// Atualiza um pedido

router.patch("/", login.obrigatorio, (req, res, next) => {

    if(!isNaN(req.body.id) && !isNaN(req.body.id_produto) && !isNaN(req.body.quantidade)){

        var pedido = {
            "id": req.body.id,
            "id_produto": req.body.id_produto,
            "quantidade": req.body.quantidade,
        }

        if(pedido.id > 0 && pedido.id_produto > 0 && pedido.quantidade > 0){
            DB.getConnection((error, conn)=> {
                if(error){return res.status(500).send({"error": error})}

                conn.query("SELECT preco FROM produtos WHERE id=?",pedido.id_produto, (error, result)=> {
                    if(error){return res.status(500).send({"error": error})}

                    if(result.length == 0){
                        return res.status(404).send({"mensagem": "Produto n??o encontrado."})
                    }
                    var total = result[0].preco * pedido.quantidade
                    console.log(total)
                    /**
                     * Ver aqui na segunda, patch, atualizar pedido
                     * 
                     */
                    DB.getConnection((error, conn) => {
                        if(error){return res.status(500).send({"error": error})}

                        conn.query(`UPDATE pedidos SET id_produto=?, quantidade=?, total=? WHERE id=?`, [pedido.id_produto, pedido.quantidade, total, pedido.id], (error, result, field) => {
                            conn.release()
                
                            if(error){
                                return res.status(500).send({"error": error})
                            }
                            if(result.affectedRows == 0){
                                console.log(result)
                                return res.status(404).send({"mensagem":`pedido n??o encontrado com id ${pedido.id}`})
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
                "error": "?? preciso que valores sejam num??ricos e acima de zero.",
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
            "error": "?? preciso preencher os campos com dados num??ricos v??lidos.",
            "pedido": {
                "id": "Integer",
                "idProduto": "Integer",
                "preco": "Float"
            }
        })
    }


})

// Deleta um pedido
router.delete("/", login.obrigatorio, (req, res, next) => {
    var id = req.body.id

    if(!isNaN(id) && id > 0){
        DB.getConnection((error, conn) => {
            if(error){return res.status(500).send({"error": error})}

            conn.query("DELETE FROM pedidos WHERE id=?", id, (error, result) => {
                conn.release()

                if(error){return res.status(500).send({"error": error})}

                if(result.affectedRows == 0){
                    return res.status(404).send({
                        "mensagem": "N??o foi poss??vel excluir item.",
                        "erro": `ID ${id} n??o encontrado.`
                    })}
                
                res.status(201).send({
                    "mensagem": `Pedido com ID ${id} exclu??do com sucesso.`,
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