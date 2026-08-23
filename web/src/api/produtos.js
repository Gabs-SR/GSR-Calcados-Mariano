import { URL_API } from '../config';

async function chamar(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      ...opcoes,
      credentials: 'include',
      headers: { ...(opcoes.body ? { 'Content-Type': 'application/json' } : {}), ...(opcoes.headers || {}) },
    });
  } catch {
    throw new Error('Não foi possível falar com o servidor.');
  }

  let corpo = null;
  try { corpo = await resposta.json(); } catch { /* resposta sem JSON */ }
  if (!resposta.ok) {
    const erro = new Error(corpo?.mensagem || `A API respondeu ${resposta.status}.`);
    erro.status = resposta.status;
    erro.erros = corpo?.erros || [];
    throw erro;
  }
  return corpo;
}

function query(parametros = {}) {
  const q = new URLSearchParams();
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== null && valor !== '') q.set(chave, valor);
  }
  const texto = q.toString();
  return texto ? `?${texto}` : '';
}

export const listarProdutos = (filtros = {}) => chamar(`/produtos${query(filtros)}`);
export const obterProduto = (id) => chamar(`/produtos/${encodeURIComponent(id)}`);
export const buscarProdutos = (tipo, termo) => chamar(`/produtos/buscar?tipo=${encodeURIComponent(tipo)}&termo=${encodeURIComponent(termo)}`);
export const listarOpcoesDeFiltro = () => chamar('/produtos/categorias');
export const verificarSaude = () => chamar('/health');
export const adicionarProduto = (produto) => chamar('/produtos', { method: 'POST', body: JSON.stringify(produto) });
export const atualizarProduto = (id, produto) => chamar(`/produtos/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(produto) });
export const removerProduto = (id) => chamar(`/produtos/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const entrar = (senha) => chamar('/auth/login', { method: 'POST', body: JSON.stringify({ senha }) });
export const sair = () => chamar('/auth/logout', { method: 'POST' });
export const obterSessao = () => chamar('/auth/sessao');
