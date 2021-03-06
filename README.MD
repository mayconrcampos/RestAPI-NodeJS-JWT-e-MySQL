<h1>Curso com o prof Fernando Silva Maransatto - Youtube</h1>

<a target='_blank' href='https://www.youtube.com/watch?v=642J5YzLXDk&list=PLWgD0gfm500EMEDPyb3Orb28i7HK5_DkR&index=1'>Playlist Curso API com Node.JS + Express + JWT + MySQL</a>

<h2>Tecnologias abordadas.</h2>

<h3>Instalando instância MySQL-MariaDB no Docker.</h3>

<p>Para isto devemos ter o docker previamente instalado. No meu caso os comandos abaixo são para um ambiente Linux Fedora 35 Workstation.</p>

// Iniciando Docker

<pre>
    $ sudo systemctl start docker
</pre>

// Baixando imagem do MariaDB

<pre>
    $ docker pull mariadb
</pre>

// Criando container mariadb com usuário root, senha root.

<pre>
    $ docker run -p 3306:3306 --name mysql-mariadb -e MYSQL_ROOT_PASSWORD=root -d mariadb
</pre>

- Antes de criar o container com o comando acima, devo primeiro desligar meu mysql local com o comando.

<pre>
    $ sudo systemctl stop mysqld
</pre>

// Agora vamos conectar ao banco de dados criado usando o workbench ou algum programa gerenciador de SGDB. No meu caso utilizei o Sequeler.

Pra fazer isto, selecione como host = localhost, porta 3306, user=root, senha=root

Comandos SQL:

<pre>
    > CREATE DATABASE ecommerce;
</pre>


em seguida

<pre>
create table IF NOT EXISTS ecommerce.produtos (
	id INT(11) NOT NULL AUTO_INCREMENT,
	nome VARCHAR(45) NOT NULL,
	preco FLOAT(11) NOT NULL,
	PRIMARY KEY(id))
ENGINE = InnoDB 
DEFAULT CHARACTER SET = utf8;
</pre>
<pre>
    create table IF NOT EXISTS ecommerce.pedidos (
    	id INT(11) NOT NULL AUTO_INCREMENT,
    	id_produto INT(11) NOT NULL,
    	quantidade INT(11) NOT NULL,
        total FLOAT(11) NOT NULL
    	PRIMARY KEY(id),
    	CONSTRAINT fk_pedidos_produtos
    	FOREIGN KEY(id_produto) REFERENCES produtos(id)
    )engine = InnoDB DEFAULT CHARACTER SET = utf8;
</pre>
Assim as tabelas serão criadas.


Agora fazemos uma junção de tabelas INNER JOIN para trazermos todos os dados 
em um get pedidos.
<pre>
SELECT 	pedidos.id,
	pedidos.id_produto,
	produtos.nome,
	produtos.preco,
	pedidos.quantidade,
	pedidos.total
FROM pedidos
INNER JOIN produtos
ON produtos.id = pedidos.id_produto;
</pre>

Adicionando campo de imagem_produto na tabela produtos
<pre>
ALTER TABLE produtos
ADD COLUMN imagem_produto VARCHAR(500);
</pre>

Adicionando tabela usuarios pra criar sistema de Login com JWT (Json Web Token)

<pre>
CREATE TABLE usuarios (
    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(256) UNIQUE NOT NULL,
    password VARCHAR(256) NOT NULL
);
</pre>

Inserindo um produto de teste

<pre>
    insert into produtos (nome, preco) values ('Mouse Pad', 19.90);
</pre>

Listando todos os produtos

<pre>
    select * from produtos;
</pre>

Agora chegou o ponto em que vamos instalar o driver javascript para MySQL com o comando.

<pre>
    $ npm install --save mysql 
</pre>



<ul>
    <li>Rest API</li>
    <li>Node.JS - Backend</li>
    <li>Express - Gerenciador de Rotas</li>
    <li>JWT - Gerenciador de Autenticação</li>
    <li>MySQL - Banco de Dados</li>
</ul>
