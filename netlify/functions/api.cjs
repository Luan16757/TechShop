const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const serverless = require("serverless-http");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================================
   CAMINHOS
========================================================= */

const pastaTechshop = __dirname;

// Suas imagens estão em:
// D:\Teste\imagens
const pastaImagens = path.join(__dirname, "..", "imagens");

const pedidosFile = path.join(pastaTechshop, "pedidos.json");
const usuariosFile = path.join(pastaTechshop, "usuarios.json");

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "";

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(
    express.json({
        limit: "5mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

/* Netlify Function path normalization */
app.use((req, res, next) => {
    const prefix = "/.netlify/functions/api";
    if (req.url && req.url.startsWith(prefix)) {
        req.url = req.url.slice(prefix.length) || "/";
    }
    next();
});

/* =========================================================
   ARQUIVOS JSON
========================================================= */

function garantirArquivo(arquivo, valorInicial) {
    if (!fs.existsSync(arquivo)) {
        fs.writeFileSync(
            arquivo,
            JSON.stringify(valorInicial, null, 2),
            "utf8"
        );
    }
}

function lerJSON(arquivo, valorInicial) {
    garantirArquivo(arquivo, valorInicial);

    try {
        const conteudo = fs.readFileSync(
            arquivo,
            "utf8"
        );

        if (!conteudo.trim()) {
            return valorInicial;
        }

        return JSON.parse(conteudo);
    } catch (erro) {
        console.error(
            "Erro ao ler JSON:",
            arquivo,
            erro
        );

        return valorInicial;
    }
}

function salvarJSON(arquivo, dados) {
    fs.writeFileSync(
        arquivo,
        JSON.stringify(dados, null, 2),
        "utf8"
    );
}

garantirArquivo(
    pedidosFile,
    []
);

garantirArquivo(
    usuariosFile,
    []
);

/* =========================================================
   PRODUTOS
========================================================= */

const produtos = [

    {
        id: 1,
        nome: "Kit 5 Cabos iPhone USB",
        preco: 35.00,
        imagem: "imagens/kit-5-cabos-iphone-usb.webp",
        categoria: "Celular e Proteção",
        descricao: "Kit com 5 cabos USB para iPhone."
    },

    {
        id: 2,
        nome: "Kit 5 Fones M10 Bluetooth",
        preco: 90.00,
        imagem: "imagens/kit-5-fones-m10-bluetooth.webp",
        categoria: "Áudio",
        descricao: "Kit com 5 fones M10 Bluetooth."
    },

    {
        id: 3,
        nome: "Extensão Filtro de Linha 5 Tomadas",
        preco: 50.00,
        imagem: "imagens/extensao-filtro-linha-5-tomadas.webp",
        categoria: "Energia",
        descricao: "Filtro de linha com 5 tomadas."
    },

    {
        id: 4,
        nome: "Kit 10 Películas iPhone XR até 14",
        preco: 30.00,
        imagem: "imagens/kit-10-peliculas-iphone-xr-14.webp",
        categoria: "Celular e Proteção",
        descricao: "Kit com 10 películas para iPhone XR até iPhone 14."
    },

    {
        id: 5,
        nome: "Power Bank 20.000mAh",
        preco: 89.90,
        imagem: "imagens/powerbank-20000.webp",
        categoria: "Energia",
        descricao: "Power Bank com capacidade de 20.000mAh."
    },

    {
        id: 6,
        nome: "Power Bank Pineng 10.000mAh",
        preco: 79.90,
        imagem: "imagens/pineng-10000.webp",
        categoria: "Energia",
        descricao: "Power Bank Pineng com capacidade de 10.000mAh."
    },

    {
        id: 7,
        nome: "Carregador Turbo USB-C",
        preco: 29.90,
        imagem: "imagens/carregador-turbo-usbc.webp",
        categoria: "Cabos e Carregadores",
        descricao: "Carregador Turbo com conexão USB-C."
    },

    {
        id: 8,
        nome: "Cabo USB-C 1 Metro",
        preco: 19.90,
        imagem: "imagens/cabo-usbc-1m.webp",
        categoria: "Cabos e Carregadores",
        descricao: "Cabo USB-C de 1 metro."
    },

    {
        id: 9,
        nome: "Fone Bluetooth TWS",
        preco: 39.90,
        imagem: "imagens/fone-tws.webp",
        categoria: "Áudio",
        descricao: "Fone de ouvido Bluetooth TWS."
    },

    {
        id: 10,
        nome: "Suporte de Celular para Carro",
        preco: 24.90,
        imagem: "imagens/suporte-celular-carro.webp",
        categoria: "Celular e Proteção",
        descricao: "Suporte para celular para uso no carro."
    },

    {
        id: 11,
        nome: "Mouse sem Fio",
        preco: 29.90,
        imagem: "imagens/mouse-sem-fio.webp",
        categoria: "Informática",
        descricao: "Mouse sem fio para computador e notebook."
    },

    {
        id: 12,
        nome: "Teclado USB",
        preco: 39.90,
        imagem: "imagens/teclado-usb.webp",
        categoria: "Informática",
        descricao: "Teclado USB para computador e notebook."
    },

    {
        id: 13,
        nome: "Caixa de Som Bluetooth",
        preco: 49.90,
        imagem: "imagens/caixa-som-bluetooth.webp",
        categoria: "Áudio",
        descricao: "Caixa de som Bluetooth portátil."
    },

    {
        id: 14,
        nome: "Hub USB 4 Portas",
        preco: 29.90,
        imagem: "imagens/hub-usb-4-portas.webp",
        categoria: "Informática",
        descricao: "Hub USB com 4 portas."
    },

    {
        id: 15,
        nome: "Carregador Veicular USB",
        preco: 24.90,
        imagem: "imagens/carregador-veicular-usb.webp",
        categoria: "Cabos e Carregadores",
        descricao: "Carregador USB para veículos."
    },

    {
        id: 16,
        nome: "Mousepad Gamer Grande",
        preco: 39.90,
        imagem: "imagens/mousepad-gamer-grande.webp",
        categoria: "Gamer",
        descricao: "Mousepad gamer grande para seu setup."
    },

    {
        id: 17,
        nome: "Kit 5 Cabos USB Tipo-C",
        preco: 40.00,
        imagem: "imagens/kit-5-cabos-usbc.webp",
        categoria: "Cabos e Carregadores",
        descricao: "Kit com 5 cabos USB Tipo-C."
    }

];

/* =========================================================
   SESSÕES
========================================================= */

const sessoesClientes = new Map();
const sessoesAdmin = new Map();

/* =========================================================
   FUNÇÕES DE COOKIE
========================================================= */

function obterCookie(req, nome) {

    const cookies = req.headers.cookie || "";

    const partes = cookies.split(";");

    for (const parte of partes) {

        const [chave, ...resto] =
            parte.trim().split("=");

        if (chave === nome) {

            return decodeURIComponent(
                resto.join("=")
            );
        }
    }

    return null;
}

function criarToken() {

    return crypto.randomBytes(32).toString("hex");
}

function definirCookie(res, nome, valor) {

    res.setHeader(
        "Set-Cookie",
        `${nome}=${encodeURIComponent(valor)}; HttpOnly; Path=/; SameSite=Lax`
    );
}

function apagarCookie(res, nome) {

    res.setHeader(
        "Set-Cookie",
        `${nome}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
    );
}

/* =========================================================
   SENHA
========================================================= */

function gerarHashSenha(senha) {

    const salt =
        crypto.randomBytes(16).toString("hex");

    const hash =
        crypto.scryptSync(
            senha,
            salt,
            64
        ).toString("hex");

    return `${salt}:${hash}`;
}

function verificarSenha(senha, senhaArmazenada) {

    try {

        const partes =
            senhaArmazenada.split(":");

        if (partes.length !== 2) {
            return false;
        }

        const salt = partes[0];
        const hash = partes[1];

        const hashAtual =
            crypto.scryptSync(
                senha,
                salt,
                64
            ).toString("hex");

        return crypto.timingSafeEqual(
            Buffer.from(hash, "hex"),
            Buffer.from(hashAtual, "hex")
        );

    } catch (erro) {

        return false;
    }
}

/* =========================================================
   MIDDLEWARE CLIENTE
========================================================= */

function exigirCliente(req, res, next) {

    const token =
        obterCookie(
            req,
            "techshop_cliente"
        );

    if (!token) {

        return res.status(401).json({
            erro: "Cliente não autenticado."
        });
    }

    const usuarioId =
        sessoesClientes.get(token);

    if (!usuarioId) {

        return res.status(401).json({
            erro: "Sessão expirada."
        });
    }

    const usuarios =
        lerJSON(
            usuariosFile,
            []
        );

    const usuario =
        usuarios.find(
            u => u.id === usuarioId
        );

    if (!usuario) {

        return res.status(401).json({
            erro: "Usuário não encontrado."
        });
    }

    req.usuario = usuario;

    next();
}

/* =========================================================
   MIDDLEWARE ADMIN
========================================================= */

function exigirAdmin(req, res, next) {

    const token =
        obterCookie(
            req,
            "techshop_admin"
        );

    if (!token) {

        return res.status(401).json({
            erro: "Administrador não autenticado."
        });
    }

    if (!sessoesAdmin.has(token)) {

        return res.status(401).json({
            erro: "Sessão administrativa expirada."
        });
    }

    next();
}

/* =========================================================
   PRODUTOS
========================================================= */

app.get(
    "/api/produtos",
    (req, res) => {

        res.json(produtos);

    }
);

/* =========================================================
   STATUS
========================================================= */

app.get(
    "/api/status",
    (req, res) => {

        res.json({
            online: true,
            servidor: "TECHSHOP",
            porta: PORT,
            produtos: produtos.length
        });

    }
);

/* =========================================================
   CADASTRO
========================================================= */

app.post(
    "/api/cliente/cadastro",
    (req, res) => {

        try {

            const {
                nome,
                email,
                telefone,
                cpf,
                senha
            } = req.body;

            if (
                !nome ||
                !email ||
                !senha
            ) {

                return res.status(400).json({
                    erro: "Preencha nome, e-mail e senha."
                });
            }

            const usuarios =
                lerJSON(
                    usuariosFile,
                    []
                );

            const emailNormalizado =
                String(email)
                    .trim()
                    .toLowerCase();

            const existe =
                usuarios.find(
                    u =>
                        u.email ===
                        emailNormalizado
                );

            if (existe) {

                return res.status(400).json({
                    erro: "Este e-mail já está cadastrado."
                });
            }

            const usuario = {

                id: crypto
                    .randomUUID(),

                nome:
                    String(nome).trim(),

                email:
                    emailNormalizado,

                telefone:
                    telefone || "",

                cpf:
                    cpf || "",

                senha:
                    gerarHashSenha(
                        String(senha)
                    ),

                criadoEm:
                    new Date().toISOString()

            };

            usuarios.push(usuario);

            salvarJSON(
                usuariosFile,
                usuarios
            );

            const token =
                criarToken();

            sessoesClientes.set(
                token,
                usuario.id
            );

            definirCookie(
                res,
                "techshop_cliente",
                token
            );

            res.json({

                sucesso: true,

                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    telefone: usuario.telefone,
                    cpf: usuario.cpf
                }

            });

        } catch (erro) {

            console.error(
                "Erro no cadastro:",
                erro
            );

            res.status(500).json({
                erro: "Erro ao criar conta."
            });
        }

    }
);

/* =========================================================
   LOGIN CLIENTE
========================================================= */

app.post(
    "/api/cliente/login",
    (req, res) => {

        try {

            const {
                email,
                senha
            } = req.body;

            const usuarios =
                lerJSON(
                    usuariosFile,
                    []
                );

            const usuario =
                usuarios.find(
                    u =>
                        u.email ===
                        String(email)
                            .trim()
                            .toLowerCase()
                );

            if (
                !usuario ||
                !verificarSenha(
                    String(senha || ""),
                    usuario.senha
                )
            ) {

                return res.status(401).json({
                    erro: "E-mail ou senha incorretos."
                });
            }

            const token =
                criarToken();

            sessoesClientes.set(
                token,
                usuario.id
            );

            definirCookie(
                res,
                "techshop_cliente",
                token
            );

            res.json({

                sucesso: true,

                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    telefone: usuario.telefone,
                    cpf: usuario.cpf
                }

            });

        } catch (erro) {

            console.error(
                "Erro no login:",
                erro
            );

            res.status(500).json({
                erro: "Erro ao fazer login."
            });
        }

    }
);

/* =========================================================
   ME
========================================================= */

app.get(
    "/api/cliente/me",
    exigirCliente,
    (req, res) => {

        res.json({

            autenticado: true,

            usuario: {
                id: req.usuario.id,
                nome: req.usuario.nome,
                email: req.usuario.email,
                telefone: req.usuario.telefone,
                cpf: req.usuario.cpf
            }

        });

    }
);

/* =========================================================
   LOGOUT CLIENTE
========================================================= */

app.post(
    "/api/cliente/logout",
    (req, res) => {

        const token =
            obterCookie(
                req,
                "techshop_cliente"
            );

        if (token) {
            sessoesClientes.delete(token);
        }

        apagarCookie(
            res,
            "techshop_cliente"
        );

        res.json({
            sucesso: true
        });

    }
);

/* =========================================================
   PERFIL
========================================================= */

app.get(
    "/api/cliente/perfil",
    exigirCliente,
    (req, res) => {

        res.json({
            usuario: {
                id: req.usuario.id,
                nome: req.usuario.nome,
                email: req.usuario.email,
                telefone: req.usuario.telefone,
                cpf: req.usuario.cpf
            }
        });

    }
);

/* =========================================================
   LOGIN ADMIN
========================================================= */

app.post(
    "/api/admin/login",
    (req, res) => {

        const {
            usuario,
            senha
        } = req.body;

        if (
            usuario !== ADMIN_USER ||
            senha !== ADMIN_PASSWORD
        ) {

            return res.status(401).json({
                erro: "Usuário ou senha administrativa incorretos."
            });
        }

        const token =
            criarToken();

        sessoesAdmin.set(
            token,
            true
        );

        definirCookie(
            res,
            "techshop_admin",
            token
        );

        res.json({
            sucesso: true
        });

    }
);

/* =========================================================
   ME ADMIN
========================================================= */

app.get(
    "/api/admin/me",
    exigirAdmin,
    (req, res) => {

        res.json({
            autenticado: true
        });

    }
);

/* =========================================================
   LOGOUT ADMIN
========================================================= */

app.post(
    "/api/admin/logout",
    (req, res) => {

        const token =
            obterCookie(
                req,
                "techshop_admin"
            );

        if (token) {
            sessoesAdmin.delete(token);
        }

        apagarCookie(
            res,
            "techshop_admin"
        );

        res.json({
            sucesso: true
        });

    }
);

/* =========================================================
   PEDIDOS ADMIN
========================================================= */

app.get(
    "/api/pedidos",
    exigirAdmin,
    (req, res) => {

        const pedidos =
            lerJSON(
                pedidosFile,
                []
            );

        res.json(pedidos);

    }
);

/* =========================================================
   BUSCAR PEDIDO ADMIN
========================================================= */

app.get(
    "/api/pedidos/:numero",
    exigirAdmin,
    (req, res) => {

        const pedidos =
            lerJSON(
                pedidosFile,
                []
            );

        const pedido =
            pedidos.find(
                p =>
                    p.numero ===
                    req.params.numero
            );

        if (!pedido) {

            return res.status(404).json({
                erro: "Pedido não encontrado."
            });
        }

        res.json(pedido);

    }
);

/* =========================================================
   STATUS DO PEDIDO ADMIN
========================================================= */

const statusPermitidos = [

    "Aguardando pagamento",
    "Pagamento aprovado",
    "Preparando pedido",
    "Enviado",
    "Em transporte",
    "Entregue",
    "Cancelado"

];

app.put(
    "/api/pedidos/:numero/status",
    exigirAdmin,
    (req, res) => {

        const {
            status
        } = req.body;

        if (
            !statusPermitidos.includes(
                status
            )
        ) {

            return res.status(400).json({
                erro: "Status inválido."
            });
        }

        const pedidos =
            lerJSON(
                pedidosFile,
                []
            );

        const indice =
            pedidos.findIndex(
                p =>
                    p.numero ===
                    req.params.numero
            );

        if (indice === -1) {

            return res.status(404).json({
                erro: "Pedido não encontrado."
            });
        }

        pedidos[indice].status =
            status;

        pedidos[indice].atualizadoEm =
            new Date().toISOString();

        salvarJSON(
            pedidosFile,
            pedidos
        );

        res.json({

            sucesso: true,

            pedido: pedidos[indice]

        });

    }
);

/* =========================================================
   EXCLUIR PEDIDO ADMIN
========================================================= */

app.delete(
    "/api/pedidos/:numero",
    exigirAdmin,
    (req, res) => {

        const pedidos =
            lerJSON(
                pedidosFile,
                []
            );

        const novosPedidos =
            pedidos.filter(
                p =>
                    p.numero !==
                    req.params.numero
            );

        if (
            novosPedidos.length ===
            pedidos.length
        ) {

            return res.status(404).json({
                erro: "Pedido não encontrado."
            });
        }

        salvarJSON(
            pedidosFile,
            novosPedidos
        );

        res.json({
            sucesso: true
        });

    }
);

/* =========================================================
   PEDIDOS DO CLIENTE
========================================================= */

app.get(
    "/api/cliente/pedidos",
    exigirCliente,
    (req, res) => {

        const pedidos =
            lerJSON(
                pedidosFile,
                []
            );

        const meusPedidos =
            pedidos.filter(
                p =>
                    p.usuarioId ===
                    req.usuario.id
            );

        res.json(
            meusPedidos
        );

    }
);

/* =========================================================
   PEDIDO DO CLIENTE
========================================================= */

app.get(
    "/api/cliente/pedidos/:numero",
    exigirCliente,
    (req, res) => {

        const pedidos =
            lerJSON(
                pedidosFile,
                []
            );

        const pedido =
            pedidos.find(
                p =>
                    p.numero ===
                        req.params.numero &&
                    p.usuarioId ===
                        req.usuario.id
            );

        if (!pedido) {

            return res.status(404).json({
                erro: "Pedido não encontrado."
            });
        }

        res.json(pedido);

    }
);

/* =========================================================
   STATUS PÚBLICO DO PEDIDO
========================================================= */

app.get(
    "/api/pedido/:numero/status",
    (req, res) => {

        const pedidos =
            lerJSON(
                pedidosFile,
                []
            );

        const pedido =
            pedidos.find(
                p =>
                    p.numero ===
                    req.params.numero
            );

        if (!pedido) {

            return res.status(404).json({
                erro: "Pedido não encontrado."
            });
        }

        res.json({

            numero:
                pedido.numero,

            status:
                pedido.status,

            atualizadoEm:
                pedido.atualizadoEm,

            criadoEm:
                pedido.criadoEm

        });

    }
);

/* =========================================================
   CANCELAR PEDIDO
========================================================= */

app.post(
    "/api/cliente/pedidos/:numero/cancelar",
    exigirCliente,
    (req, res) => {

        const pedidos =
            lerJSON(
                pedidosFile,
                []
            );

        const indice =
            pedidos.findIndex(
                p =>
                    p.numero ===
                        req.params.numero &&
                    p.usuarioId ===
                        req.usuario.id
            );

        if (indice === -1) {

            return res.status(404).json({
                erro: "Pedido não encontrado."
            });
        }

        const pedido =
            pedidos[indice];

        if (
            pedido.status !==
            "Aguardando pagamento"
        ) {

            return res.status(400).json({
                erro:
                    "Este pedido não pode mais ser cancelado."
            });
        }

        pedidos[indice].status =
            "Cancelado";

        pedidos[indice].atualizadoEm =
            new Date().toISOString();

        salvarJSON(
            pedidosFile,
            pedidos
        );

        res.json({

            sucesso: true,

            pedido:
                pedidos[indice]

        });

    }
);

/* =========================================================
   CALCULAR CARRINHO
========================================================= */

function calcularCarrinho(itens) {

    if (
        !Array.isArray(itens) ||
        itens.length === 0
    ) {

        throw new Error(
            "Carrinho vazio."
        );
    }

    const resultado = [];
    let total = 0;

    for (const item of itens) {

        const produto =
            produtos.find(
                p =>
                    Number(p.id) ===
                    Number(item.id)
            );

        if (!produto) {

            throw new Error(
                `Produto ${item.id} não encontrado.`
            );
        }

        const quantidade =
            Math.max(
                1,
                parseInt(
                    item.quantidade ||
                    item.qtd ||
                    1,
                    10
                )
            );

        const subtotal =
            Number(
                (
                    produto.preco *
                    quantidade
                ).toFixed(2)
            );

        total += subtotal;

        resultado.push({

            id:
                produto.id,

            nome:
                produto.nome,

            preco:
                produto.preco,

            quantidade,

            subtotal,

            imagem:
                produto.imagem

        });
    }

    return {

        produtos: resultado,

        total:
            Number(
                total.toFixed(2)
            )

    };
}

/* =========================================================
   GERAR NÚMERO PEDIDO
========================================================= */

function gerarNumeroPedido() {

    const agora =
        new Date();

    const parteData =
        agora
            .toISOString()
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                14
            );

    const aleatorio =
        crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase();

    return `TS${parteData}${aleatorio}`;

}

/* =========================================================
   MERCADO PAGO PIX
========================================================= */

app.post(
    "/api/pix",
    exigirCliente,
    async (req, res) => {

        try {

            if (!MP_ACCESS_TOKEN) {

                return res.status(500).json({

                    erro:
                        "Mercado Pago não configurado. Verifique o MP_ACCESS_TOKEN no arquivo .env."

                });
            }

            const {
                itens
            } = req.body;

            const carrinho =
                calcularCarrinho(
                    itens
                );

            const numero =
                gerarNumeroPedido();

            const email =
                req.usuario.email;

            const pagamentoResponse =
                await fetch(
                    "https://api.mercadopago.com/v1/payments",
                    {

                        method: "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${MP_ACCESS_TOKEN}`,

                            "Content-Type":
                                "application/json",

                            "X-Idempotency-Key":
                                crypto
                                    .randomUUID()

                        },

                        body:
                            JSON.stringify({

                                transaction_amount:
                                    carrinho.total,

                                description:
                                    `Pedido TECHSHOP ${numero}`,

                                payment_method_id:
                                    "pix",

                                payer: {
                                    email
                                },

                                external_reference:
                                    numero

                            })

                    }
                );

            const pagamento =
                await pagamentoResponse.json();

            if (
                !pagamentoResponse.ok
            ) {

                console.error(
                    "Erro Mercado Pago:",
                    pagamento
                );

                return res.status(500).json({

                    erro:
                        "Não foi possível gerar o Pix.",

                    detalhe:
                        pagamento

                });
            }

            const pedido = {

                numero,

                usuarioId:
                    req.usuario.id,

                cliente: {

                    id:
                        req.usuario.id,

                    nome:
                        req.usuario.nome,

                    email:
                        req.usuario.email,

                    telefone:
                        req.usuario.telefone,

                    cpf:
                        req.usuario.cpf

                },

                produtos:
                    carrinho.produtos,

                valorTotal:
                    carrinho.total,

                status:
                    "Aguardando pagamento",

                pagamento: {

                    id:
                        pagamento.id,

                    status:
                        pagamento.status,

                    metodo:
                        "pix",

                    qrCode:
                        pagamento.point_of_interaction
                            ?.transaction_data
                            ?.qr_code || "",

                    qrCodeBase64:
                        pagamento.point_of_interaction
                            ?.transaction_data
                            ?.qr_code_base64 || "",

                    ticketUrl:
                        pagamento.point_of_interaction
                            ?.transaction_data
                            ?.ticket_url || ""

                },

                criadoEm:
                    new Date().toISOString(),

                atualizadoEm:
                    new Date().toISOString()

            };

            const pedidos =
                lerJSON(
                    pedidosFile,
                    []
                );

            pedidos.push(
                pedido
            );

            salvarJSON(
                pedidosFile,
                pedidos
            );

            res.json({

                sucesso: true,

                numero,

                valor:
                    carrinho.total,

                pedido,

                paymentId:
                    pagamento.id,

                qr_code:
                    pedido.pagamento.qrCode,

                qr_code_base64:
                    pedido.pagamento.qrCodeBase64,

                ticket_url:
                    pedido.pagamento.ticketUrl,

                status:
                    pagamento.status

            });

        } catch (erro) {

            console.error(
                "Erro ao gerar Pix:",
                erro
            );

            res.status(500).json({

                erro:
                    erro.message ||
                    "Erro ao gerar pagamento Pix."

            });
        }

    }
);

/* =========================================================
   WEBHOOK MERCADO PAGO
========================================================= */

app.post(
    "/api/webhook/mercadopago",
    async (req, res) => {

        try {

            const pagamentoId =
                req.body?.data?.id ||
                req.query?.data_id ||
                req.body?.id;

            if (!pagamentoId) {

                return res.sendStatus(200);
            }

            if (!MP_ACCESS_TOKEN) {

                return res.sendStatus(200);
            }

            const resposta =
                await fetch(
                    `https://api.mercadopago.com/v1/payments/${pagamentoId}`,
                    {

                        headers: {

                            "Authorization":
                                `Bearer ${MP_ACCESS_TOKEN}`

                        }

                    }
                );

            const pagamento =
                await resposta.json();

            if (!resposta.ok) {

                console.error(
                    "Erro buscando pagamento:",
                    pagamento
                );

                return res.sendStatus(200);
            }

            const numero =
                pagamento.external_reference;

            if (!numero) {

                return res.sendStatus(200);
            }

            const pedidos =
                lerJSON(
                    pedidosFile,
                    []
                );

            const indice =
                pedidos.findIndex(
                    p =>
                        p.numero ===
                        numero
                );

            if (indice === -1) {

                return res.sendStatus(200);
            }

            pedidos[indice]
                .pagamento.status =
                pagamento.status;

            pedidos[indice]
                .pagamento.id =
                pagamento.id;

            if (
                pagamento.status ===
                "approved"
            ) {

                pedidos[indice].status =
                    "Pagamento aprovado";

            } else if (

                pagamento.status ===
                    "cancelled" ||

                pagamento.status ===
                    "rejected"

            ) {

                pedidos[indice].status =
                    "Cancelado";
            }

            pedidos[indice].atualizadoEm =
                new Date().toISOString();

            salvarJSON(
                pedidosFile,
                pedidos
            );

            res.sendStatus(200);

        } catch (erro) {

            console.error(
                "Erro webhook:",
                erro
            );

            res.sendStatus(200);
        }

    }
);

/* =========================================================
   IMAGENS
========================================================= */

// IMPORTANTE:
// D:\Teste\TECHSHOP
// D:\Teste\imagens
//
// O servidor disponibiliza:
// http://localhost:3000/imagens/nome-da-imagem.webp

app.use(
    "/imagens",
    express.static(
        pastaImagens
    )
);

/* =========================================================
   ARQUIVOS DO TECHSHOP
========================================================= */

app.use(
    express.static(
        pastaTechshop,
        {
            index: false
        }
    )
);

/* =========================================================
   PÁGINA PRINCIPAL
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                pastaTechshop,
                "techshop.html"
            )
        );

    }
);

/* =========================================================
   ADMIN
========================================================= */

app.get(
    "/admin",
    (req, res) => {

        res.sendFile(
            path.join(
                pastaTechshop,
                "admin.html"
            )
        );

    }
);

app.get(
    "/admin.html",
    (req, res) => {

        res.sendFile(
            path.join(
                pastaTechshop,
                "admin.html"
            )
        );

    }
);

/* =========================================================
   404 API
========================================================= */

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            erro:
                "Rota da API não encontrada."

        });

    }
);

/* =========================================================
   ERRO GERAL
========================================================= */

app.use(
    (erro, req, res, next) => {

        console.error(
            "Erro geral:",
            erro
        );

        if (res.headersSent) {
            return next(erro);
        }

        res.status(500).json({

            erro:
                "Erro interno do servidor."

        });

    }
);

/* =========================================================
   NETLIFY FUNCTION
========================================================= */

exports.handler = serverless(app);
