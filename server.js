const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// CONFIGURAÇÕES
// =====================================================

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir os arquivos da TECHSHOP
app.use(express.static(__dirname));

// =====================================================
// PRODUTOS
// =====================================================

const produtos = [
    {
        id: 1,
        nome: "iPhone 13",
        preco: 2999.90,
        categoria: "celulares",
        imagem: ""
    },
    {
        id: 2,
        nome: "Samsung Galaxy S23",
        preco: 2499.90,
        categoria: "celulares",
        imagem: ""
    },
    {
        id: 3,
        nome: "Xiaomi Redmi Note 13",
        preco: 1399.90,
        categoria: "celulares",
        imagem: ""
    },
    {
        id: 4,
        nome: "Fone Bluetooth",
        preco: 99.90,
        categoria: "acessorios",
        imagem: ""
    },
    {
        id: 5,
        nome: "Carregador Turbo",
        preco: 79.90,
        categoria: "acessorios",
        imagem: ""
    },
    {
        id: 6,
        nome: "Cabo USB-C",
        preco: 39.90,
        categoria: "acessorios",
        imagem: ""
    },
    {
        id: 7,
        nome: "Power Bank 10.000mAh",
        preco: 119.90,
        categoria: "acessorios",
        imagem: ""
    },
    {
        id: 8,
        nome: "Película 3D",
        preco: 29.90,
        categoria: "acessorios",
        imagem: ""
    },
    {
        id: 9,
        nome: "Capa Premium",
        preco: 49.90,
        categoria: "acessorios",
        imagem: ""
    },
    {
        id: 10,
        nome: "Smartwatch",
        preco: 199.90,
        categoria: "smartwatch",
        imagem: ""
    }
];

// =====================================================
// CLIENTE DE TESTE
// =====================================================

const clienteTeste = {
    id: 1,
    nome: "Cliente Teste",
    email: "teste@techshop.com",
    senha: "123456",
    telefone: "",
    cpf: ""
};

// =====================================================
// STATUS DA API
// =====================================================

app.get("/api/status", (req, res) => {
    res.json({
        sucesso: true,
        online: true,
        mensagem: "API TECHSHOP funcionando!",
        data: new Date().toISOString()
    });
});

// =====================================================
// PRODUTOS
// =====================================================

app.get("/api/produtos", (req, res) => {
    res.json(produtos);
});

// =====================================================
// LOGIN
// =====================================================

app.post("/api/cliente/login", (req, res) => {
    try {
        const email = String(req.body?.email || "")
            .trim()
            .toLowerCase();

        const senha = String(req.body?.senha || "");

        if (!email || !senha) {
            return res.status(400).json({
                erro: "Informe o e-mail e a senha."
            });
        }

        if (
            email !== clienteTeste.email ||
            senha !== clienteTeste.senha
        ) {
            return res.status(401).json({
                erro: "E-mail ou senha incorretos."
            });
        }

        res.json({
            sucesso: true,
            usuario: {
                id: clienteTeste.id,
                nome: clienteTeste.nome,
                email: clienteTeste.email,
                telefone: clienteTeste.telefone,
                cpf: clienteTeste.cpf
            }
        });

    } catch (erro) {
        console.error("Erro no login:", erro);

        res.status(500).json({
            erro: "Erro interno ao fazer login."
        });
    }
});

// =====================================================
// CADASTRO
// =====================================================

app.post("/api/cliente/cadastro", (req, res) => {
    try {
        const {
            nome,
            email,
            senha,
            telefone,
            cpf
        } = req.body || {};

        if (!nome || !email || !senha) {
            return res.status(400).json({
                erro: "Preencha nome, e-mail e senha."
            });
        }

        res.json({
            sucesso: true,
            mensagem: "Cadastro realizado com sucesso!",
            usuario: {
                id: Date.now(),
                nome: String(nome),
                email: String(email).trim().toLowerCase(),
                telefone: telefone || "",
                cpf: cpf || ""
            }
        });

    } catch (erro) {
        console.error("Erro no cadastro:", erro);

        res.status(500).json({
            erro: "Erro interno ao realizar cadastro."
        });
    }
});

// =====================================================
// VERIFICAR CLIENTE
// =====================================================

app.get("/api/cliente/me", (req, res) => {
    res.status(401).json({
        autenticado: false,
        usuario: null
    });
});

// =====================================================
// LOGOUT
// =====================================================

app.post("/api/cliente/logout", (req, res) => {
    res.json({
        sucesso: true,
        mensagem: "Logout realizado."
    });
});

// =====================================================
// ROTA PRINCIPAL
// =====================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "techshop.html"));
});

// =====================================================
// ROTA 404 DA API
// =====================================================

app.use("/api", (req, res) => {
    res.status(404).json({
        erro: "Rota da API não encontrada.",
        rota: req.originalUrl
    });
});

// =====================================================
// ERRO GERAL
// =====================================================

app.use((erro, req, res, next) => {
    console.error("ERRO:", erro);

    res.status(500).json({
        erro: "Erro interno do servidor."
    });
});

// =====================================================
// SERVIDOR LOCAL
// =====================================================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log("");
        console.log("=================================");
        console.log("       TECHSHOP ONLINE");
        console.log("=================================");
        console.log(`Servidor: http://localhost:${PORT}`);
        console.log(`API:      http://localhost:${PORT}/api/status`);
        console.log(`Produtos: http://localhost:${PORT}/api/produtos`);
        console.log("=================================");
        console.log("");
    });
}

// =====================================================
// EXPORTAÇÃO PARA NETLIFY
// =====================================================

module.exports = app;