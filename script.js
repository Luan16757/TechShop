/* =========================================================
   TECHSHOP - SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   VARIÁVEIS
========================================================= */

let produtos = [];
let carrinho = [];
let clienteAtual = null;


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
   FORMATAÇÃO DE DINHEIRO
========================================================= */

function dinheiro(valor) {

    const numero = Number(valor) || 0;

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   NORMALIZAR TEXTO
========================================================= */

function normalizarTexto(valor) {

    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================================================
   IMAGENS DOS PRODUTOS
========================================================= */

function obterImagemProduto(produto) {

    const imagens = {

        "kit 5 cabos iphone usb":
            "/imagens/kit-5-cabos-iphone-usb.webp",

        "kit 10 peliculas iphone xr ate 14":
            "/imagens/kit-10-peliculas-iphone-xr-14.webp",

        "suporte de celular para carro":
            "/imagens/suporte-celular-carro.webp",

        "kit 5 cabos usb tipo-c":
            "/imagens/kit-5-cabos-usbc.webp",

        "kit 5 cabos usb tipo c":
            "/imagens/kit-5-cabos-usbc.webp",

        "carregador turbo usb-c":
            "/imagens/carregador-turbo-usbc.webp",

        "carregador turbo usb c":
            "/imagens/carregador-turbo-usbc.webp",

        "cabo usb-c 1 metro":
            "/imagens/cabo-usbc-1m.webp",

        "cabo usb c 1 metro":
            "/imagens/cabo-usbc-1m.webp",

        "carregador veicular usb":
            "/imagens/carregador-veicular-usb.webp",

        "kit 5 fones m10 bluetooth":
            "/imagens/kit-5-fones-m10-bluetooth.webp",

        "fone bluetooth tws":
            "/imagens/fone-tws.webp",

        "caixa de som bluetooth":
            "/imagens/caixa-som-bluetooth.webp",

        "extensao filtro de linha 5 tomadas":
            "/imagens/extensao-filtro-linha-5-tomadas.webp",

        "power bank 20.000mah":
            "/imagens/powerbank-20000.webp",

        "power bank 20000mah":
            "/imagens/powerbank-20000.webp",

        "power bank pineng 10.000mah":
            "/imagens/pineng-10000.webp",

        "power bank pineng 10000mah":
            "/imagens/pineng-10000.webp",

        "mouse sem fio":
            "/imagens/mouse-sem-fio.webp",

        "teclado usb":
            "/imagens/teclado-usb.webp",

        "hub usb 4 portas":
            "/imagens/hub-usb-4-portas.webp",

        "mousepad gamer grande":
            "/imagens/mousepad-gamer-grande.webp"
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

    if (!imagem) {
        return "";
    }

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


/* =========================================================
   FALLBACK DE IMAGEM
========================================================= */

function imagemFallback(img) {

    if (!img) return;

    img.onerror = null;

    const svg = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="500"
            height="500"
            viewBox="0 0 500 500"
        >

            <rect
                width="500"
                height="500"
                fill="#111111"
            />

            <text
                x="250"
                y="225"
                text-anchor="middle"
                fill="#ff7300"
                font-size="42"
                font-family="Arial"
                font-weight="bold"
            >
                TECHSHOP
            </text>

            <text
                x="250"
                y="275"
                text-anchor="middle"
                fill="#777777"
                font-size="20"
                font-family="Arial"
            >
                Imagem indisponível
            </text>

        </svg>
    `;

    img.src =
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg);
}


/* =========================================================
   LIBERAR LOJA
========================================================= */

function liberarLoja() {

    if (authScreen) {
        authScreen.style.display = "none";
    }

    if (siteContent) {
        siteContent.style.display = "block";
    }
}


/* =========================================================
   BLOQUEAR LOJA
========================================================= */

function bloquearLoja() {

    if (authScreen) {
        authScreen.style.display = "flex";
    }

    if (siteContent) {
        siteContent.style.display = "none";
    }
}


/* =========================================================
   MENSAGEM
========================================================= */

function mostrarMensagem(elemento, mensagem, sucesso = false) {

    if (!elemento) return;

    elemento.textContent = mensagem;

    elemento.style.display = "block";

    elemento.style.color =
        sucesso ? "#22c55e" : "#ff5555";
}


/* =========================================================
   TABS LOGIN / CADASTRO
========================================================= */

function mostrarLogin() {

    const login = document.getElementById("loginForm");
    const cadastro = document.getElementById("cadastroForm");
    const tabLogin = document.getElementById("tabLogin");
    const tabCadastro = document.getElementById("tabCadastro");

    if (login) {
        login.classList.add("active");
    }

    if (cadastro) {
        cadastro.classList.remove("active");
    }

    if (tabLogin) {
        tabLogin.classList.add("active");
    }

    if (tabCadastro) {
        tabCadastro.classList.remove("active");
    }
}

function mostrarCadastro() {

    const login = document.getElementById("loginForm");
    const cadastro = document.getElementById("cadastroForm");
    const tabLogin = document.getElementById("tabLogin");
    const tabCadastro = document.getElementById("tabCadastro");

    if (login) {
        login.classList.remove("active");
    }

    if (cadastro) {
        cadastro.classList.add("active");
    }

    if (tabLogin) {
        tabLogin.classList.remove("active");
    }

    if (tabCadastro) {
        tabCadastro.classList.add("active");
    }
}

/* =========================================================
   MOSTRAR / OCULTAR SENHA
========================================================= */

function mostrarSenha(id, botao) {

    const input = document.getElementById(id);

    if (!input) return;

    const mostrando = input.type === "password";

    input.type = mostrando ? "text" : "password";

    if (botao) {
        botao.textContent = mostrando ? "Ocultar" : "Mostrar";
        botao.setAttribute(
            "aria-label",
            mostrando ? "Ocultar senha" : "Mostrar senha"
        );
    }
}


/* =========================================================
   RESPOSTA JSON SEGURA
========================================================= */

async function lerRespostaJSON(resposta) {

    const texto = await resposta.text();

    if (!texto) {
        return {};
    }

    try {
        return JSON.parse(texto);
    } catch (erro) {
        console.error("Resposta que não é JSON:", texto);
        return {
            erro:
                `O servidor retornou uma resposta inválida (HTTP ${resposta.status}).`
        };
    }
}


/* =========================================================
   VERIFICAR CLIENTE
========================================================= */

async function verificarCliente() {

    try {

        const resposta = await fetch(
            "/api/cliente/me",
            {
                credentials: "include"
            }
        );

        if (!resposta.ok) {
            bloquearLoja();
            return;
        }

        const dados = await lerRespostaJSON(resposta);

        if (
            dados.autenticado ||
            dados.logado
        ) {

            clienteAtual =
                dados.usuario ||
                dados.cliente ||
                null;

            liberarLoja();

            atualizarInterfaceCliente();

            await carregarProdutos();

        } else {

            clienteAtual = null;

            bloquearLoja();
        }

    } catch (erro) {

        console.error(
            "Erro ao verificar cliente:",
            erro
        );

        bloquearLoja();
    }
}


/* =========================================================
   LOGIN
========================================================= */

async function fazerLogin(event) {

    if (event) {
        event.preventDefault();
    }

    const email =
        document.getElementById("loginEmail")?.value
        .trim();

    const senha =
        document.getElementById("loginSenha")?.value;

    if (!email || !senha) {

        mostrarMensagem(
            loginMessage,
            "Preencha e-mail e senha."
        );

        return;
    }

    const botao =
        document.getElementById("loginButton");

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Entrando...";
    }

    try {

        const resposta = await fetch(
            "/api/cliente/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    email,
                    senha
                })
            }
        );

        const dados = await lerRespostaJSON(resposta);

        if (!resposta.ok) {

            mostrarMensagem(
                loginMessage,
                dados.erro ||
                dados.mensagem ||
                "E-mail ou senha incorretos."
            );

            return;
        }

        clienteAtual =
            dados.usuario ||
            dados.cliente ||
            null;

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

    if (event) {
        event.preventDefault();
    }

    const nome =
        document.getElementById("cadastroNome")?.value
        .trim();

    const email =
        document.getElementById("cadastroEmail")?.value
        .trim();

    const telefone =
        document.getElementById("cadastroTelefone")?.value
        .trim();

    const cpf =
        document.getElementById("cadastroCpf")?.value
        .trim();

    const senha =
        document.getElementById("cadastroSenha")?.value;

    if (
        !nome ||
        !email ||
        !telefone ||
        !cpf ||
        !senha
    ) {

        mostrarMensagem(
            cadastroMessage,
            "Preencha todos os campos."
        );

        return;
    }

    if (senha.length < 6) {

        mostrarMensagem(
            cadastroMessage,
            "A senha precisa ter pelo menos 6 caracteres."
        );

        return;
    }

    const botao =
        document.getElementById("cadastroButton");

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Criando conta...";
    }

    try {

        const resposta = await fetch(
            "/api/cliente/cadastro",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    nome,
                    email,
                    telefone,
                    cpf,
                    senha
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {

            mostrarMensagem(
                cadastroMessage,
                dados.erro ||
                dados.mensagem ||
                "Não foi possível criar sua conta."
            );

            return;
        }

        clienteAtual =
            dados.usuario ||
            dados.cliente ||
            null;

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

        await fetch(
            "/api/cliente/logout",
            {
                method: "POST",
                credentials: "include"
            }
        );

    } catch (erro) {

        console.error(
            "Erro no logout:",
            erro
        );

    }

    clienteAtual = null;

    carrinho = [];

    salvarCarrinho();

    bloquearLoja();

    atualizarCarrinhoInterface();
}


/* =========================================================
   INTERFACE DO CLIENTE
========================================================= */

function atualizarInterfaceCliente() {

    if (!clienteAtual) return;

    const nome =
        clienteAtual.nome ||
        clienteAtual.name ||
        "Cliente";

    const welcome =
        document.getElementById("accountWelcome");

    if (welcome) {
        welcome.textContent =
            `Olá, ${nome}!`;
    }

    const nomeConta =
        document.getElementById("accountName");

    if (nomeConta) {
        nomeConta.textContent = nome;
    }

    const emailConta =
        document.getElementById("accountEmail");

    if (emailConta) {
        emailConta.textContent =
            clienteAtual.email || "";
    }

    const telefoneConta =
        document.getElementById("accountTelefone");

    if (telefoneConta) {
        telefoneConta.textContent =
            clienteAtual.telefone || "";
    }

    const cpfConta =
        document.getElementById("accountCpf");

    if (cpfConta) {
        cpfConta.textContent =
            clienteAtual.cpf || "";
    }
}


/* =========================================================
   CARREGAR PRODUTOS
========================================================= */

async function carregarProdutos() {

    if (!productsContainer) return;

    productsContainer.innerHTML = `
        <div class="carregando-produtos">
            Carregando produtos...
        </div>
    `;

    try {

        const resposta = await fetch(
            "/api/produtos",
            {
                credentials: "include"
            }
        );

        if (!resposta.ok) {
            throw new Error(
                "Erro ao carregar produtos."
            );
        }

        const dados = await resposta.json();

        if (Array.isArray(dados)) {

            produtos = dados;

        } else if (Array.isArray(dados.produtos)) {

            produtos = dados.produtos;

        } else if (Array.isArray(dados.products)) {

            produtos = dados.products;

        } else {

            produtos = [];
        }

        renderizarProdutos(produtos);

    } catch (erro) {

        console.error(erro);

        productsContainer.innerHTML = `
            <div class="erro-produtos">
                Não foi possível carregar os produtos.
                <br><br>
                <button onclick="carregarProdutos()">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}


/* =========================================================
   RENDERIZAR PRODUTOS
========================================================= */

function renderizarProdutos(lista = produtos) {

    const container =
        document.getElementById("products");

    if (!container) return;

    const contador =
        document.getElementById("productCount");

    if (contador) {
        contador.textContent =
            lista.length;
    }

    if (!lista.length) {

        container.innerHTML = `
            <div class="produtos-vazio">
                Nenhum produto encontrado.
            </div>
        `;

        return;
    }

    container.innerHTML =
        lista.map(produto => {

            const id =
                Number(produto.id);

            const nome =
                produto.nome ||
                produto.name ||
                "Produto";

            const preco =
                produto.preco ??
                produto.price ??
                0;

            const categoria =
                produto.categoria ||
                produto.category ||
                "Tecnologia";

            const imagem =
                obterImagemProduto(produto);

            return `
                <article
                    class="produto-card product-card"
                >

                    <div
                        class="produto-imagem product-image"
                    >

                        <img
                            src="${escaparHTML(imagem)}"
                            alt="${escaparHTML(nome)}"
                            loading="lazy"
                            decoding="async"
                            onerror="imagemFallback(this)"
                        >

                    </div>

                    <div
                        class="produto-info product-info"
                    >

                        <span
                            class="produto-categoria"
                        >
                            ${escaparHTML(categoria)}
                        </span>

                        <h3
                            class="product-name"
                        >
                            ${escaparHTML(nome)}
                        </h3>

                        <div
                            class="produto-preco product-price"
                        >
                            ${dinheiro(preco)}
                        </div>

                        <button
                            type="button"
                            class="btn-comprar buy-btn"
                            onclick="adicionarCarrinho(${id})"
                        >
                            🛒 Adicionar ao carrinho
                        </button>

                    </div>

                </article>
            `;

        }).join("");
}


/* =========================================================
   BUSCA
========================================================= */

function buscarProdutos() {

    const campo =
        document.getElementById("searchInput") ||
        document.getElementById("pesquisaProduto");

    if (!campo) return;

    const termo =
        normalizarTexto(campo.value);

    if (!termo) {

        renderizarProdutos(produtos);

        return;
    }

    const resultado =
        produtos.filter(produto => {

            const nome =
                normalizarTexto(
                    produto.nome ||
                    produto.name ||
                    ""
                );

            const categoria =
                normalizarTexto(
                    produto.categoria ||
                    produto.category ||
                    ""
                );

            return (
                nome.includes(termo) ||
                categoria.includes(termo)
            );
        });

    renderizarProdutos(resultado);
}


/* =========================================================
   FILTRO POR CATEGORIA
========================================================= */

function filtrarCategoria(categoria) {

    if (!categoria || categoria === "todos") {

        renderizarProdutos(produtos);

        return;
    }

    const categoriaNormalizada =
        normalizarTexto(categoria);

    const resultado =
        produtos.filter(produto => {

            const categoriaProduto =
                normalizarTexto(
                    produto.categoria ||
                    produto.category ||
                    ""
                );

            return (
                categoriaProduto ===
                categoriaNormalizada
            );
        });

    renderizarProdutos(resultado);
}


/* =========================================================
   CONFIGURAR CATEGORIAS
========================================================= */

function configurarFiltrosCategoria() {

    const botoes =
        document.querySelectorAll(
            "[data-categoria]"
        );

    botoes.forEach(botao => {

        botao.addEventListener(
            "click",
            function () {

                botoes.forEach(item => {
                    item.classList.remove("active");
                });

                this.classList.add("active");

                const categoria =
                    this.dataset.categoria;

                filtrarCategoria(categoria);
            }
        );
    });
}


/* =========================================================
   CARRINHO
========================================================= */

function adicionarCarrinho(id) {

    const produto =
        produtos.find(
            item => Number(item.id) === Number(id)
        );

    if (!produto) {

        alert(
            "Produto não encontrado."
        );

        return;
    }

    const existente =
        carrinho.find(
            item =>
                Number(item.id) ===
                Number(produto.id)
        );

    if (existente) {

        existente.quantidade++;

    } else {

        carrinho.push({

            id: Number(produto.id),

            nome:
                produto.nome ||
                produto.name ||
                "Produto",

            preco:
                Number(
                    produto.preco ??
                    produto.price ??
                    0
                ),

            imagem:
                obterImagemProduto(produto),

            quantidade: 1
        });
    }

    salvarCarrinho();

    atualizarCarrinhoInterface();

    abrirCarrinho();
}


/* =========================================================
   REMOVER CARRINHO
========================================================= */

function removerDoCarrinho(id) {

    carrinho =
        carrinho.filter(
            item =>
                Number(item.id) !==
                Number(id)
        );

    salvarCarrinho();

    atualizarCarrinhoInterface();
}


/* =========================================================
   ALTERAR QUANTIDADE
========================================================= */

function alterarQuantidade(id, quantidade) {

    const item =
        carrinho.find(
            produto =>
                Number(produto.id) ===
                Number(id)
        );

    if (!item) return;

    quantidade =
        Number(quantidade);

    if (quantidade <= 0) {

        removerDoCarrinho(id);

        return;
    }

    item.quantidade =
        quantidade;

    salvarCarrinho();

    atualizarCarrinhoInterface();
}


/* =========================================================
   AUMENTAR
========================================================= */

function aumentarQuantidade(id) {

    const item =
        carrinho.find(
            produto =>
                Number(produto.id) ===
                Number(id)
        );

    if (!item) return;

    item.quantidade++;

    salvarCarrinho();

    atualizarCarrinhoInterface();
}


/* =========================================================
   DIMINUIR
========================================================= */

function diminuirQuantidade(id) {

    const item =
        carrinho.find(
            produto =>
                Number(produto.id) ===
                Number(id)
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


/* =========================================================
   TOTAL DO CARRINHO
========================================================= */

function calcularTotalCarrinho() {

    return carrinho.reduce(
        (total, item) => {

            return total +
                (
                    Number(item.preco) *
                    Number(item.quantidade)
                );

        },
        0
    );
}


/* =========================================================
   TOTAL DE ITENS
========================================================= */

function calcularQuantidadeCarrinho() {

    return carrinho.reduce(
        (total, item) => {

            return total +
                Number(item.quantidade);

        },
        0
    );
}


/* =========================================================
   SALVAR CARRINHO
========================================================= */

function salvarCarrinho() {

    try {

        localStorage.setItem(
            "techshop_carrinho",
            JSON.stringify(carrinho)
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar carrinho:",
            erro
        );
    }
}


/* =========================================================
   CARREGAR CARRINHO
========================================================= */

function carregarCarrinho() {

    try {

        const salvo =
            localStorage.getItem(
                "techshop_carrinho"
            );

        if (!salvo) {

            carrinho = [];

            return;
        }

        const dados =
            JSON.parse(salvo);

        carrinho =
            Array.isArray(dados)
                ? dados
                : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar carrinho:",
            erro
        );

        carrinho = [];
    }
}


/* =========================================================
   ATUALIZAR CARRINHO
========================================================= */

function atualizarCarrinhoInterface() {

    const quantidade =
        calcularQuantidadeCarrinho();

    const total =
        calcularTotalCarrinho();

    const contador =
        document.getElementById(
            "cartCount"
        );

    if (contador) {

        contador.textContent =
            quantidade;

        contador.style.display =
            quantidade > 0
                ? "flex"
                : "none";
    }

    const totalElement =
        document.getElementById(
            "cartTotal"
        );

    if (totalElement) {

        totalElement.textContent =
            dinheiro(total);
    }

    const lista =
        document.getElementById(
            "cartItems"
        );

    if (!lista) return;

    if (!carrinho.length) {

        lista.innerHTML = `
            <div class="carrinho-vazio">
                Seu carrinho está vazio.
            </div>
        `;

        return;
    }

    lista.innerHTML =
        carrinho.map(item => {

            return `
                <div class="cart-item">

                    <div class="cart-item-image">

                        <img
                            src="${escaparHTML(
                                item.imagem || ""
                            )}"
                            alt="${escaparHTML(
                                item.nome
                            )}"
                            onerror="imagemFallback(this)"
                        >

                    </div>

                    <div class="cart-item-info">

                        <h4>
                            ${escaparHTML(
                                item.nome
                            )}
                        </h4>

                        <strong>
                            ${dinheiro(
                                item.preco
                            )}
                        </strong>

                        <div class="cart-item-actions">

                            <button
                                type="button"
                                onclick="diminuirQuantidade(${item.id})"
                            >
                                −
                            </button>

                            <span>
                                ${item.quantidade}
                            </span>

                            <button
                                type="button"
                                onclick="aumentarQuantidade(${item.id})"
                            >
                                +
                            </button>

                            <button
                                type="button"
                                onclick="removerDoCarrinho(${item.id})"
                            >
                                🗑️
                            </button>

                        </div>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   ABRIR CARRINHO
========================================================= */

function abrirCarrinho() {

    const modal =
        document.getElementById(
            "cartModal"
        );

    if (!modal) return;

    modal.style.display = "flex";

    atualizarCarrinhoInterface();
}


/* =========================================================
   FECHAR CARRINHO
========================================================= */

function fecharCarrinho() {

    const modal =
        document.getElementById(
            "cartModal"
        );

    if (!modal) return;

    modal.style.display = "none";
}


/* =========================================================
   LIMPAR CARRINHO
========================================================= */

function limparCarrinho() {

    carrinho = [];

    salvarCarrinho();

    atualizarCarrinhoInterface();
}


/* =========================================================
   CHECKOUT
========================================================= */

function abrirCheckout() {

    if (!carrinho.length) {

        alert(
            "Seu carrinho está vazio."
        );

        return;
    }

    fecharCarrinho();

    const modal =
        document.getElementById(
            "checkoutModal"
        );

    if (!modal) return;

    modal.style.display = "flex";

    atualizarResumoCheckout();
}


/* =========================================================
   FECHAR CHECKOUT
========================================================= */

function fecharCheckout() {

    const modal =
        document.getElementById(
            "checkoutModal"
        );

    if (!modal) return;

    modal.style.display = "none";
}


/* =========================================================
   RESUMO CHECKOUT
========================================================= */

function atualizarResumoCheckout() {

    const resumo =
        document.getElementById(
            "checkoutResumo"
        );

    if (!resumo) return;

    const total =
        calcularTotalCarrinho();

    resumo.innerHTML = `

        <div class="resumo-checkout">

            <h3>
                Resumo do pedido
            </h3>

            ${carrinho.map(item => `

                <div class="resumo-item">

                    <span>
                        ${escaparHTML(
                            item.nome
                        )}
                        × ${item.quantidade}
                    </span>

                    <strong>
                        ${dinheiro(
                            item.preco *
                            item.quantidade
                        )}
                    </strong>

                </div>

            `).join("")}

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
   PAGAMENTO PIX
========================================================= */

async function gerarPix() {

    if (!carrinho.length) {

        alert(
            "Seu carrinho está vazio."
        );

        return;
    }

    const botao =
        document.getElementById(
            "btnGerarPix"
        );

    if (botao) {

        botao.disabled = true;

        botao.textContent =
            "Gerando Pix...";
    }

    try {

        const resposta =
            await fetch(
                "/api/pix",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({

                        produtos:
                            carrinho.map(item => ({
                                id: Number(item.id),
                                quantidade:
                                    Number(
                                        item.quantidade
                                    )
                            }))

                    })
                }
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                dados.mensagem ||
                "Erro ao gerar Pix."
            );
        }

        fecharCheckout();

        const modal =
            document.getElementById(
                "pixModal"
            );

        if (modal) {
            modal.style.display = "flex";
        }

        const qr =
            document.getElementById(
                "pixQrCode"
            );

        if (
            qr &&
            dados.qr_code_base64
        ) {

            qr.src =
                dados.qr_code_base64
                    .startsWith("data:")
                    ? dados.qr_code_base64
                    : "data:image/png;base64," +
                      dados.qr_code_base64;
        }

        const copia =
            document.getElementById(
                "pixCopiaCola"
            );

        if (copia) {

            copia.value =
                dados.qr_code ||
                dados.pix_copia_e_cola ||
                "";
        }

        const valor =
            document.getElementById(
                "pixValor"
            );

        if (valor) {

            valor.textContent =
                dinheiro(
                    dados.valor ||
                    calcularTotalCarrinho()
                );
        }

        /*
         * Pedido criado pelo backend
         */
        if (dados.pedido) {

            const numero =
                document.getElementById(
                    "pixNumeroPedido"
                );

            if (numero) {

                numero.textContent =
                    dados.pedido.numero ||
                    dados.pedido.id ||
                    "";
            }
        }

        /*
         * Limpa carrinho depois de gerar
         */
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

            botao.textContent =
                "Gerar Pix";
        }
    }
}


/* =========================================================
   FECHAR PIX
========================================================= */

function fecharPix() {

    const modal =
        document.getElementById(
            "pixModal"
        );

    if (!modal) return;

    modal.style.display = "none";
}


/* =========================================================
   COPIAR PIX
========================================================= */

async function copiarPix() {

    const campo =
        document.getElementById(
            "pixCopiaCola"
        );

    if (!campo) return;

    const codigo =
        campo.value.trim();

    if (!codigo) {

        alert(
            "Código Pix não disponível."
        );

        return;
    }

    try {

        await navigator.clipboard.writeText(
            codigo
        );

        alert(
            "Código Pix copiado!"
        );

    } catch (erro) {

        campo.select();

        document.execCommand(
            "copy"
        );

        alert(
            "Código Pix copiado!"
        );
    }
}


/* =========================================================
   CONTA
========================================================= */

function abrirConta() {

    const modal =
        document.getElementById(
            "accountModal"
        );

    if (!modal) return;

    modal.style.display = "flex";

    atualizarInterfaceCliente();
}


/* =========================================================
   FECHAR CONTA
========================================================= */

function fecharConta() {

    const modal =
        document.getElementById(
            "accountModal"
        );

    if (!modal) return;

    modal.style.display = "none";
}


/* =========================================================
   CONSULTAR PEDIDO
========================================================= */

async function consultarPedido() {

    const campo =
        document.getElementById(
            "numeroPedidoConsulta"
        );

    const resultado =
        document.getElementById(
            "resultadoPedido"
        );

    if (!campo || !resultado) return;

    const numero =
        campo.value.trim();

    if (!numero) {

        resultado.innerHTML = `
            <p class="erro">
                Digite o número do pedido.
            </p>
        `;

        return;
    }

    resultado.innerHTML = `
        <p>
            Consultando pedido...
        </p>
    `;

    try {

        const resposta =
            await fetch(
                "/api/pedidos/" +
                encodeURIComponent(numero),
                {
                    credentials: "include"
                }
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {

            resultado.innerHTML = `
                <p class="erro">
                    ${
                        escaparHTML(
                            dados.erro ||
                            dados.mensagem ||
                            "Pedido não encontrado."
                        )
                    }
                </p>
            `;

            return;
        }

        const pedido =
            dados.pedido ||
            dados;

        const status =
            pedido.status ||
            "Pendente";

        const total =
            Number(
                pedido.total ||
                0
            );

        resultado.innerHTML = `

            <div class="pedido-resultado">

                <h3>
                    Pedido #${escaparHTML(
                        pedido.numero ||
                        pedido.id ||
                        numero
                    )}
                </h3>

                <p>
                    <strong>Status:</strong>
                    ${escaparHTML(status)}
                </p>

                <p>
                    <strong>Total:</strong>
                    ${dinheiro(total)}
                </p>

                ${
                    pedido.criadoEm
                        ? `
                            <p>
                                <strong>Data:</strong>
                                ${new Date(
                                    pedido.criadoEm
                                ).toLocaleString(
                                    "pt-BR"
                                )}
                            </p>
                        `
                        : ""
                }

            </div>
        `;

    } catch (erro) {

        console.error(erro);

        resultado.innerHTML = `
            <p class="erro">
                Erro ao consultar pedido.
            </p>
        `;
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
                "/api/pedidos/" +
                encodeURIComponent(numero) +
                "/cancelar",
                {
                    method: "POST",

                    credentials: "include"
                }
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {

            alert(
                dados.erro ||
                dados.mensagem ||
                "Não foi possível cancelar o pedido."
            );

            return;
        }

        alert(
            "Pedido cancelado com sucesso!"
        );

        consultarPedido();

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao cancelar pedido."
        );
    }
}


/* =========================================================
   MODAIS
========================================================= */

function fecharModalAoClicarFora(event) {

    if (
        event.target.classList.contains(
            "modal"
        )
    ) {

        event.target.style.display =
            "none";
    }
}


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {
            return;
        }

        const modais =
            document.querySelectorAll(
                ".modal"
            );

        modais.forEach(modal => {

            modal.style.display =
                "none";

        });
    }
);


/* =========================================================
   PESQUISA EM TEMPO REAL
========================================================= */

function configurarPesquisa() {

    const campo =
        document.getElementById(
            "searchInput"
        ) ||
        document.getElementById(
            "pesquisaProduto"
        );

    if (!campo) return;

    campo.addEventListener(
        "input",
        function () {

            buscarProdutos();

        }
    );
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "TECHSHOP iniciando..."
        );

        carregarCarrinho();

        atualizarCarrinhoInterface();

        configurarFiltrosCategoria();

        configurarPesquisa();

        /* Formulários já são ligados de forma única aqui. */

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

        /*
         * Verifica login
         */

        await verificarCliente();

    }
);