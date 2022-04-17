const express = require("express")
const app = express()
const morgan = require("morgan")
const bodyParser = require("body-parser")

const rotaProdutos = require("./routes/produtos")
const rotaPedidos = require("./routes/pedidos")


app.use(morgan("dev"))
app.use("/uploads", express.static("uploads"))
app.use(bodyParser.urlencoded({extended: false})) // Apenas dados simples
app.use(bodyParser.json()) // json de entrada body

app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*")
    response.header("Access-Control-Allow-Header", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length")

    if(request.method === "OPTIONS"){
        response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH")
        return response.status(200).send({})
    }
    
    next()
})

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