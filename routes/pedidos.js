const express = require("express")
const router = express.Router()


// Retorna todos os pedidos
router.get("/", (request, response, next) => {
    response.status(200).send({
        mensagem: "GET - Retorna todos os pedidos."
    })
})

// Retorna dados de um pedido
router.get("/:id_pedido", (request, response, next) => {
    const id = request.params.id_pedido

    response.status(200).send({
        mensagem: `GET - para retornar um pedido pelo: id ${id}`,
        "id": id
    })
    
})

// Insere um pedido
router.post("/", (request, response, next) => {
    response.status(201).send({
        mensagem: `POST - inserindo pedido`
    })
})

// Deleta um pedido
router.delete("/", (request, response, next) => {
    response.status(201).send({
        mensagem: "DELETE - deletando pedido."
    })
})




module.exports = router