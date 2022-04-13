const express = require("express")
const router = express.Router()


// Retorna todos os produtos
router.get("/", (request, response, next) => {
    response.status(200).send({
        mensagem: "GET - Retorna todos os produtos."
    })
})

// Retorna dados de um produto
router.get("/:id_produto", (request, response, next) => {
    const id = request.params.id_produto

    response.status(200).send({
        mensagem: `GET - para retornar um produto pelo id ${id}`,
        "id": id
    })
})

// Insere um produto
router.post("/", (request, response, next) => {
    response.status(201).send({
        mensagem: `POST - inserindo produto.`
    })
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

