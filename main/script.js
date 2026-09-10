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
}

iniciar();