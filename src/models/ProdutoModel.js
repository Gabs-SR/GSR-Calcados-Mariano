const db = require('../config/db');

const PUBLICOS = ['Masculino', 'Feminino', 'Infantil', 'Unissex'];

const ORDENACOES = {
    nome: 'nome_ordenacao ASC, id ASC',
    nome_desc: 'nome_ordenacao DESC, id DESC',
    quantidade: 'quantidade ASC, id ASC',
    quantidade_desc: 'quantidade DESC, id DESC',
    recentes: 'id DESC'
};

const COLUNAS = [
    'nome', 'numeracao', 'categoria', 'publico', 'subcategoria', 'quantidade',
    'status_estoque', 'marca', 'cor', 'descricao', 'imagem_url', 'nome_ordenacao'
];

const erro = (mensagem, tipo = 'validacao', erros) => {
    const e = new Error(mensagem);
    e[tipo] = true;
    if (erros) e.erros = erros;
    return e;
};

const chaveOrdenacao = (texto) => String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const idValido = (id) => /^[1-9][0-9]*$/.test(String(id));

const validarProduto = (produto) => {
    if (!produto || typeof produto !== 'object' || Array.isArray(produto)) {
        return ['O corpo do pedido precisa ser um objeto JSON.'];
    }

    const erros = [];
    for (const campo of ['nome', 'numeracao', 'categoria']) {
        if (typeof produto[campo] !== 'string' || produto[campo].trim() === '') {
            erros.push(`O campo "${campo}" é obrigatório.`);
        }
    }

    if (typeof produto.publico !== 'string' || !PUBLICOS.includes(produto.publico.trim())) {
        erros.push(`O campo "publico" deve ser um destes: ${PUBLICOS.join(', ')}.`);
    }

    if (!Number.isInteger(produto.quantidade) || produto.quantidade < 0) {
        erros.push('O campo "quantidade" deve ser um número inteiro maior ou igual a zero.');
    }

    for (const campo of ['subcategoria', 'status_estoque', 'marca', 'cor', 'descricao', 'imagem_url']) {
        const valor = produto[campo];
        if (valor !== undefined && valor !== null && typeof valor !== 'string') {
            erros.push(`O campo "${campo}" deve ser um texto.`);
        }
    }

    if (typeof produto.imagem_url === 'string' && produto.imagem_url.trim() !== '') {
        const url = produto.imagem_url.trim();
        if (!(url.startsWith('/') || url.startsWith('https://') || url.startsWith('http://'))) {
            erros.push('O campo "imagem_url" deve ser uma URL HTTP(S) ou caminho local.');
        }
    }

    return erros;
};

const valoresParaGravar = (produto) => {
    const quantidade = produto.quantidade;
    const status = typeof produto.status_estoque === 'string' && produto.status_estoque.trim()
        ? produto.status_estoque.trim()
        : quantidade > 0 ? 'Em estoque' : 'Sem estoque';

    const opcional = (valor) => {
        if (valor === undefined || valor === null || String(valor).trim() === '') return null;
        return String(valor).trim();
    };

    return [
        produto.nome.trim(),
        produto.numeracao.trim(),
        produto.categoria.trim(),
        produto.publico.trim(),
        opcional(produto.subcategoria),
        quantidade,
        status,
        opcional(produto.marca),
        opcional(produto.cor),
        opcional(produto.descricao),
        opcional(produto.imagem_url),
        chaveOrdenacao(produto.nome)
    ];
};

const montarFiltros = (filtros = []) => {
    const where = [];
    const params = [];

    if (filtros.publico) {
        if (!PUBLICOS.includes(filtros.publico)) throw erro('Público inválido.');
        params.push(filtros.publico);
        where.push(`publico = $${params.length}`);
    }

    if (filtros.categoria) {
        params.push(filtros.categoria);
        where.push(`categoria = $${params.length}`);
    }

    return { where: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
};

const ProdutoModel = {
    listar: async (filtros = {}) => {
        const ordem = filtros.ordenar || 'nome';
        if (!Object.prototype.hasOwnProperty.call(ORDENACOES, ordem)) {
            throw erro(`O parâmetro "ordenar" deve ser um destes: ${Object.keys(ORDENACOES).join(', ')}.`);
        }

        const pagina = filtros.pagina === undefined || filtros.pagina === '' ? 1 : Number(filtros.pagina);
        const limite = filtros.limite === undefined || filtros.limite === '' ? 50 : Number(filtros.limite);

        if (!Number.isInteger(pagina) || pagina < 1) throw erro('O parâmetro "pagina" deve ser inteiro positivo.');
        if (!Number.isInteger(limite) || limite < 1 || limite > 100) throw erro('O parâmetro "limite" deve estar entre 1 e 100.');

        const { where, params } = montarFiltros(filtros);
        const total = await db.buscarUm(`SELECT COUNT(*)::int AS total FROM produtos ${where}`, params);
        const offset = (pagina - 1) * limite;
        const linhas = await db.buscarTodos(
            `SELECT * FROM produtos ${where} ORDER BY ${ORDENACOES[ordem]} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limite, offset]
        );

        const quantidadeTotal = Number(total.total);
        return {
            produtos: linhas,
            total: quantidadeTotal,
            pagina,
            limite,
            paginas: quantidadeTotal ? Math.ceil(quantidadeTotal / limite) : 0
        };
    },

    porId: async (id) => {
        if (!idValido(id)) throw erro('O id precisa ser um número inteiro positivo.');
        const produto = await db.buscarUm('SELECT * FROM produtos WHERE id = $1', [Number(id)]);
        if (!produto) throw erro('Produto não encontrado.', 'naoEncontrado');
        return produto;
    },

    adicionar: async (produto) => {
        const erros = validarProduto(produto);
        if (erros.length) throw erro('O produto enviado não passou na validação.', 'validacao', erros);

        const valores = valoresParaGravar(produto);
        const placeholders = valores.map((_, i) => `$${i + 1}`).join(', ');
        const resultado = await db.buscarUm(
            `INSERT INTO produtos (${COLUNAS.join(', ')}) VALUES (${placeholders}) RETURNING id`,
            valores
        );
        return { id: resultado.id };
    },

    atualizar: async (id, produto) => {
        if (!idValido(id)) throw erro('O id precisa ser um número inteiro positivo.');
        const erros = validarProduto(produto);
        if (erros.length) throw erro('O produto enviado não passou na validação.', 'validacao', erros);

        const valores = valoresParaGravar(produto);
        const atribuicoes = COLUNAS.map((coluna, i) => `${coluna} = $${i + 1}`).join(', ');
        const resultado = await db.query(`UPDATE produtos SET ${atribuicoes} WHERE id = $${valores.length + 1} RETURNING id`, [...valores, Number(id)]);
        if (!resultado.rowCount) throw erro('Produto não encontrado.', 'naoEncontrado');
        return { id: Number(id) };
    },

    remover: async (id) => {
        if (!idValido(id)) throw erro('O id precisa ser um número inteiro positivo.');
        const resultado = await db.query('DELETE FROM produtos WHERE id = $1 RETURNING id', [Number(id)]);
        if (!resultado.rowCount) throw erro('Produto não encontrado.', 'naoEncontrado');
        return { id: Number(id) };
    },

    opcoesDeFiltro: async () => {
        const [categorias, publicos] = await Promise.all([
            db.buscarTodos("SELECT DISTINCT categoria AS valor FROM produtos WHERE categoria IS NOT NULL AND categoria <> '' ORDER BY categoria", []),
            db.buscarTodos("SELECT DISTINCT publico AS valor FROM produtos WHERE publico IS NOT NULL AND publico <> '' ORDER BY publico", [])
        ]);
        return {
            categorias: categorias.map((item) => item.valor),
            publicos: publicos.map((item) => item.valor)
        };
    },

    buscar: async (termo, tipo) => {
        const tipos = {
            nome: ['nome', false],
            categoria: ['categoria', false],
            numeracao: ['numeracao', true]
        };
        if (!Object.prototype.hasOwnProperty.call(tipos, tipo)) {
            throw erro('O parâmetro "tipo" é obrigatório e deve ser nome, categoria ou numeracao.');
        }
        if (typeof termo !== 'string' || !termo.trim()) throw erro('O parâmetro "termo" é obrigatório.');

        const [coluna, exata] = tipos[tipo];
        const valor = exata ? termo.trim() : `%${termo.trim()}%`;
        return db.buscarTodos(`SELECT * FROM produtos WHERE ${coluna} ${exata ? '=' : 'ILIKE'} $1 ORDER BY nome_ordenacao, id`, [valor]);
    },

    listarTodos: async () => db.buscarTodos('SELECT * FROM produtos ORDER BY id', [])
};

module.exports = { ProdutoModel, PUBLICOS };
