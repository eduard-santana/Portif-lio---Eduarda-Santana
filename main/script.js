const main = document.getElementById('main');

const secoes = [
    {
        id: 'hero',
        pasta: 'hero'
    },
    {
        id: 'sobre',
        pasta: 'sobre'
    },
    {
        id: 'projetos',
        pasta: 'projetos'
    },
    {
        id: 'certificados',
        pasta: 'certificados'
    },
    {
        id: 'contatos',
        pasta: 'contatos'
    }
];

async function carregarSecao(secao) {

    // Cria a section antes do try
    const elemento = document.createElement('section');
    elemento.id = secao.id;

    main.appendChild(elemento);

    try {

        // =========================
        // CARREGAR HTML
        // =========================

        const resposta = await fetch(
            `${secao.pasta}/index.html`
        );

        if (!resposta.ok) {
            throw new Error(
                `Erro ao carregar ${secao.pasta}/index.html`
            );
        }

        const html = await resposta.text();

        elemento.innerHTML = html;


        // =========================
        // CARREGAR CSS
        // =========================

        const css = document.createElement('link');

        css.rel = 'stylesheet';
        css.href = `${secao.pasta}/style.css`;

        document.head.appendChild(css);

    } catch (erro) {

        console.error(erro);

        elemento.innerHTML = `
            <p>
                Não foi possível carregar a seção ${secao.id}.
            </p>
        `;
    }
}

// =========================
// Função selecionar a secão
// =========================

function ativarSecaoAtual() {

    const links = document.querySelectorAll('.navbar__tab');
    const secoes = document.querySelectorAll('main section');

    const observador = new IntersectionObserver((entradas) => {

            entradas.forEach((entrada) => {

                if (entrada.isIntersecting) {

                // Remove o ativo de todos

                    links.forEach((link) => {
                        link.classList.remove('is-active');
                    });

                    // Encontra o link da seção atual

                    const linkAtivo = document.querySelector(
                        `.navbar__tab[href="#${entrada.target.id}"]`
                    );

                    if (linkAtivo) {
                        linkAtivo.classList.add('is-active');
                    }
                }

            });

        },
        {
            threshold: 0.5
        }
    );

    secoes.forEach((secao) => {
        observador.observe(secao);
    });
}

// =========================
// INICIAR PORTFÓLIO
// =========================

async function iniciar() {

    for (const secao of secoes) {
        await carregarSecao(secao);
    }

    ativarSecaoAtual();
    iniciarFormularioContato();
}

// =========================
// Função Contatos
// =========================

function iniciarFormularioContato() {
    var form = document.getElementById('form-contato');
    if (!form) return;
    var retorno = form.querySelector('.contatos__retorno');
    var botao = form.querySelector('button[type="submit"]');

    function mostrar(msg, tipo) {
        retorno.textContent = msg;
        retorno.className = 'contatos__retorno ' + (tipo === 'ok' ? 'is-ok' : 'is-erro');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) {
            mostrar('Preencha nome, e-mail válido, assunto e mensagem para enviar.', 'erro');
            var invalido = form.querySelector(':invalid');
            if (invalido) invalido.focus();
            return;
        }

        botao.disabled = true;
        botao.textContent = 'Enviando…';

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        })
        .then(function (resp) {
            if (resp.ok) {
                form.reset();
                mostrar('Mensagem enviada. Obrigada pelo contato, retorno em breve!', 'ok');
            } else {
                mostrar('Não foi possível enviar agora. Tente de novo ou escreva para eduarda.santanacont@gmail.com.', 'erro');
            }
        })
        .catch(function () {
            mostrar('Sem conexão no momento. Verifique sua internet e tente de novo.', 'erro');
        })
        .finally(function () {
            botao.disabled = false;
            botao.textContent = 'Enviar mensagem';
        });
    });
}

iniciar();