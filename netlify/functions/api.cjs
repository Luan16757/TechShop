const serverless = require("serverless-http");

const app = require("../../server.cjs");

let connectLambdaPromise = null;

async function prepararBlobs(event) {
    if (!connectLambdaPromise) {
        connectLambdaPromise = import("@netlify/blobs")
            .then(({ connectLambda }) => connectLambda)
            .catch((erro) => {
                connectLambdaPromise = null;
                throw erro;
            });
    }

    const connectLambda = await connectLambdaPromise;

    if (event && typeof connectLambda === "function") {
        connectLambda(event);
    }
}

function obterCookie(event, nome) {
    const cookieHeader =
        event?.headers?.cookie ||
        event?.headers?.Cookie ||
        "";

    for (const parte of String(cookieHeader).split(";")) {
        const [chave, ...resto] = parte.trim().split("=");

        if (chave === nome) {
            return decodeURIComponent(resto.join("="));
        }
    }

    return null;
}

function responder(statusCode, body, headers = {}) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            ...headers
        },
        body: JSON.stringify(body)
    };
}

function caminhoEvento(event) {
    return String(
        event?.rawPath ||
        event?.path ||
        ""
    )
        .replace(/^\/.netlify\/functions\/api/, "")
        .replace(/^\/api/, "") || "/";
}

function verificarTokenCliente(token) {
    try {
        const emNetlify =
            process.env.NETLIFY === "true" ||
            process.env.NETLIFY === "1" ||
            Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

        const secret =
            process.env.SESSION_SECRET ||
            (
                emNetlify
                    ? (
                        process.env.ADMIN_PASSWORD ||
                        "techshop-netlify-admin-secret"
                    )
                    : "techshop-local-session-secret"
            );

        if (!secret || !token) {
            return null;
        }

        const partes = String(token).split(".");

        if (partes.length !== 2) {
            return null;
        }

        const [corpo, assinatura] = partes;

        const crypto = require("crypto");

        const assinaturaAtual =
            crypto
                .createHmac("sha256", secret)
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

        const payload =
            Buffer
                .from(corpo, "base64url")
                .toString("utf8");

        const [tipo, id, timestampTexto] =
            payload.split("|");

        if (tipo !== "cliente" || !id) {
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

        return { id };
    } catch {
        return null;
    }
}

async function clienteMeNoNetlify(event) {
    const token =
        obterCookie(
            event,
            "techshop_cliente"
        );

    if (!token) {
        return responder(401, {
            autenticado: false,
            usuario: null,
            erro: "Cliente não autenticado."
        });
    }

    const sessao =
        verificarTokenCliente(token);

    if (!sessao?.id) {
        return responder(401, {
            autenticado: false,
            usuario: null,
            erro: "Sessão expirada."
        });
    }

    const { getStore } =
        await import("@netlify/blobs");

    const store =
        getStore(
            "techshop-data",
            {
                consistency: "eventual"
            }
        );

    const usuarios =
        await store.get(
            "usuarios",
            {
                type: "json"
            }
        );

    const lista =
        Array.isArray(usuarios)
            ? usuarios
            : [];

    const usuario =
        lista.find(
            item =>
                String(item?.id) ===
                String(sessao.id)
        );

    if (!usuario) {
        return responder(401, {
            autenticado: false,
            usuario: null,
            erro: "Usuário não encontrado."
        });
    }

    return responder(200, {
        autenticado: true,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            cpf: usuario.cpf
        }
    });
}

const handlerExpress = serverless(app);

exports.handler = async (event, context) => {
    try {
        await prepararBlobs(event);

        const caminho =
            caminhoEvento(event);

        if (
            caminho ===
            "/cliente/me" &&
            (
                String(event?.httpMethod || "GET")
                    .toUpperCase() === "GET"
            )
        ) {
            return await clienteMeNoNetlify(event);
        }
    } catch (erro) {
        console.error(
            "Falha ao preparar Netlify Blobs:",
            erro?.stack || erro
        );

        return responder(
            500,
            {
                erro:
                    "Falha ao inicializar o armazenamento da TECHSHOP.",
                detalhe:
                    erro?.message ||
                    "Erro interno."
            }
        );
    }

    return handlerExpress(event, context);
};
