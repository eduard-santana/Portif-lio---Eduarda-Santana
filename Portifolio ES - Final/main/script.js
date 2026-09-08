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
    }
];
async function carregarSecao(secao) {

    try {

        // Cria o espaço da seção
        const elemento = document.createElement('section');

        elemento.id = secao.id;

        main.appendChild(elemento);


        // Carrega o HTML
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


        // Carrega o CSS
        const css = document.createElement('link');

        css.rel = 'stylesheet';

        css.href = `${secao.pasta}/style.css`;

        document.head.appendChild(css);


    } catch (erro) {

        console.error(erro);

        main.innerHTML += `
            <p>
                Não foi possível carregar a seção ${secao.id}.
            </p>
        `;
    }
}


async function iniciar() {

    for (const secao of secoes) {

        await carregarSecao(secao);

    }
}


iniciar();