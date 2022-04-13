const http = require("http")
const app = require("./app")

// Define a porta utilizando a porta padrão do meu OS,
// Se não tiver nenhuma setada, ele usa a 3000.
const porta = process.env.PORT || 3000;

// Cria um servidor utilizando o app como parâmetro.
const server = http.createServer(app);

// Ao ser executado, o servidor irá escutar conexões na porta indicada.
server.listen(porta, () => console.log(`Servidor rodando na porta ${porta}`))