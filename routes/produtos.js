const express = require("express")
const router = express.Router()
const DB = require("../database/DB").pool
const multer = require("multer")
const localhost = "http://localhost:3000/"
const login = require("../middleware/login")


// Criamos a pasta pra guardar as imagens
const storage = multer.diskStorage({
    // caminho relativo da imagem
    "destination": function(req, file, callback) {
        callback(null, "./uploads/")
    },
    // Setamos o nome que essa imagem irá receber ao ser salva
    "filename": function(req, file, callback){
        callback(null, new Date().toISOString() + file.originalname.replace(/ /g, "_"))
    }
})
// Definimos um filtro para que somente receba jpeg ou png
const fileFilter = (req, file, callback) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "imagem/png"){
        callback(null, true)
    }else{
        callback(null, false)
    }
}

const upload = multer({
    "storage": storage,
    "limits": {
        "fileSize": 1024 * 1024 * 5,
        // 1024 bytes * 1024 bytes = 1mb * 5 = 5mb
        "fileFilter": fileFilter
    }
})



// Retorna todos os produtos
router.get("/", login.opcional, (request, res, next) => {
    
    DB.getConnection((error, conn) => { 

        if(error){return res.status(500).send({"error": error})}

        conn.query("SELECT * FROM produtos", (error, result, field) => {
            conn.release()

            if(error){
                return res.status(500).send({"error": error})
            }

            if(result.length == 0){
                return res.status(404).send({"error": "Não há produtos cadastrados."})
            }

            // Transformando um retorno simples em um retorno com mais detalhes
            const response = {
                quantidade: result.length,
                produtos: result.map(prod => {
                    return {
                        "id": prod.id,
                        "nome": prod.nome,
                        "preco": prod.preco,
                        "imagem_produto": `${localhost}${prod.imagem_produto}`,
                        "request": {
                            tipo: "GET",
                            descricao: "Retorna todos os produtos",
                            url: `${localhost}produtos/${prod.id}`
                        }
                    }
                })
            }
            
            return res.status(200).send({response})  
        })
    })
})

// Retorna dados de um produto
router.get("/:id_produto", login.opcional, (request, res, next) => {
    const id = request.params.id_produto

    if(!isNaN(id)){
        DB.getConnection((error, conn) => {
            if(error){return res.status(500).send({"error": error})}

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
                            "imagem_produto": `${localhost}${prod.imagem_produto}`,
                            "request": {
                                tipo: "GET",
                                descricao: `Retorna apenas produto com id ${prod.id}`,
                                url: `${localhost}produtos/${prod.id}`
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
router.post("/", login.obrigatorio, (upload.single("produto_imagem")), (req, res, next) => {
   
    // Criamos um objeto que vai receber os valores vindos do body, que é uma requisição via POST.
    if(!isNaN(req.body.preco) && req.body.preco !== false && req.body.preco > 0 && req.body.nome.length > 0){
        
        const produto = {
            "nome": req.body.nome,
            "preco": req.body.preco,
            "imagem_produto": req.file.path
        }
        
        DB.getConnection((error, conn) => { 
            if(error){return res.status(500).send({"error": error})}
           
            conn.query(
                "INSERT INTO produtos (nome, preco, imagem_produto) VALUES (?, ?, ?)",
                [produto.nome, produto.preco, produto.imagem_produto], 
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
                            "imagem_produto": `${localhost}${produto.imagem_produto}`,
                            "request": {
                                "tipo": "POST",
                                "descricao": "Insere um produto",
                                "url": `${localhost}produtos/${result.insertId}`
                            }
                        }
                    }
                    return res.status(201).send(response)
            })
        })

    }else{
        return res.status(500).send({
            "error": "Campos precisam ser preenchidos corretamente (String, Float).",
        })
    }
    
})

// Atualiza um produto
router.patch("/", login.obrigatorio, (upload.single("produto_imagem")), (request, res, next) => {
    var produto = {
        "id": request.body.id,
        "nome": request.body.nome,
        "preco": request.body.preco,
        "imagem_produto": request.file.path
    }

    DB.getConnection((error, conn) => {
        if(error){return res.status(500).send({"error": error})}

        conn.query(`UPDATE produtos SET nome=?, preco=?, imagem_produto=? WHERE id=?`, [produto.nome, produto.preco, produto.produto_imagem, produto.id], (error, result, field) => {
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
                    "imagem_produto": `${localhost}${produto.imagem_produto}`,
                    "request": {
                        "tipo": "PATCH",
                        "descricao": "Atualiza um produto",
                        "url": `${localhost}produtos/${produto.id}`,
                    }
                }
            }
            return res.status(202).send(response)
        })
    })

})

// Deleta um produto
router.delete("/", login.obrigatorio, (request, res, next) => {
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
                        "id": `${localhost}produtos/${id}`,
                        "request": {
                            "tipo": "DELETE",
                            "descricao": "Deleta um produto pelo id",
                            "url": `${localhost}produtos/${id}`,
                        }
                    }

                }

                return res.status(200).send(response)
            })
        })
    }
    
})

module.exports = router

