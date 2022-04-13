const express = require("express")
const app = express()
const morgan = require("morgan")

const rotaProdutos = require("./routes/produtos")
const rotaPedidos = require("./routes/pedidos")


app.use(morgan("dev"))
app.use("/produtos", rotaProdutos)
app.use("/pedidos", rotaPedidos)

// Tratamento para quando não encontrar nenhuma rota
app.use((req, res, next) => {
    const erro = new Error(`Página não encontrada`)
    erro.status = 404
    next(erro)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    
    return res.send({
        erro: {
            mensagem: `Erro ${error.status} - ${error.message}`
        }
    })
})

module.exports = app