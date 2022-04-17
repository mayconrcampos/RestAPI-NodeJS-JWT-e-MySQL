const express = require("express")
const router = express.Router()
const DB = require("../database/DB").pool
const multer = require("multer")

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
                        "imagem_produto": prod.imagem_produto,
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
                            "imagem_produto": prod.imagem_produto,
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
router.post("/", (upload.single("produto_imagem")), (req, res, next) => {
   
    // Criamos um objeto que vai receber os valores vindos do body, que é uma requisição via POST.
    if(!isNaN(req.body.preco) && req.body.preco !== false && req.body.preco > 0 && req.body.nome.length > 0){
        
        const produto = {
            "nome": req.body.nome,
            "preco": req.body.preco,
            "imagem_produto": req.file.path
        }
        
        DB.getConnection((error, conn) => { 
            if(error){return res.status(500).send({"error": error})}
            try {
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
                                "imagem_produto": produto.imagem_produto,
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
router.patch("/", (upload.single("produto_imagem")), (request, res, next) => {
    var produto = {
        "id": request.body.id,
        "nome": request.body.nome,
        "preco": request.body.preco,
        "imagem_produto": request.file.path
    }

    DB.getConnection((error, conn) => {
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
                    "imagem_produto": produto.imagem_produto,
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

