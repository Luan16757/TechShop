/* =========================================================
   TECHSHOP - SCRIPT PRINCIPAL
   ========================================================= */

let produtos = [];
let carrinho = [];
let clienteAtual = null;
let cartToastTimer = null;

const FRETE_RECOMPRA = 5;
const FRETE_RAPIDO_EXTRA = 10;

let checkoutFrete = {
    primeiraCompra: false,
    verificado: false,
    tipo: "normal",
    valor: 0
};

/* =========================================================
   ELEMENTOS
   ========================================================= */

const authScreen = document.getElementById("authScreen");
const siteContent = document.getElementById("siteContent");
const productsContainer = document.getElementById("products");
const loginForm = document.getElementById("loginForm");
const cadastroForm = document.getElementById("cadastroForm");
const loginMessage = document.getElementById("loginMessage");
const cadastroMessage = document.getElementById("cadastroMessage");

/* =========================================================
   FORMATAÇÃO
   ========================================================= */

function dinheiro(valor) {
    const numero = Number(valor) || 0;
    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function escaparHTML(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escaparAtributo(valor = "") {
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function normalizarTexto(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function obterIdProduto(produto, indiceFallback = 0) {
    const valor =
        produto?.id ??
        produto?._id ??
        produto?.codigo ??
        produto?.slug;

    if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
        return String(valor);
    }

    const nome = normalizarTexto(
        produto?.nome ||
        produto?.name ||
        ""
    );

    if (nome) {
        return `nome:${nome}`;
    }

    return `produto-${indiceFallback}`;
}

function formatarCPF(valor = "") {
    const numeros = String(valor).replace(/\D/g, "").slice(0, 11);

    return numeros
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/* =========================================================
   IMAGENS DOS PRODUTOS
   ========================================================= */

const DESCRICOES_PRODUTOS = {
    "kit 5 cabos iphone usb": "Kit com 5 cabos USB para iPhone, ideal para uso diário, carregamento e reposição.",
    "kit 10 peliculas iphone xr ate 14": "Kit com 10 películas para iPhone XR até iPhone 14, ajudando a proteger a tela contra riscos e pequenos impactos.",
    "suporte de celular para carro": "Suporte prático para fixar o celular no carro com mais segurança e facilitar a visualização durante o trajeto.",
    "kit 5 cabos usb tipo-c": "Kit com 5 cabos USB Tipo-C para carregamento e transferência de dados em aparelhos compatíveis.",
    "kit 5 cabos usb tipo c": "Kit com 5 cabos USB Tipo-C para carregamento e transferência de dados em aparelhos compatíveis.",
    "carregador turbo usb-c": "Carregador turbo com conexão USB-C para carregamento rápido de aparelhos compatíveis.",
    "carregador turbo usb c": "Carregador turbo com conexão USB-C para carregamento rápido de aparelhos compatíveis.",
    "cabo usb-c 1 metro": "Cabo USB-C de 1 metro para carregar dispositivos e realizar transferência de dados com praticidade.",
    "cabo usb c 1 metro": "Cabo USB-C de 1 metro para carregar dispositivos e realizar transferência de dados com praticidade.",
    "carregador veicular usb": "Carregador veicular USB para manter seus dispositivos carregados enquanto você está no carro.",
    "kit 5 fones m10 bluetooth": "Kit com 5 fones M10 Bluetooth, opção prática para música, chamadas e uso no dia a dia.",
    "fone bluetooth tws": "Fone Bluetooth TWS sem fio, compacto e prático para ouvir música e atender chamadas.",
    "caixa de som bluetooth": "Caixa de som Bluetooth portátil para reproduzir suas músicas com praticidade em diferentes ambientes.",
    "extensao filtro de linha 5 tomadas": "Extensão com filtro de linha e 5 tomadas para organizar e conectar vários equipamentos com mais praticidade.",
    "power bank 20.000mah": "Power Bank de 20.000mAh para recarregar celulares e outros dispositivos quando você estiver longe da tomada.",
    "power bank 20000mah": "Power Bank de 20.000mAh para recarregar celulares e outros dispositivos quando você estiver longe da tomada.",
    "power bank pineng 10.000mah": "Power Bank Pineng de 10.000mAh para levar energia extra para seu celular no dia a dia.",
    "power bank pineng 10000mah": "Power Bank Pineng de 10.000mAh para levar energia extra para seu celular no dia a dia.",
    "mouse sem fio": "Mouse sem fio compacto para computador e notebook, com liberdade de movimento e menos cabos na mesa.",
    "teclado usb": "Teclado USB para computador e notebook, ideal para estudos, trabalho e uso cotidiano.",
    "hub usb 4 portas": "Hub USB com 4 portas para ampliar as conexões do seu computador ou notebook.",
    "mousepad gamer grande": "Mousepad gamer grande para mais espaço de movimentação e melhor apoio do mouse durante os jogos.",
    "tela para iphone 11 a2111 a2221 a2223 display touch incell": "Tela de reposição para iPhone 11 com módulo Display LCD + Touch e tecnologia Incell, compatível com A2111, A2221 e A2223. Indicada para recuperar a imagem e o funcionamento do toque em aparelhos com tela quebrada, sem imagem ou com falhas de touch. Recomenda-se testar imagem e touch antes da instalação e fazer a montagem com técnico especializado.",
    "tela iphone 11 a2111 a2221 a2223 display touch incell": "Tela de reposição para iPhone 11 com módulo Display LCD + Touch e tecnologia Incell, compatível com A2111, A2221 e A2223. Indicada para recuperar a imagem e o funcionamento do toque em aparelhos com tela quebrada, sem imagem ou com falhas de touch. Recomenda-se testar imagem e touch antes da instalação e fazer a montagem com técnico especializado.",
    "flex bateria iphone 11 3110mah wefix oficial": "Bateria Wefix para iPhone 11 com capacidade de 3110mAh, indicada para reposição da bateria do aparelho e recuperação da autonomia. Compatível com iPhone 11 nos modelos A2111, A2221 e A2223. Recomenda-se instalação por técnico especializado.",
};

function obterDescricaoProduto(produto) {
    const descricaoBackend =
        produto?.descricao ||
        produto?.description ||
        produto?.descricaoCurta ||
        produto?.shortDescription ||
        produto?.detalhes ||
        "";

    if (String(descricaoBackend).trim()) {
        return String(descricaoBackend).trim();
    }

    const nomeOriginal = String(produto?.nome || produto?.name || "Produto TechShop").trim();
    const nome = normalizarTexto(nomeOriginal);

    if (DESCRICOES_PRODUTOS[nome]) {
        return DESCRICOES_PRODUTOS[nome];
    }

    const categoria = String(produto?.categoria || produto?.category || "Tecnologia").trim();
    return `${nomeOriginal}: produto da categoria ${categoria}, selecionado para oferecer praticidade no dia a dia. Confira as especificacoes do anuncio antes da compra.`;
}

function obterImagemProduto(produto) {
    const imagens = {
        "kit 5 cabos iphone usb": "/imagens/kit-5-cabos-iphone-usb.webp",
        "kit 10 peliculas iphone xr ate 14": "/imagens/kit-10-peliculas-iphone-xr-14.webp",
        "suporte de celular para carro": "/imagens/suporte-celular-carro.webp",
        "kit 5 cabos usb tipo-c": "/imagens/kit-5-cabos-usbc.webp",
        "kit 5 cabos usb tipo c": "/imagens/kit-5-cabos-usbc.webp",
        "carregador turbo usb-c": "/imagens/carregador-turbo-usbc.webp",
        "carregador turbo usb c": "/imagens/carregador-turbo-usbc.webp",
        "cabo usb-c 1 metro": "/imagens/cabo-usbc-1m.webp",
        "cabo usb c 1 metro": "/imagens/cabo-usbc-1m.webp",
        "carregador veicular usb": "/imagens/carregador-veicular-usb.webp",
        "kit 5 fones m10 bluetooth": "/imagens/kit-5-fones-m10-bluetooth.webp",
        "fone bluetooth tws": "/imagens/fone-tws.webp",
        "caixa de som bluetooth": "/imagens/caixa-som-bluetooth.webp",
        "extensao filtro de linha 5 tomadas": "/imagens/extensao-filtro-linha-5-tomadas.webp",
        "power bank 20.000mah": "/imagens/powerbank-20000.webp",
        "power bank 20000mah": "/imagens/powerbank-20000.webp",
        "power bank pineng 10.000mah": "/imagens/pineng-10000.webp",
        "power bank pineng 10000mah": "/imagens/pineng-10000.webp",
        "mouse sem fio": "/imagens/mouse-sem-fio.webp",
        "teclado usb": "/imagens/teclado-usb.webp",
        "hub usb 4 portas": "/imagens/hub-usb-4-portas.webp",
        "mousepad gamer grande": "/imagens/mousepad-gamer-grande.webp",

        "tela para iphone 11 a2111 a2221 a2223 display touch incell":
            "https://media.cdn.kaufland.de/product-images/original/1879a2e27a881e45fd48104d8b1bc341.jpg",

        "tela iphone 11 a2111 a2221 a2223 display touch incell":
            "https://media.cdn.kaufland.de/product-images/original/1879a2e27a881e45fd48104d8b1bc341.jpg",

        "flex bateria iphone 11 3110mah wefix oficial":
            "https://http2.mlstatic.com/D_Q_NP_605979-MLB116841807748_092026-R-flex-bateria-iphone-11-3110mah-wefix-oficial-garantia-1-ano.webp"
    };

    const nome = normalizarTexto(
        produto?.nome ||
        produto?.name ||
        ""
    );

    if (imagens[nome]) {
        return imagens[nome];
    }

    let imagem =
        produto?.imagem ||
        produto?.image ||
        produto?.imagemUrl ||
        produto?.imageUrl ||
        "";

    if (!imagem) return "";

    imagem = String(imagem).trim();

    if (
        imagem.startsWith("http://") ||
        imagem.startsWith("https://") ||
        imagem.startsWith("data:")
    ) {
        return imagem;
    }

    if (imagem.startsWith("/")) {
        return imagem;
    }

    imagem = imagem
        .replace(/\\/g, "/")
        .split("/")
        .pop();

    return "/imagens/" + imagem;
}

function imagemFallback(img) {
    if (!img) return;

    img.onerror = null;

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="500"
             height="500"
             viewBox="0 0 500 500">
            <rect width="500" height="500" fill="#111111"/>
            <text x="250" y="225"
                  text-anchor="middle"
                  fill="#ff7300"
                  font-size="42"
                  font-family="Arial"
                  font-weight="bold">TECHSHOP</text>
            <text x="250" y="275"
                  text-anchor="middle"
                  fill="#777777"
                  font-size="20"
                  font-family="Arial">Imagem indisponível</text>
        </svg>
    `;

    img.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

/* =========================================================
   LOGIN / LOJA
   ========================================================= */

function liberarLoja() {
    if (authScreen) authScreen.style.display = "none";

    if (siteContent) {
        siteContent.style.display = "block";
        siteContent.classList.add("active");
    }

    document.body.classList.remove("site-bloqueado");
}

function bloquearLoja() {
    if (authScreen) authScreen.style.display = "flex";

    if (siteContent) {
        siteContent.style.display = "none";
        siteContent.classList.remove("active");
    }

    document.body.classList.add("site-bloqueado");
}

function mostrarMensagem(elemento, mensagem, sucesso = false) {
    if (!elemento) return;

    elemento.textContent = mensagem;
    elemento.style.display = "block";
    elemento.style.color = sucesso ? "#22c55e" : "#ff5555";
}

async function verificarCliente() {
    try {
        const resposta = await fetch("/api/cliente/me", {
            credentials: "include",
            cache: "no-store"
        });

        if (!resposta.ok) {
            bloquearLoja();
            return;
        }

        const dados = await resposta.json();

        if (dados.autenticado || dados.logado) {
            clienteAtual = dados.usuario || dados.cliente || null;

            liberarLoja();
            atualizarInterfaceCliente();
            await carregarProdutos();
        } else {
            clienteAtual = null;
            bloquearLoja();
        }
    } catch (erro) {
        console.error("Erro ao verificar cliente:", erro);
        bloquearLoja();
    }
}

function mostrarLogin() {
    const login = document.getElementById("loginForm");
    const cadastro = document.getElementById("cadastroForm");
    const tabLogin = document.getElementById("tabLogin");
    const tabCadastro = document.getElementById("tabCadastro");

    login?.classList.add("active");
    cadastro?.classList.remove("active");
    tabLogin?.classList.add("active");
    tabCadastro?.classList.remove("active");
}

function mostrarCadastro() {
    const login = document.getElementById("loginForm");
    const cadastro = document.getElementById("cadastroForm");
    const tabLogin = document.getElementById("tabLogin");
    const tabCadastro = document.getElementById("tabCadastro");

    login?.classList.remove("active");
    cadastro?.classList.add("active");
    tabLogin?.classList.remove("active");
    tabCadastro?.classList.add("active");

    const msg = document.getElementById("cadastroMessage");
    if (msg) {
        msg.textContent = "";
        msg.style.display = "none";
    }
}

window.criarConta = fazerCadastro;
window.fazerCadastro = fazerCadastro;

/* =========================================================
   LOGIN
   ========================================================= */

async function fazerLogin(event) {
    event?.preventDefault();

    const email = document.getElementById("loginEmail")?.value.trim();
    const senha = document.getElementById("loginSenha")?.value || "";

    if (!email || !senha) {
        mostrarMensagem(loginMessage, "Preencha e-mail e senha.");
        return;
    }

    const botao = document.getElementById("loginButton");

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Entrando...";
    }

    try {
        const resposta = await fetch("/api/cliente/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            mostrarMensagem(
                loginMessage,
                dados.erro || dados.mensagem || "E-mail ou senha incorretos."
            );
            return;
        }

        clienteAtual = dados.usuario || dados.cliente || null;

        mostrarMensagem(
            loginMessage,
            "Login realizado com sucesso!",
            true
        );

        liberarLoja();
        atualizarInterfaceCliente();
        await carregarProdutos();
    } catch (erro) {
        console.error(erro);
        mostrarMensagem(
            loginMessage,
            "Erro ao conectar com o servidor."
        );
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = "Entrar";
        }
    }
}

/* =========================================================
   CADASTRO
   ========================================================= */

async function fazerCadastro(event) {
    event?.preventDefault();

    const nome = document.getElementById("cadastroNome")?.value.trim();
    const email = document.getElementById("cadastroEmail")?.value.trim();
    const telefone = document.getElementById("cadastroTelefone")?.value.trim();
    const cpf = document.getElementById("cadastroCpf")?.value.trim();
    const senha = document.getElementById("cadastroSenha")?.value || "";

    if (!nome || !email || !telefone || !cpf || !senha) {
        mostrarMensagem(cadastroMessage, "Preencha todos os campos.");
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem(
            cadastroMessage,
            "A senha precisa ter pelo menos 6 caracteres."
        );
        return;
    }

    const botao = document.getElementById("cadastroButton");

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Criando conta...";
    }

    try {
        const resposta = await fetch("/api/cliente/cadastro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                nome,
                email,
                telefone,
                cpf,
                senha
            })
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            mostrarMensagem(
                cadastroMessage,
                dados.erro ||
                dados.mensagem ||
                "Não foi possível criar sua conta."
            );
            return;
        }

        clienteAtual = dados.usuario || dados.cliente || null;

        mostrarMensagem(
            cadastroMessage,
            "Conta criada com sucesso!",
            true
        );

        liberarLoja();
        atualizarInterfaceCliente();
        await carregarProdutos();
    } catch (erro) {
        console.error(erro);
        mostrarMensagem(
            cadastroMessage,
            "Erro ao conectar com o servidor."
        );
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = "Criar conta";
        }
    }
}

/* =========================================================
   LOGOUT
   ========================================================= */

async function fazerLogout() {
    try {
        await fetch("/api/cliente/logout", {
            method: "POST",
            credentials: "include"
        });
    } catch (erro) {
        console.error("Erro no logout:", erro);
    }

    clienteAtual = null;
    carrinho = [];
    salvarCarrinho();
    bloquearLoja();
    atualizarInterfaceCliente();
    atualizarCarrinhoInterface();
}

/* =========================================================
   INTERFACE DO CLIENTE
   ========================================================= */

function atualizarInterfaceCliente() {
    const botao = document.getElementById("accountButtonText");

    if (!clienteAtual) {
        if (botao) botao.textContent = "Conta";
        return;
    }

    const nome = clienteAtual.nome || clienteAtual.name || "Cliente";

    if (botao) {
        const primeiroNome =
            String(nome).trim().split(/\s+/)[0] || "Conta";

        botao.textContent =
            primeiroNome.length > 16 ? "Minha conta" : primeiroNome;
    }
}

/* =========================================================
   PRODUTOS
   ========================================================= */

function garantirProdutosIphone11(lista) {
    const base = Array.isArray(lista) ? [...lista] : [];

    const novosProdutos = [
        {
            id: "iphone-11-tela-incell",
            nome: "Tela Para Iphone 11 A2111 A2221 A2223 Display/touch Incell",
            preco: 130,
            categoria: "Celular e Proteção",
            descricao: "Tela de reposição para iPhone 11 com módulo Display LCD + Touch e tecnologia Incell, compatível com A2111, A2221 e A2223. Indicada para recuperar imagem e touch. Teste a peça antes da instalação e, de preferência, faça a montagem com técnico especializado.",
            imagem: "https://media.cdn.kaufland.de/product-images/original/1879a2e27a881e45fd48104d8b1bc341.jpg"
        },
        {
            id: "iphone-11-bateria-wefix",
            nome: "Flex Bateria Iphone 11 3110mah Wefix Oficial",
            preco: 150,
            categoria: "Celular e Proteção",
            descricao: "Bateria Wefix para iPhone 11 com capacidade de 3110mAh, indicada para reposição e recuperação da autonomia do aparelho. Compatível com A2111, A2221 e A2223. Recomenda-se instalação por técnico especializado.",
            imagem: "https://http2.mlstatic.com/D_Q_NP_605979-MLB116841807748_092026-R-flex-bateria-iphone-11-3110mah-wefix-oficial-garantia-1-ano.webp"
        }
    ];

    for (const novo of novosProdutos) {
        const jaExiste = base.some(produto => {
            const nome = normalizarTexto(produto?.nome || produto?.name || "");
            return nome === normalizarTexto(novo.nome) ||
                   String(produto?.id ?? produto?._id ?? produto?.codigo ?? "") === novo.id;
        });

        if (!jaExiste) base.push(novo);
    }

    return base;
}

async function carregarProdutos() {
    if (!productsContainer) return;

    productsContainer.innerHTML = `
        <div class="carregando-produtos">
            Carregando produtos...
        </div>
    `;

    try {
        const resposta = await fetch("/api/produtos", {
            credentials: "include",
            cache: "no-store"
        });

        if (!resposta.ok) {
            throw new Error("Erro ao carregar produtos.");
        }

        const dados = await resposta.json();

        let listaProdutos;

        if (Array.isArray(dados)) {
            listaProdutos = dados;
        } else if (Array.isArray(dados.produtos)) {
            listaProdutos = dados.produtos;
        } else if (Array.isArray(dados.products)) {
            listaProdutos = dados.products;
        } else {
            listaProdutos = [];
        }

        produtos = garantirProdutosIphone11(listaProdutos);
        renderizarProdutos(produtos);
    } catch (erro) {
        console.error(erro);

        productsContainer.innerHTML = `
            <div class="erro-produtos">
                Não foi possível carregar os produtos.
                <br><br>
                <button type="button" onclick="carregarProdutos()">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}

function renderizarProdutos(lista = produtos) {
    const container = document.getElementById("products");
    if (!container) return;

    const contador = document.getElementById("productCount");

    if (contador) {
        contador.textContent = lista.length;
    }

    if (!lista.length) {
        container.innerHTML = `
            <div class="produtos-vazio">
                Nenhum produto encontrado.
            </div>
        `;
        return;
    }

    container.innerHTML = lista.map(produto => {
        const id = obterIdProduto(produto, produtos.indexOf(produto));
        const nome = produto.nome || produto.name || "Produto";
        const preco = Number(produto.preco ?? produto.price ?? 0);
        const categoria =
            produto.categoria ||
            produto.category ||
            "Tecnologia";
        const descricao = obterDescricaoProduto(produto);
        const imagem = obterImagemProduto(produto);

        return `
            <article class="produto-card product-card">
                <div class="produto-imagem product-image">
                    ${
                        imagem
                            ? `
                                <img
                                    src="${escaparAtributo(imagem)}"
                                    alt="${escaparAtributo(nome)}"
                                    loading="lazy"
                                    decoding="async"
                                    onerror="imagemFallback(this)"
                                >
                            `
                            : `
                                <div class="product-no-image">
                                    TECHSHOP
                                </div>
                            `
                    }
                </div>

                <div class="produto-info product-info">

                    <span class="produto-categoria product-category">
                        ${escaparHTML(categoria)}
                    </span>

                    <h3 class="product-name">
                        ${escaparHTML(nome)}
                    </h3>

                    <p class="product-description">
                        ${escaparHTML(descricao)}
                    </p>

                    <div class="produto-preco product-price">
                        ${dinheiro(preco)}
                    </div>

                    <button
                        type="button"
                        class="btn-comprar buy-btn"
                        data-produto-id="${escaparAtributo(id)}"
                        aria-label="Adicionar ${escaparAtributo(nome)} ao carrinho"
                    >
                        🛒 Adicionar ao carrinho
                    </button>

                </div>
            </article>
        `;
    }).join("");
}

/* =========================================================
   BUSCA / FILTRO
   ========================================================= */

function buscarProdutos() {
    const campo =
        document.getElementById("searchInput") ||
        document.getElementById("pesquisaProduto");

    if (!campo) return;

    const termo = normalizarTexto(campo.value);

    if (!termo) {
        renderizarProdutos(produtos);
        return;
    }

    const resultado = produtos.filter(produto => {
        const nome = normalizarTexto(
            produto.nome ||
            produto.name ||
            ""
        );

        const categoria = normalizarTexto(
            produto.categoria ||
            produto.category ||
            ""
        );
        const descricao = normalizarTexto(obterDescricaoProduto(produto));

        return (
            nome.includes(termo) ||
            categoria.includes(termo) ||
            descricao.includes(termo)
        );
    });

    renderizarProdutos(resultado);
}

function filtrarCategoria(categoria) {
    if (!categoria || normalizarTexto(categoria) === "todos") {
        renderizarProdutos(produtos);
        return;
    }

    const categoriaNormalizada = normalizarTexto(categoria);

    const resultado = produtos.filter(produto => {
        const categoriaProduto = normalizarTexto(
            produto.categoria ||
            produto.category ||
            ""
        );

        return categoriaProduto === categoriaNormalizada;
    });

    renderizarProdutos(resultado);
}

function configurarFiltrosCategoria() {
    const botoes = document.querySelectorAll("[data-categoria]");

    botoes.forEach(botao => {
        if (botao.dataset.bound === "1") return;

        botao.dataset.bound = "1";

        botao.addEventListener("click", function () {
            botoes.forEach(item => {
                item.classList.remove("active");
                item.classList.remove("ativo");
            });

            this.classList.add("active");
            this.classList.add("ativo");

            filtrarCategoria(this.dataset.categoria);
        });
    });
}

function configurarPesquisa() {
    const campo =
        document.getElementById("searchInput") ||
        document.getElementById("pesquisaProduto");

    if (!campo || campo.dataset.bound === "1") return;

    campo.dataset.bound = "1";

    campo.addEventListener("input", buscarProdutos);
}

/* =========================================================
   CARRINHO
   ========================================================= */

function adicionarCarrinho(id) {
    const produto = produtos.find(
        (item, indice) => obterIdProduto(item, indice) === String(id)
    );

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    const nome = produto.nome || produto.name || "Produto";
    const preco = Number(produto.preco ?? produto.price ?? 0);
    const imagem = obterImagemProduto(produto);

    const produtoId = obterIdProduto(produto, produtos.indexOf(produto));

    const existente = carrinho.find(
        item => String(item.id) === produtoId
    );

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            id: produtoId,
            nome,
            preco,
            imagem,
            quantidade: 1
        });
    }

    salvarCarrinho();
    atualizarCarrinhoInterface();

    mostrarToastCarrinho(
        "✅ " + (existente ? "Quantidade atualizada" : "Produto adicionado"),
        nome + " foi " + (existente ? "atualizado" : "adicionado") + " ao carrinho."
    );

    const botaoProduto = Array.from(document.querySelectorAll(".buy-btn[data-produto-id]")).find(
        botao => botao.dataset.produtoId === produtoId
    );
    if (botaoProduto) {
        botaoProduto.classList.remove("added");
        void botaoProduto.offsetWidth;
        botaoProduto.classList.add("added");
        setTimeout(() => botaoProduto.classList.remove("added"), 500);
    }
}

function mostrarToastCarrinho(titulo, texto) {
    const toast = document.getElementById("cartToast");
    const title = document.getElementById("cartToastTitle");
    const message = document.getElementById("cartToastText");

    if (!toast) return;

    if (title) title.textContent = titulo;
    if (message) message.textContent = texto;

    toast.classList.add("show");
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    toast.style.pointerEvents = "auto";

    clearTimeout(cartToastTimer);

    cartToastTimer = setTimeout(() => {
        toast.classList.remove("show");
        toast.style.opacity = "0";
        toast.style.transform = "translateY(14px)";
        toast.style.pointerEvents = "none";
    }, 2800);
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(
        item => String(item.id) !== String(id)
    );

    salvarCarrinho();
    atualizarCarrinhoInterface();
}

function alterarQuantidade(id, quantidade) {
    const item = carrinho.find(
        produto => String(produto.id) === String(id)
    );

    if (!item) return;

    quantidade = Number(quantidade);

    if (quantidade <= 0) {
        removerDoCarrinho(id);
        return;
    }

    item.quantidade = quantidade;

    salvarCarrinho();
    atualizarCarrinhoInterface();
}

function aumentarQuantidade(id) {
    const item = carrinho.find(
        produto => String(produto.id) === String(id)
    );

    if (!item) return;

    item.quantidade++;

    salvarCarrinho();
    atualizarCarrinhoInterface();
}

function diminuirQuantidade(id) {
    const item = carrinho.find(
        produto => String(produto.id) === String(id)
    );

    if (!item) return;

    item.quantidade--;

    if (item.quantidade <= 0) {
        removerDoCarrinho(id);
        return;
    }

    salvarCarrinho();
    atualizarCarrinhoInterface();
}

function calcularTotalCarrinho() {
    return carrinho.reduce((total, item) => {
        return total +
            Number(item.preco) *
            Number(item.quantidade);
    }, 0);
}

function calcularQuantidadeCarrinho() {
    return carrinho.reduce((total, item) => {
        return total + Number(item.quantidade);
    }, 0);
}

function salvarCarrinho() {
    try {
        localStorage.setItem(
            "techshop_carrinho",
            JSON.stringify(carrinho)
        );
    } catch (erro) {
        console.error("Erro ao salvar carrinho:", erro);
    }
}

function carregarCarrinho() {
    try {
        const salvo = localStorage.getItem("techshop_carrinho");

        if (!salvo) {
            carrinho = [];
            return;
        }

        const dados = JSON.parse(salvo);

        carrinho = Array.isArray(dados)
            ? dados
            : [];
    } catch (erro) {
        console.error("Erro ao carregar carrinho:", erro);
        carrinho = [];
    }
}

function atualizarCarrinhoInterface() {
    const quantidade = calcularQuantidadeCarrinho();
    const total = calcularTotalCarrinho();

    const contador = document.getElementById("cartCount");

    if (contador) {
        contador.textContent = quantidade;
        contador.style.display = quantidade > 0 ? "flex" : "none";
    }

    const totalElement = document.getElementById("cartTotal");
    if (totalElement) {
        totalElement.textContent = dinheiro(total);
    }

    const resumoItens = document.getElementById("cartItemsSummary");
    if (resumoItens) {
        resumoItens.textContent = quantidade;
    }

    const summaryBox = document.getElementById("cartSummaryBox");
    if (summaryBox) {
        summaryBox.style.display = carrinho.length ? "block" : "none";
    }

    const checkoutButton =
        document.getElementById("cartCheckoutButton");

    if (checkoutButton) {
        checkoutButton.disabled = !carrinho.length;
    }

    const lista = document.getElementById("cartItems");
    if (!lista) return;

    if (!carrinho.length) {
        lista.innerHTML = `
            <div class="cart-empty-modern">
                <div class="empty-cart-icon">🛒</div>
                <h3>Seu carrinho está vazio</h3>
                <p>
                    Adicione produtos da loja e eles aparecerão aqui.
                </p>
            </div>
        `;
        return;
    }

    lista.innerHTML = carrinho.map(item => {
        const subtotal =
            Number(item.preco) *
            Number(item.quantidade);

        return `
            <div class="cart-item">

                <div class="cart-item-image">
                    <img
                        src="${escaparAtributo(item.imagem || "")}"
                        alt="${escaparAtributo(item.nome)}"
                        onerror="imagemFallback(this)"
                    >
                </div>

                <div class="cart-item-info">

                    <h4>
                        ${escaparHTML(item.nome)}
                    </h4>

                    <strong>
                        ${dinheiro(subtotal)}
                    </strong>

                    <div class="cart-item-actions">

                        <button
                            type="button"
                            class="cart-action"
                            data-cart-action="decrease"
                            data-cart-id="${escaparAtributo(item.id)}"
                            aria-label="Diminuir quantidade"
                        >
                            −
                        </button>

                        <span>
                            ${Number(item.quantidade)}
                        </span>

                        <button
                            type="button"
                            class="cart-action"
                            data-cart-action="increase"
                            data-cart-id="${escaparAtributo(item.id)}"
                            aria-label="Aumentar quantidade"
                        >
                            +
                        </button>

                        <button
                            type="button"
                            class="cart-remove cart-action"
                            data-cart-action="remove"
                            data-cart-id="${escaparAtributo(item.id)}"
                            aria-label="Remover produto"
                        >
                            🗑
                        </button>

                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function abrirCarrinho() {
    const modal = document.getElementById("cartModal");

    if (!modal) return;

    modal.classList.add("active");
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    atualizarCarrinhoInterface();
}

function fecharCarrinho() {
    const modal = document.getElementById("cartModal");

    if (!modal) return;

    modal.classList.remove("active");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
}

function limparCarrinho() {
    carrinho = [];
    salvarCarrinho();
    atualizarCarrinhoInterface();
}

/* =========================================================
   FRETE / CHECKOUT
   ========================================================= */

function obterTipoEntregaSelecionado() {
    const radio = document.querySelector(
        'input[name="tipoEntrega"]:checked'
    );

    return radio?.value === "rapida"
        ? "rapida"
        : "normal";
}

function calcularFreteCheckout() {
    const tipo = obterTipoEntregaSelecionado();

    const freteNormal = checkoutFrete.primeiraCompra
        ? 0
        : FRETE_RECOMPRA;

    const freteFinal =
        tipo === "rapida"
            ? freteNormal + FRETE_RAPIDO_EXTRA
            : freteNormal;

    checkoutFrete.tipo = tipo;
    checkoutFrete.valor = freteFinal;

    return freteFinal;
}

async function verificarPrimeiraCompra() {
    checkoutFrete = {
        primeiraCompra: false,
        verificado: false,
        tipo: "normal",
        valor: FRETE_RECOMPRA
    };

    try {
        const resposta = await fetch(
            "/api/cliente/pedidos",
            {
                credentials: "include",
                cache: "no-store"
            }
        );

        const dados = await resposta.json().catch(() => []);

        if (!resposta.ok) {
            throw new Error("Não foi possível verificar o histórico.");
        }

        const pedidos =
            Array.isArray(dados)
                ? dados
                : Array.isArray(dados.pedidos)
                    ? dados.pedidos
                    : [];

        checkoutFrete.primeiraCompra =
            pedidos.length === 0;

        checkoutFrete.verificado = true;

        atualizarTextosEntrega();
    } catch (erro) {
        console.error(
            "Erro ao verificar primeira compra:",
            erro
        );

        /*
         * Se o histórico não puder ser confirmado,
         * evita liberar frete grátis incorretamente.
         */
        checkoutFrete.primeiraCompra = false;
        checkoutFrete.verificado = false;

        atualizarTextosEntrega();
    }

    calcularFreteCheckout();
}

function atualizarTextosEntrega() {
    const normal = document.getElementById("textoFreteNormal");
    const rapida = document.getElementById("textoFreteRapida");

    const freteNormal =
        checkoutFrete.primeiraCompra
            ? 0
            : FRETE_RECOMPRA;

    if (normal) {
        normal.textContent =
            checkoutFrete.primeiraCompra
                ? "🎁 Frete grátis na sua primeira compra"
                : `R$ ${freteNormal.toFixed(2).replace(".", ",")} de frete`;
    }

    if (rapida) {
        rapida.textContent =
            checkoutFrete.primeiraCompra
                ? "+ R$ 10,00 • primeira compra com frete normal grátis"
                : "+ R$ 10,00 • total do frete: R$ 15,00";
    }
}

function configurarEntregaCheckout() {
    document
        .querySelectorAll('input[name="tipoEntrega"]')
        .forEach(radio => {

            if (radio.dataset.bound === "1") {
                return;
            }

            radio.dataset.bound = "1";

            radio.addEventListener(
                "change",
                () => {
                    calcularFreteCheckout();
                    atualizarResumoCheckout();
                }
            );
        });
}

async function abrirCheckout() {
    if (!carrinho.length) {
        alert("Seu carrinho está vazio.");
        return;
    }

    fecharCarrinho();

    const modal = document.getElementById("checkoutModal");

    if (!modal) return;

    modal.style.display = "flex";

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const telefone = document.getElementById("telefone");
    const cpf = document.getElementById("cpf");

    if (nome) {
        nome.value = clienteAtual?.nome || "";
    }

    if (email) {
        email.value = clienteAtual?.email || "";
    }

    if (telefone && !telefone.value) {
        telefone.value = clienteAtual?.telefone || "";
    }

    if (cpf && !cpf.value) {
        cpf.value = formatarCPF(
            clienteAtual?.cpf || ""
        );
    }

    const normal = document.getElementById("entregaNormal");

    if (normal) {
        normal.checked = true;
    }

    configurarEntregaCheckout();

    const resumo = document.getElementById("checkoutResumo");

    if (resumo) {
        resumo.innerHTML = `
            <div class="resumo-checkout">
                <h3>Verificando condição de frete...</h3>
            </div>
        `;
    }

    await verificarPrimeiraCompra();
    atualizarResumoCheckout();
}

function fecharCheckout() {
    const modal = document.getElementById("checkoutModal");

    if (!modal) return;

    modal.style.display = "none";
}

function atualizarResumoCheckout() {
    const resumo =
        document.getElementById("checkoutResumo");

    if (!resumo) return;

    const subtotal = calcularTotalCarrinho();
    const frete = calcularFreteCheckout();
    const total = subtotal + frete;

    const tipoEntrega =
        checkoutFrete.tipo === "rapida"
            ? "⚡ Entrega rápida"
            : "📦 Entrega normal";

    const textoFrete =
        frete === 0
            ? "GRÁTIS"
            : dinheiro(frete);

    resumo.innerHTML = `
        <div class="resumo-checkout">

            <h3>
                Resumo do pedido
            </h3>

            ${carrinho.map(item => `
                <div class="resumo-item">

                    <span>
                        ${escaparHTML(item.nome)}
                        × ${item.quantidade}
                    </span>

                    <strong>
                        ${dinheiro(
                            Number(item.preco) *
                            Number(item.quantidade)
                        )}
                    </strong>

                </div>
            `).join("")}

            <div class="resumo-item">
                <span>🛍️ Subtotal</span>
                <strong>${dinheiro(subtotal)}</strong>
            </div>

            <div class="resumo-item">
                <span>${tipoEntrega}</span>
                <strong style="color:${frete === 0 ? "#65d98a" : "#fff"};">
                    ${textoFrete}
                </strong>
            </div>

            <div class="resumo-total">

                <span>
                    Total
                </span>

                <strong>
                    ${dinheiro(total)}
                </strong>

            </div>

        </div>
    `;
}

/* =========================================================
   FINALIZAR PEDIDO / PIX
   ========================================================= */

async function finalizarPedido(event) {
    event?.preventDefault();

    if (!carrinho.length) {
        alert("Seu carrinho está vazio.");
        fecharCheckout();
        return;
    }

    const telefone =
        document.getElementById("telefone")?.value.trim() || "";

    const cpf =
        document.getElementById("cpf")?.value.trim() || "";

    const cep =
        document.getElementById("cep")?.value.trim() || "";

    const bairro =
        document.getElementById("bairro")?.value.trim() || "";

    const endereco =
        document.getElementById("endereco")?.value.trim() || "";

    const numero =
        document.getElementById("numero")?.value.trim() || "";

    const cidade =
        document.getElementById("cidade")?.value.trim() || "";

    const estado =
        document.getElementById("estado")?.value
            .trim()
            .toUpperCase() || "";

    const cpfNumeros = cpf.replace(/\D/g, "");

    if (
        !telefone ||
        !cpf ||
        !cep ||
        !bairro ||
        !endereco ||
        !numero ||
        !cidade ||
        !estado
    ) {
        alert(
            "Preencha todos os dados do pedido, incluindo o CPF."
        );
        return;
    }

    if (cpfNumeros.length !== 11) {
        alert(
            "Digite um CPF válido com 11 números."
        );
        return;
    }

    if (!checkoutFrete.verificado) {
        await verificarPrimeiraCompra();
    }

    const tipoEntrega = obterTipoEntregaSelecionado();
    const frete = calcularFreteCheckout();

    const botao =
        document.getElementById("finalizarBtn");

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Gerando Pix...";
    }

    try {
        const resposta = await fetch("/api/pix", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                itens: carrinho.map(item => ({
                    id: /^\d+$/.test(String(item.id)) ? Number(item.id) : item.id,
                    quantidade: Number(item.quantidade)
                })),

                entrega: {
                    telefone,
                    cpf: cpfNumeros,
                    cep,
                    bairro,
                    endereco,
                    numero,
                    cidade,
                    estado,
                    tipoEntrega,
                    freteInformado: frete
                }
            })
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                dados.erro ||
                dados.mensagem ||
                "Não foi possível gerar o Pix."
            );
        }

        fecharCheckout();
        renderizarPix(dados);

        carrinho = [];
        salvarCarrinho();
        atualizarCarrinhoInterface();
    } catch (erro) {
        console.error(
            "Erro ao finalizar pedido:",
            erro
        );

        alert(
            erro.message ||
            "Não foi possível finalizar o pedido."
        );
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent =
                "Gerar pagamento Pix →";
        }
    }
}

async function gerarPix() {
    if (!carrinho.length) {
        alert("Seu carrinho está vazio.");
        return;
    }

    const botao =
        document.getElementById("btnGerarPix");

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Gerando Pix...";
    }

    try {
        const frete = calcularFreteCheckout();
        const tipoEntrega = obterTipoEntregaSelecionado();

        const resposta = await fetch("/api/pix", {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                itens: carrinho.map(item => ({
                    id: /^\d+$/.test(String(item.id)) ? Number(item.id) : item.id,
                    quantidade: Number(item.quantidade)
                })),
                entrega: {
                    tipoEntrega,
                    freteInformado: frete
                }
            })
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                dados.erro ||
                dados.mensagem ||
                "Erro ao gerar Pix."
            );
        }

        fecharCheckout();
        renderizarPix(dados);

        carrinho = [];
        salvarCarrinho();
        atualizarCarrinhoInterface();
    } catch (erro) {
        console.error(erro);

        alert(
            erro.message ||
            "Não foi possível gerar o Pix."
        );
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = "Gerar Pix";
        }
    }
}

function renderizarPix(dados = {}) {
    const modal =
        document.getElementById("pixModal");

    const resultado =
        document.getElementById("pixResultado");

    if (!modal || !resultado) return;

    const qrData =
        String(dados.qr_code_base64 || "").trim();

    const qrSrc = qrData
        ? (
            qrData.startsWith("data:")
                ? qrData
                : `data:image/png;base64,${qrData}`
        )
        : "";

    const codigo = String(
        dados.pix_copia_e_cola ||
        dados.qr_code ||
        dados.pedido?.pagamento?.qrCode ||
        ""
    ).trim();

    const valor = dinheiro(
        dados.valor ??
        (calcularTotalCarrinho() + Number(checkoutFrete.valor || 0))
    );

    const numero =
        dados.pedido?.numero ||
        dados.numero ||
        "";

    resultado.innerHTML = `
        <div class="pix-panel">

            <div class="pix-success">
                ✓
            </div>

            <div>
                <h3 class="pix-title">
                    Pix gerado com sucesso
                </h3>

                <p class="pix-subtitle">
                    Escaneie o QR Code ou use o código Pix copia e cola para concluir o pagamento.
                </p>
            </div>

            <div class="pix-value">

                <span>
                    VALOR DO PEDIDO
                </span>

                <strong id="pixValor">
                    ${valor}
                </strong>

            </div>

            <div class="pix-layout">

                <div class="pix-qr-box">

                    <div class="pix-qr">

                        ${
                            qrSrc
                                ? `
                                    <img
                                        id="pixQrCode"
                                        src="${escaparAtributo(qrSrc)}"
                                        alt="QR Code Pix"
                                    >
                                `
                                : `
                                    <div style="height:100%;display:grid;place-items:center;color:#555;font-weight:700;font-size:13px;padding:20px;">
                                        QR Code indisponível. Use o código Pix copia e cola.
                                    </div>
                                `
                        }

                    </div>

                </div>

                <div class="pix-side">

                    <div class="pix-copy-card">

                        <span class="pix-copy-label">
                            Código Pix copia e cola
                        </span>

                        <div class="pix-copy">

                            <input
                                id="pixCopiaCola"
                                type="text"
                                readonly
                                value="${escaparAtributo(codigo)}"
                                aria-label="Código Pix copia e cola"
                            >

                            <button
                                type="button"
                                onclick="copiarPix()"
                            >
                                📋 Copiar
                            </button>

                        </div>
                    </div>

                    <div class="pix-help">
                        Abra o app do seu banco, escolha Pix e escaneie o QR Code. Também pode copiar o código acima.
                    </div>

                    <div class="pix-order">
                        Pedido:
                        <strong id="pixNumeroPedido">
                            ${escaparHTML(numero)}
                        </strong>
                    </div>

                    <button
                        type="button"
                        class="pix-close-action"
                        onclick="fecharPix()"
                    >
                        Fechar
                    </button>

                </div>

            </div>

        </div>
    `;

    modal.style.display = "flex";
}

function fecharPix() {
    const modal = document.getElementById("pixModal");

    if (!modal) return;

    modal.style.display = "none";
}

async function copiarPix() {
    const campo =
        document.getElementById("pixCopiaCola");

    if (!campo) return;

    const codigo =
        campo.value.trim();

    if (!codigo) {
        alert("Código Pix não disponível.");
        return;
    }

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(codigo);
        } else {
            campo.removeAttribute("readonly");
            campo.focus();
            campo.select();
            document.execCommand("copy");
            campo.setAttribute("readonly", "readonly");
        }

        alert("Código Pix copiado!");
    } catch (erro) {
        try {
            campo.removeAttribute("readonly");
            campo.focus();
            campo.select();
            campo.setSelectionRange(0, campo.value.length);
            document.execCommand("copy");
            campo.setAttribute("readonly", "readonly");

            alert("Código Pix copiado!");
        } catch {
            alert(
                "Não foi possível copiar automaticamente. Selecione o código e copie manualmente."
            );
        }
    }
}

/* =========================================================
   CONTA
   ========================================================= */

async function abrirConta() {
    const modal =
        document.getElementById("accountModal");

    if (!modal) return;

    modal.classList.add("active");
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    const content =
        document.getElementById("accountContent");

    if (!content) return;

    if (!clienteAtual) {
        content.innerHTML = `
            <div class="account-error">
                <div>
                    <strong>Faça login para acessar sua conta.</strong>
                    <span>
                        Entre com seus dados para visualizar seu perfil e pedidos.
                    </span>
                </div>
            </div>
        `;
        return;
    }

    content.innerHTML = `
        <div class="account-loading">
            <div>
                <div class="account-loading-spinner"></div>
                <p>Carregando seus dados e pedidos...</p>
            </div>
        </div>
    `;

    try {
        const [perfilResponse, pedidosResponse] =
            await Promise.all([
                fetch("/api/cliente/perfil", {
                    credentials: "include",
                    cache: "no-store"
                }),
                fetch("/api/cliente/pedidos", {
                    credentials: "include",
                    cache: "no-store"
                })
            ]);

        const perfil =
            await perfilResponse.json().catch(() => ({}));

        const pedidos =
            await pedidosResponse.json().catch(() => []);

        if (!perfilResponse.ok) {
            throw new Error(
                perfil.erro ||
                "Sua sessão expirou. Faça login novamente."
            );
        }

        clienteAtual =
            perfil.usuario ||
            clienteAtual;

        atualizarInterfaceCliente();

        renderizarConta(
            pedidosResponse.ok
                ? (
                    Array.isArray(pedidos)
                        ? pedidos
                        : Array.isArray(pedidos.pedidos)
                            ? pedidos.pedidos
                            : []
                )
                : []
        );
    } catch (erro) {
        console.error(
            "Erro ao carregar conta:",
            erro
        );

        content.innerHTML = `
            <div class="account-error">
                <div>
                    <strong>Não foi possível carregar sua conta.</strong>
                    <span>
                        ${escaparHTML(
                            erro.message ||
                            "Tente novamente."
                        )}
                    </span>
                </div>
            </div>
        `;
    }
}

function renderizarConta(pedidos = []) {
    const content =
        document.getElementById("accountContent");

    if (!content || !clienteAtual) return;

    const nome =
        clienteAtual.nome ||
        "Cliente";

    const inicial =
        escaparHTML(
            String(nome)
                .trim()
                .charAt(0)
                .toUpperCase() || "C"
        );

    const lista = [...pedidos].sort(
        (a, b) =>
            new Date(b.criadoEm || 0) -
            new Date(a.criadoEm || 0)
    );

    const pedidosHTML = lista.length
        ? lista.map(renderizarPedidoConta).join("")
        : `
            <div class="account-empty-orders">
                <div>
                    <strong>Você ainda não tem pedidos.</strong>
                    <span>
                        Quando fizer uma compra, ela aparecerá aqui.
                    </span>
                </div>
            </div>
        `;

    content.innerHTML = `
        <div class="account-profile-hero">

            <div class="account-avatar-large">
                ${inicial}
            </div>

            <div>
                <h3>
                    ${escaparHTML(nome)}
                </h3>

                <p>
                    ${escaparHTML(
                        clienteAtual.email ||
                        "E-mail não informado"
                    )}
                </p>
            </div>

        </div>

        <div class="account-info-grid">

            <div class="account-info-box">
                <span>Nome</span>
                <strong>
                    ${escaparHTML(nome)}
                </strong>
            </div>

            <div class="account-info-box">
                <span>E-mail</span>
                <strong>
                    ${escaparHTML(
                        clienteAtual.email ||
                        "Não informado"
                    )}
                </strong>
            </div>

            <div class="account-info-box">
                <span>Telefone</span>
                <strong>
                    ${escaparHTML(
                        clienteAtual.telefone ||
                        "Não informado"
                    )}
                </strong>
            </div>

            <div class="account-info-box">
                <span>CPF</span>
                <strong>
                    ${escaparHTML(
                        clienteAtual.cpf ||
                        "Não informado"
                    )}
                </strong>
            </div>

        </div>

        <div class="account-orders-head">

            <div>
                <h3>Meus pedidos</h3>

                <p>
                    ${lista.length}
                    pedido${lista.length === 1 ? "" : "s"}
                    encontrado${lista.length === 1 ? "" : "s"}
                </p>
            </div>

            <button
                type="button"
                class="account-logout-btn"
                onclick="fazerLogout(); fecharModal('accountModal')"
            >
                Sair da conta
            </button>

        </div>

        <div class="account-orders-list">
            ${pedidosHTML}
        </div>
    `;
}

function renderizarPedidoConta(pedido) {
    const numero =
        String(
            pedido.numero ||
            pedido.id ||
            "-"
        );

    const status =
        pedido.status ||
        "Aguardando pagamento";

    const produtos =
        Array.isArray(pedido.produtos)
            ? pedido.produtos
            : [];

    const produtosTexto = produtos.length
        ? produtos.map(item =>
            `${Number(item.quantidade || 1)}x ${escaparHTML(item.nome || "Produto")}`
        ).join(" • ")
        : "Itens do pedido";

    const total =
        Number(
            pedido.valorTotal ??
            pedido.total ??
            0
        );

    const data =
        pedido.criadoEm
            ? new Date(
                pedido.criadoEm
            ).toLocaleString(
                "pt-BR",
                {
                    dateStyle: "short",
                    timeStyle: "short"
                }
            )
            : "Data não informada";

    const podeCancelar =
        status === "Aguardando pagamento";

    return `
        <article class="account-order-card">

            <div class="account-order-top">

                <div>
                    <div class="account-order-number">
                        #${escaparHTML(numero)}
                    </div>

                    <div class="account-order-date">
                        ${escaparHTML(data)}
                    </div>
                </div>

                <span class="account-status">
                    ${escaparHTML(status)}
                </span>

            </div>

            <div class="account-order-products">
                ${produtosTexto}
            </div>

            <div class="account-order-bottom">

                <div class="account-order-total">
                    <span>Total</span>
                    ${dinheiro(total)}
                </div>

                <div class="account-order-actions">

                    <button
                        type="button"
                        class="account-order-btn primary"
                        onclick="acompanharDoPedido('${escaparAtributo(numero)}')"
                    >
                        Acompanhar
                    </button>

                    ${
                        podeCancelar
                            ? `
                                <button
                                    type="button"
                                    class="account-order-btn danger"
                                    onclick="cancelarPedido('${escaparAtributo(numero)}')"
                                >
                                    Cancelar
                                </button>
                            `
                            : ""
                    }

                </div>

            </div>
        </article>
    `;
}

function acompanharDoPedido(numero) {
    fecharModal("accountModal");

    const campo =
        document.getElementById(
            "numeroPedidoConsulta"
        );

    if (campo) {
        campo.value = numero;
    }

    document.getElementById(
        "acompanharPedido"
    )?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    setTimeout(
        consultarPedido,
        250
    );
}

function fecharConta() {
    fecharModal("accountModal");
}

function fecharModal(id) {
    const modal =
        document.getElementById(id);

    if (!modal) return;

    modal.classList.remove("active");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
}

/* =========================================================
   ACOMPANHAR PEDIDO
   ========================================================= */

let pedidoTrackingTimer = null;

const etapasPedido = [
    {
        status: "Aguardando pagamento",
        icone: "💳",
        descricao: "Estamos aguardando a confirmação do pagamento."
    },
    {
        status: "Pagamento aprovado",
        icone: "✅",
        descricao: "Pagamento confirmado com sucesso."
    },
    {
        status: "Preparando pedido",
        icone: "📦",
        descricao: "Seu pedido está sendo separado e preparado."
    },
    {
        status: "Enviado",
        icone: "🏷️",
        descricao: "Seu pedido já foi enviado."
    },
    {
        status: "Em transporte",
        icone: "🚚",
        descricao: "Seu pedido está a caminho."
    },
    {
        status: "Entregue",
        icone: "🏠",
        descricao: "Pedido entregue. Obrigado pela compra!"
    }
];

function renderizarTimelinePedido(status, historico = []) {
    const timeline =
        document.getElementById(
            "timelinePedido"
        );

    if (!timeline) return;

    if (status === "Cancelado") {
        const lista =
            historico.length
                ? historico
                : [{ status: "Cancelado", em: null }];

        timeline.innerHTML =
            lista.map(item => `
                <div class="timeline-item concluido">

                    <div class="timeline-marker">
                        ${item.status === "Cancelado" ? "✕" : "✓"}
                    </div>

                    <div class="timeline-content">

                        <strong>
                            ${escaparHTML(item.status)}
                        </strong>

                        <p>
                            ${
                                item.em
                                    ? escaparHTML(
                                        new Date(
                                            item.em
                                        ).toLocaleString("pt-BR")
                                    )
                                    : ""
                            }
                        </p>

                    </div>
                </div>
            `).join("");

        return;
    }

    const base = [
        { status: "Aguardando pagamento", icone: "💳" },
        { status: "Pagamento aprovado", icone: "✅" },
        { status: "Preparando pedido", icone: "📦" },
        { status: "Enviado", icone: "🏷️" },
        { status: "Em transporte", icone: "🚚" },
        { status: "Entregue", icone: "🏠" }
    ];

    const mapa =
        new Map(
            (historico || []).map(
                item => [item.status, item]
            )
        );

    const indiceEncontrado =
        base.findIndex(
            item => item.status === status
        );

    const indiceAtual =
        Math.max(
            0,
            indiceEncontrado
        );

    timeline.innerHTML =
        base.map((item, index) => {

            const registro =
                mapa.get(item.status);

            const classe =
                registro
                    ? (
                        index < indiceAtual
                            ? "concluido"
                            : "atual"
                    )
                    : "futuro";

            const hora =
                registro?.em
                    ? new Date(
                        registro.em
                    ).toLocaleString("pt-BR")
                    : "Aguardando";

            return `
                <div class="timeline-item ${classe}">

                    <div class="timeline-marker">
                        ${registro ? item.icone : "○"}
                    </div>

                    <div class="timeline-content">

                        <strong>
                            ${escaparHTML(item.status)}
                        </strong>

                        <p>
                            ${
                                registro
                                    ? escaparHTML(hora)
                                    : "Ainda não realizado"
                            }
                        </p>

                    </div>

                </div>
            `;
        }).join("");
}

async function consultarPedido() {
    const campo =
        document.getElementById(
            "numeroPedidoConsulta"
        );

    const resultado =
        document.getElementById(
            "resultadoPedido"
        );

    const atualizado =
        document.getElementById(
            "ultimaAtualizacaoPedido"
        );

    const timeline =
        document.getElementById(
            "timelinePedido"
        );

    if (!campo || !resultado) return;

    const numero =
        campo.value.trim();

    if (!numero) {
        resultado.innerHTML = `
            <div class="tracking-result-card">
                <p class="erro">
                    Digite o número do pedido.
                </p>
            </div>
        `;

        if (timeline) timeline.innerHTML = "";
        if (atualizado) atualizado.textContent = "";

        return;
    }

    if (pedidoTrackingTimer) {
        clearInterval(pedidoTrackingTimer);
        pedidoTrackingTimer = null;
    }

    let ultimoStatus = null;
    let ultimaAtualizacao = null;
    let consultaEmAndamento = false;

    resultado.innerHTML = `
        <div class="tracking-result-card">
            <p style="color:#888;font-size:12px">
                Consultando pedido
                <strong style="color:#fff">
                    #${escaparHTML(numero)}
                </strong>...
            </p>
        </div>
    `;

    if (timeline) timeline.innerHTML = "";

    const consultar = async (silencioso = false) => {
        if (consultaEmAndamento) return false;

        consultaEmAndamento = true;

        try {
            const resposta = await fetch(
                "/api/pedido/" +
                encodeURIComponent(numero) +
                "/status?_=" +
                Date.now(),
                {
                    credentials: "include",
                    cache: "no-store",
                    headers: {
                        "Cache-Control": "no-cache"
                    }
                }
            );

            const dados =
                await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                if (!silencioso) {
                    resultado.innerHTML = `
                        <div class="tracking-result-card">
                            <p class="erro">
                                ${escaparHTML(
                                    dados.erro ||
                                    "Pedido não encontrado."
                                )}
                            </p>
                        </div>
                    `;

                    if (timeline) timeline.innerHTML = "";
                    if (atualizado) atualizado.textContent = "";
                }

                return false;
            }

            const status =
                dados.status ||
                "Aguardando pagamento";

            const criado =
                dados.criadoEm
                    ? new Date(
                        dados.criadoEm
                    ).toLocaleString("pt-BR")
                    : "Não informado";

            const atualizadoEm =
                dados.atualizadoEm
                    ? new Date(
                        dados.atualizadoEm
                    ).toLocaleString("pt-BR")
                    : criado;

            const mudou =
                ultimoStatus !== null &&
                (
                    ultimoStatus !== status ||
                    ultimaAtualizacao !== dados.atualizadoEm
                );

            resultado.innerHTML = `
                <div class="tracking-result-card ${mudou ? "tracking-pulse" : ""}">

                    <div class="tracking-result-top">

                        <div>

                            <h3>
                                Pedido #${escaparHTML(
                                    dados.numero ||
                                    numero
                                )}
                            </h3>

                            <p style="color:#777;font-size:11px;margin-top:4px">
                                Status atual do seu pedido
                            </p>

                        </div>

                        <span class="tracking-status-badge">
                            ${escaparHTML(status)}
                        </span>

                    </div>

                    <div class="tracking-meta-grid">

                        <div class="tracking-meta-box">
                            <span>Pedido criado</span>
                            <strong>
                                ${escaparHTML(criado)}
                            </strong>
                        </div>

                        <div class="tracking-meta-box">
                            <span>Última atualização</span>
                            <strong>
                                ${escaparHTML(atualizadoEm)}
                            </strong>
                        </div>

                    </div>

                    <div class="tracking-last">
                        🟢 Atualização automática ativa • verificando a cada 3 segundos
                    </div>

                </div>
            `;

            renderizarTimelinePedido(
                status,
                Array.isArray(dados.historicoStatus)
                    ? dados.historicoStatus
                    : []
            );

            if (mudou) {
                resultado
                    .querySelector(".tracking-result-card")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });
            }

            if (atualizado) {
                atualizado.textContent =
                    `🟢 Ao vivo • última verificação ${new Date().toLocaleTimeString("pt-BR")}`;
            }

            ultimoStatus = status;
            ultimaAtualizacao =
                dados.atualizadoEm || null;

            return true;
        } catch (erro) {
            if (!silencioso) {
                resultado.innerHTML = `
                    <div class="tracking-result-card">
                        <p class="erro">
                            Erro ao consultar o pedido. Tente novamente.
                        </p>
                    </div>
                `;

                if (timeline) timeline.innerHTML = "";
            }

            return false;
        } finally {
            consultaEmAndamento = false;
        }
    };

    const ok = await consultar(false);

    if (ok) {
        pedidoTrackingTimer =
            setInterval(
                () => consultar(true),
                3000
            );
    }
}

/* =========================================================
   CANCELAR PEDIDO
   ========================================================= */

async function cancelarPedido(numero) {
    if (!numero) {
        const campo =
            document.getElementById(
                "numeroPedidoConsulta"
            );

        numero =
            campo?.value?.trim();
    }

    if (!numero) {
        alert(
            "Informe o número do pedido."
        );
        return;
    }

    const confirmar =
        confirm(
            "Tem certeza que deseja cancelar este pedido?"
        );

    if (!confirmar) return;

    try {
        const resposta =
            await fetch(
                "/api/cliente/pedidos/" +
                encodeURIComponent(numero) +
                "/cancelar",
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        const dados =
            await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            alert(
                dados.erro ||
                dados.mensagem ||
                "Não foi possível cancelar o pedido."
            );
            return;
        }

        alert("Pedido cancelado com sucesso!");
        consultarPedido();
    } catch (erro) {
        console.error(erro);
        alert("Erro ao cancelar pedido.");
    }
}

/* =========================================================
   MODAIS / TECLADO
   ========================================================= */

function fecharModalAoClicarFora(event) {
    if (
        event.target.classList.contains("modal")
    ) {
        fecharModal(event.target.id);
    }
}

document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    document
        .querySelectorAll(".modal")
        .forEach(modal => {
            modal.style.display = "none";
            modal.classList.remove("active");
        });
});

/* =========================================================
   SENHA
   ========================================================= */

function alternarVisibilidadeSenha(botao) {
    const alvo = botao?.dataset?.target;
    const campo =
        alvo
            ? document.getElementById(alvo)
            : null;

    if (!campo) return;

    const mostrando =
        campo.type === "text";

    campo.type =
        mostrando
            ? "password"
            : "text";

    botao.classList.toggle(
        "is-visible",
        !mostrando
    );

    botao.textContent =
        mostrando
            ? "👁"
            : "🙈";

    botao.setAttribute(
        "aria-label",
        mostrando
            ? "Mostrar senha"
            : "Ocultar senha"
    );

    botao.title =
        mostrando
            ? "Mostrar senha"
            : "Ocultar senha";
}

function configurarBotoesSenha() {
    document
        .querySelectorAll(".password-toggle")
        .forEach(botao => {

            if (botao.dataset.bound === "1") {
                return;
            }

            botao.dataset.bound = "1";

            botao.addEventListener(
                "click",
                () => alternarVisibilidadeSenha(botao)
            );
        });
}

window.alternarVisibilidadeSenha =
    alternarVisibilidadeSenha;

/* GARANTIA DOS HANDLERS USADOS PELOS BOTÕES DA LOJA */
window.adicionarCarrinho = adicionarCarrinho;
window.removerDoCarrinho = removerDoCarrinho;
window.aumentarQuantidade = aumentarQuantidade;
window.diminuirQuantidade = diminuirQuantidade;
window.alterarQuantidade = alterarQuantidade;
window.abrirCarrinho = abrirCarrinho;
window.fecharCarrinho = fecharCarrinho;
window.mostrarToastCarrinho = mostrarToastCarrinho;

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log("TECHSHOP iniciando...");

        carregarCarrinho();
        configurarBotoesSenha();
        atualizarCarrinhoInterface();
        configurarFiltrosCategoria();
        configurarPesquisa();

        // Clique delegado: funciona mesmo quando os cards sao recriados pelo filtro/busca.
        if (!document.body.dataset.techshopCartClickBound) {
            document.body.dataset.techshopCartClickBound = "1";
            document.body.addEventListener("click", event => {
                const botaoProduto = event.target.closest(".buy-btn[data-produto-id]");

                if (botaoProduto) {
                    event.preventDefault();
                    event.stopPropagation();
                    adicionarCarrinho(botaoProduto.dataset.produtoId);
                    return;
                }

                const botaoCarrinho = event.target.closest("[data-cart-action][data-cart-id]");

                if (!botaoCarrinho) return;

                event.preventDefault();
                event.stopPropagation();

                const id = botaoCarrinho.dataset.cartId;
                const acao = botaoCarrinho.dataset.cartAction;

                if (acao === "increase") {
                    aumentarQuantidade(id);
                } else if (acao === "decrease") {
                    diminuirQuantidade(id);
                } else if (acao === "remove") {
                    removerDoCarrinho(id);
                    mostrarToastCarrinho(
                        "🗑 Produto removido",
                        "O item foi removido do carrinho."
                    );
                }
            });
        }

        if (loginForm) {
            loginForm.addEventListener(
                "submit",
                fazerLogin
            );
        }

        if (cadastroForm) {
            cadastroForm.addEventListener(
                "submit",
                fazerCadastro
            );
        }

        await verificarCliente();
    }
);

/* Máscara de CPF */
document.addEventListener(
    "input",
    event => {
        if (
            event.target &&
            event.target.id === "cpf"
        ) {
            event.target.value =
                formatarCPF(
                    event.target.value
                );
        }
    }
);
