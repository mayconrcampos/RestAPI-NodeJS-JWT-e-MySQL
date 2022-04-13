Curso com o prof Fernando Silva Maransatto.

Tecnologias abordadas.

Instalando instância MySQL-MariaDB no Docker.

// Iniciando Docker

$ sudo systemctl start docker

// Baixando imagem do MariaDB

$ docker pull mariadb

// Criando container mariadb com usuário root, senha root.

$ docker run -p 3306:3306 --name mysql-mariadb -e MYSQL_ROOT_PASSWORD=root -d mariadb

- Antes de criar o container com o comando acima, devo primeiro desligar meu mysql local com o comando.

$ sudo systemctl stop mysqld







<ul>
    <li>Rest API</li>
    <li>Node.JS - Backend</li>
    <li>Express - Gerenciador de Rotas</li>
    <li>JWT - Gerenciador de Autenticação</li>
    <li>MySQL - Banco de Dados</li>
</ul>
