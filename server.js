const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Carrega o .env antes de ler as variáveis.
dotenv.config();

// Netlify executa o Express como Function. Localmente, `node server.js` continua funcionando.
const IS_NETLIFY =
    process.env.NETLIFY === "true" ||
    process.env.NETLIFY === "1" ||
    Boolean(process.env.NETLIFY_FUNCTIONS_VERSION) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================================
   CAMINHOS
========================================================= */

const pastaTechshop = __dirname;

const pastaImagensLocal = path.join(__dirname, "imagens");
const pastaImagensPai = path.join(__dirname, "..", "imagens");
const pastaImagens = fs.existsSync(pastaImagensLocal)
    ? pastaImagensLocal
    : pastaImagensPai;

const pedidosFile = path.join(pastaTechshop, "pedidos.json");
const usuariosFile = path.join(pastaTechshop, "usuarios.json");

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456";
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const WHATSAPP_TO = (process.env.WHATSAPP_TO || "5519971544914").replace(/\D/g, "");
const WHATSAPP_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v21.0";

const SESSION_SECRET =
    process.env.SESSION_SECRET ||
    (IS_NETLIFY
        ? (process.env.ADMIN_PASSWORD || "techshop-netlify-admin-secret")
        : "techshop-local-session-secret");

const USUARIOS_KEY = "usuarios";
const PEDIDOS_KEY = "pedidos";

let netlifyStore = null;
let dadosNetlifyPromise = null;
let usuariosCache = null;
let pedidosCache = null;

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

/* =========================================================
   ARMAZENAMENTO
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

function lerJSONLocal(arquivo, valorInicial) {

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

async function prepararContextoBlobs() {

    const encoded = String(
        process.env.NETLIFY_BLOBS_CONTEXT || ""
    ).trim();

    if (!encoded) {
        return false;
    }

    try {

        const contexto = JSON.parse(
            Buffer
                .from(encoded, "base64")
                .toString("utf8")
        );

        if (!contexto || !contexto.siteID || !contexto.token) {
            return false;
        }

        const { setEnvironmentContext } =
            await import("@netlify/blobs");

        setEnvironmentContext(contexto);

        return true;

    } catch (erro) {

        console.error(
            "Não foi possível preparar o contexto do Netlify Blobs:",
            erro?.message || erro
        );

        return false;
    }
}

async function obterNetlifyStore() {

    await prepararContextoBlobs();

    const { getStore } =
        await import("@netlify/blobs");

    // Em Netlify Functions com serverless-http (Lambda compatibility),
    // o contexto é inicializado em netlify/functions/api.js com connectLambda(event).
    // Mantemos suporte opcional a credenciais explícitas via variáveis de ambiente.
    const siteID = String(process.env.NETLIFY_SITE_ID || "").trim();
    const token = String(process.env.NETLIFY_AUTH_TOKEN || "").trim();

    if (siteID && token) {
        return getStore("techshop-data", {
            consistency: "strong",
            siteID,
            token
        });
    }

    return getStore("techshop-data", {
        consistency: "strong"
    });
}

async function carregarDadosNetlify(forcar = false) {

    if (!IS_NETLIFY) {
        return;
    }

    if (!dadosNetlifyPromise || forcar) {

        dadosNetlifyPromise = (async () => {

            const store =
                await obterNetlifyStore();

            let usuarios =
                await store.get(
                    USUARIOS_KEY,
                    { type: "json" }
                );

            let pedidos =
                await store.get(
                    PEDIDOS_KEY,
                    { type: "json" }
                );

            if (!Array.isArray(usuarios)) {

                usuarios =
                    lerJSONLocal(
                        usuariosFile,
                        []
                    );

                await store.setJSON(
                    USUARIOS_KEY,
                    usuarios
                );
            }

            if (!Array.isArray(pedidos)) {

                pedidos =
                    lerJSONLocal(
                        pedidosFile,
                        []
                    );

                await store.setJSON(
                    PEDIDOS_KEY,
                    pedidos
                );
            }

            usuariosCache = usuarios;
            pedidosCache = pedidos;

        })();
    }

    await dadosNetlifyPromise;
}

function lerJSON(arquivo, valorInicial) {

    if (IS_NETLIFY) {

        if (arquivo === usuariosFile) {
            return usuariosCache || valorInicial;
        }

        if (arquivo === pedidosFile) {
            return pedidosCache || valorInicial;
        }
    }

    return lerJSONLocal(
        arquivo,
        valorInicial
    );
}

async function salvarJSON(arquivo, dados) {

    if (IS_NETLIFY) {

        const store =
            await obterNetlifyStore();

        if (arquivo === usuariosFile) {
            usuariosCache = dados;
            await store.setJSON(
                USUARIOS_KEY,
                dados
            );
            return;
        }

        if (arquivo === pedidosFile) {
            pedidosCache = dados;
            await store.setJSON(
                PEDIDOS_KEY,
                dados
            );
            return;
        }
    }

    fs.writeFileSync(
        arquivo,
        JSON.stringify(dados, null, 2),
        "utf8"
    );
}

if (!IS_NETLIFY) {

    garantirArquivo(pedidosFile, []);
    garantirArquivo(usuariosFile, []);
}

app.use(
    async (req, res, next) => {

        if (!IS_NETLIFY) {
            return next();
        }

        // Rotas públicas/sem leitura de dados persistidos não precisam abrir o Blobs Store.
        // Isso evita que uma falha transitória do armazenamento bloqueie a própria tela de login.
        const rotasSemBlobs = new Set([
            "/api/status",
            "/api/produtos",
            "/api/cliente/me",
            "/api/cliente/logout"
        ]);

        if (rotasSemBlobs.has(req.path)) {
            return next();
        }

        try {
            await carregarDadosNetlify(false);
            next();
        } catch (erro) {
            console.error(
                "Erro carregando dados do Netlify:",
                erro?.stack || erro
            );
            res.status(500).json({
                erro: "Não foi possível carregar os dados da loja.",
                detalhe: erro?.message || "Falha ao acessar o armazenamento da loja."
            });
        }
    }
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

function criarToken(tipo, id = "") {

    if (!SESSION_SECRET) {
        throw new Error(
            "SESSION_SECRET não configurado."
        );
    }

    const payload =
        `${tipo}|${id}|${Date.now()}`;

    const corpo = Buffer
        .from(payload, "utf8")
        .toString("base64url");

    const assinatura = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(corpo)
        .digest("base64url");

    return `${corpo}.${assinatura}`;
}

function verificarToken(token, tipoEsperado) {

    try {

        if (!SESSION_SECRET || !token) {
            return null;
        }

        const partes =
            String(token).split(".");

        if (partes.length !== 2) {
            return null;
        }

        const [corpo, assinatura] = partes;

        const assinaturaAtual = crypto
            .createHmac("sha256", SESSION_SECRET)
            .update(corpo)
            .digest("base64url");

        const a = Buffer.from(assinatura);
        const b = Buffer.from(assinaturaAtual);

        if (
            a.length !== b.length ||
            !crypto.timingSafeEqual(a, b)
        ) {
            return null;
        }

        const payload = Buffer
            .from(corpo, "base64url")
            .toString("utf8");

        const [tipo, id, timestampTexto] =
            payload.split("|");

        if (tipo !== tipoEsperado) {
            return null;
        }

        const timestamp = Number(timestampTexto);
        const seteDias =
            7 * 24 * 60 * 60 * 1000;

        if (
            !Number.isFinite(timestamp) ||
            Date.now() - timestamp > seteDias
        ) {
            return null;
        }

        return { tipo, id, timestamp };

    } catch (erro) {
        return null;
    }
}

function definirCookie(res, nome, valor) {

    const secure =
        IS_NETLIFY ? " Secure;" : "";

    res.setHeader(
        "Set-Cookie",
        `${nome}=${encodeURIComponent(valor)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800;${secure}`
    );
}

function apagarCookie(res, nome) {

    const secure =
        IS_NETLIFY ? " Secure;" : "";

    res.setHeader(
        "Set-Cookie",
        `${nome}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax;${secure}`
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

    const token = obterCookie(
        req,
        "techshop_cliente"
    );

    if (!token) {
        return res.status(401).json({
            erro: "Cliente não autenticado."
        });
    }

    const sessao = verificarToken(
        token,
        "cliente"
    );

    if (!sessao?.id) {
        return res.status(401).json({
            erro: "Sessão expirada."
        });
    }

    const usuarios = lerJSON(
        usuariosFile,
        []
    );

    const usuario = usuarios.find(
        u => u.id === sessao.id
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

    const cookieToken = obterCookie(req, "techshop_admin");
    const authHeader = String(req.headers.authorization || "");
    const bearerToken = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : "";

    const token = bearerToken || cookieToken;

    if (!token) {
        return res.status(401).json({
            erro: "Administrador não autenticado."
        });
    }

    const sessao = verificarToken(token, "admin");

    if (!sessao) {
        return res.status(401).json({
            erro: "Sessão administrativa expirada."
        });
    }

    req.admin = sessao;
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
            porta: IS_NETLIFY ? "serverless" : PORT,
            produtos: produtos.length
        });

    }
);

/* =========================================================
   CADASTRO
========================================================= */

app.post(
    "/api/cliente/cadastro",
    async (req, res) => {

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

            await salvarJSON(
                usuariosFile,
                usuarios
            );

            const token =
                criarToken("cliente", usuario.id);

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
                criarToken("cliente", usuario.id);

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
            criarToken("admin", "admin");

        definirCookie(
            res,
            "techshop_admin",
            token
        );

        res.json({
            sucesso: true,
            token,
            usuario: ADMIN_USER
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
    async (req, res) => {

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

function registrarHistoricoStatus(pedido, novoStatus, quando = new Date().toISOString()) {

    if (!pedido || !novoStatus) return;

    if (!Array.isArray(pedido.historicoStatus)) {
        pedido.historicoStatus = [];
    }

    const ultimo = pedido.historicoStatus[pedido.historicoStatus.length - 1];

    if (!ultimo || ultimo.status !== novoStatus) {
        pedido.historicoStatus.push({
            status: novoStatus,
            em: quando
        });
    } else {
        ultimo.em = quando;
    }

    pedido.status = novoStatus;
    pedido.atualizadoEm = quando;
}

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
    async (req, res) => {

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

        registrarHistoricoStatus(
            pedidos[indice],
            status
        );

        await salvarJSON(
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
    async (req, res) => {

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

        await salvarJSON(
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

        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

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
                pedido.criadoEm,

            historicoStatus:
                Array.isArray(pedido.historicoStatus)
                    ? pedido.historicoStatus
                    : [
                        {
                            status: pedido.status || "Aguardando pagamento",
                            em: pedido.atualizadoEm || pedido.criadoEm
                        }
                    ]

        });

    }
);

/* =========================================================
   CANCELAR PEDIDO
========================================================= */

app.post(
    "/api/cliente/pedidos/:numero/cancelar",
    exigirCliente,
    async (req, res) => {

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

        registrarHistoricoStatus(
            pedidos[indice],
            "Cancelado"
        );

        await salvarJSON(
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
   WHATSAPP - NOTIFICAÇÃO DE PEDIDO
========================================================= */

async function enviarWhatsAppTexto(texto) {

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_TO) {
        return {
            enviado: false,
            configurado: false,
            motivo: "WhatsApp Cloud API não configurada."
        };
    }

    const url =
        `https://graph.facebook.com/${WHATSAPP_GRAPH_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const resposta = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: WHATSAPP_TO,
            type: "text",
            text: {
                preview_url: false,
                body: texto
            }
        })
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        const erro =
            dados?.error?.message ||
            dados?.erro ||
            "WhatsApp API recusou o envio.";

        throw new Error(erro);
    }

    return {
        enviado: true,
        configurado: true,
        id: dados?.messages?.[0]?.id || ""
    };
}

function formatarPedidoWhatsApp(pedido, tipo = "novo") {

    const cliente = pedido.cliente || {};
    const entrega = pedido.entrega || {};
    const linhas = Array.isArray(pedido.produtos) ? pedido.produtos : [];

    const titulo =
        tipo === "pago"
            ? "✅ PAGAMENTO APROVADO - TECHSHOP"
            : "🛒 NOVO PEDIDO - TECHSHOP";

    const listaProdutos = linhas.map(item => {
        const subtotal = Number(item.subtotal ?? (Number(item.preco) * Number(item.quantidade))); 
        return `• ${item.nome} | ${item.quantidade}x | ${formatarBRL(subtotal)}`;
    }).join("\\n");

    const endereco = [
        entrega.endereco,
        entrega.numero,
        entrega.cidade,
        entrega.estado,
        entrega.cep
    ].filter(Boolean).join(", ");

    return [
        titulo,
        "",
        `📦 Pedido: ${pedido.numero}`,
        `👤 Cliente: ${cliente.nome || "Não informado"}`,
        `📧 E-mail: ${cliente.email || "Não informado"}`,
        `📱 Telefone: ${entrega.telefone || cliente.telefone || "Não informado"}`,
        endereco ? `📍 Entrega: ${endereco}` : "📍 Entrega: não informada",
        "",
        "🧾 Produtos:",
        listaProdutos || "• Nenhum item",
        "",
        `💰 Total: ${formatarBRL(pedido.valorTotal)}`,
        `💳 Status: ${pedido.status}`
    ].join("\\n");
}

function formatarBRL(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

async function notificarNovoPedidoWhatsApp(pedido) {

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_TO) {
        return;
    }

    try {
        const resultado = await enviarWhatsAppTexto(
            formatarPedidoWhatsApp(pedido, "novo")
        );

        pedido.whatsapp = {
            ...(pedido.whatsapp || {}),
            novoPedidoEnviado: Boolean(resultado.enviado),
            novoPedidoEm: resultado.enviado ? new Date().toISOString() : ""
        };
    } catch (erro) {
        console.error("Erro ao notificar novo pedido via WhatsApp:", erro.message);
        pedido.whatsapp = {
            ...(pedido.whatsapp || {}),
            novoPedidoEnviado: false,
            erro: erro.message
        };
    }
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

            const itens = req.body?.itens || req.body?.produtos || [];
            const entrega = req.body?.entrega || {};

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
                                    email,
                                    ...(req.usuario.cpf ? {
                                        identification: {
                                            type: "CPF",
                                            number: String(req.usuario.cpf).replace(/\D/g, "")
                                        }
                                    } : {})
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

                entrega: {
                    telefone: String(entrega.telefone || req.usuario.telefone || "").trim(),
                    cep: String(entrega.cep || "").trim(),
                    endereco: String(entrega.endereco || "").trim(),
                    numero: String(entrega.numero || "").trim(),
                    cidade: String(entrega.cidade || "").trim(),
                    estado: String(entrega.estado || "").trim().toUpperCase()
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
                    new Date().toISOString(),

                historicoStatus: [
                    {
                        status: "Aguardando pagamento",
                        em: new Date().toISOString()
                    }
                ]

            };

            const pedidos =
                lerJSON(
                    pedidosFile,
                    []
                );

            pedidos.push(
                pedido
            );

            await salvarJSON(
                pedidosFile,
                pedidos
            );

            // A notificação não bloqueia a criação do Pix.
            if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_TO) {
                notificarNovoPedidoWhatsApp(pedido)
                    .then(async () => {
                        try {
                            const atualizados = lerJSON(pedidosFile, []);
                            const pos = atualizados.findIndex(p => p.numero === pedido.numero);
                            if (pos !== -1) {
                                atualizados[pos].whatsapp = pedido.whatsapp || {};
                                await salvarJSON(pedidosFile, atualizados);
                            }
                        } catch (erro) {
                            console.error("Erro salvando status da notificação WhatsApp:", erro.message);
                        }
                    })
                    .catch(erro => console.error("Erro WhatsApp:", erro.message));
            }

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

                registrarHistoricoStatus(
                    pedidos[indice],
                    "Pagamento aprovado"
                );

                if (
                    WHATSAPP_ACCESS_TOKEN &&
                    WHATSAPP_PHONE_NUMBER_ID &&
                    WHATSAPP_TO &&
                    !pedidos[indice].whatsapp?.pagamentoAprovadoEnviado
                ) {
                    try {
                        await enviarWhatsAppTexto(
                            formatarPedidoWhatsApp(pedidos[indice], "pago")
                        );

                        pedidos[indice].whatsapp = {
                            ...(pedidos[indice].whatsapp || {}),
                            pagamentoAprovadoEnviado: true,
                            pagamentoAprovadoEm: new Date().toISOString()
                        };
                    } catch (erro) {
                        console.error("Erro ao notificar pagamento aprovado:", erro.message);
                    }
                }

            } else if (

                pagamento.status ===
                    "cancelled" ||

                pagamento.status ===
                    "rejected"

            ) {

                registrarHistoricoStatus(
                    pedidos[indice],
                    "Cancelado"
                );
            }

            pedidos[indice].atualizadoEm =
                pedidos[indice].atualizadoEm || new Date().toISOString();

            await salvarJSON(
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

if (!IS_NETLIFY) {

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


}

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
   INICIAR SERVIDOR
========================================================= */

if (require.main === module) {

    app.listen(
        PORT,
        () => {

            console.log("");
            console.log("========================================");
            console.log("       TECHSHOP ONLINE");
            console.log("========================================");
            console.log(`Servidor: http://localhost:${PORT}`);
            console.log(`Imagens: ${pastaImagens}`);
            console.log(`Produtos: ${produtos.length}`);
            console.log("========================================");
            console.log("");

        }
    );
}

module.exports = app;
