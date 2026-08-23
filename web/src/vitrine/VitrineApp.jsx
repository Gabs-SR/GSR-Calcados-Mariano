import { useEffect, useState } from 'react';
import { buscarProdutos, listarOpcoesDeFiltro, listarProdutos } from '../api/produtos';
import { LOJA, ORDENACOES, WHATSAPP } from '../config';
import SemImagem from './SemImagem';
import './vitrine.css';

const TODOS = 'Todos';
const DESCRICAO_PADRAO = 'Fale com a loja para confirmar numeração e cor disponíveis.';

const whatsappLink = (produto) => {
  const texto = [
    'Olá, equipe Calçados Mariano!', '',
    'Tenho interesse neste modelo:',
    `Produto: ${produto.nome}`,
    `Cor: ${produto.cor || 'Única'}`,
    `Numeração: ${produto.numeracao || 'Consultar'}`,
    `Ref: ${produto.id}`, '',
    'Gostaria de confirmar a disponibilidade.',
  ].join('\n');
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
};

function Foto({ produto }) {
  const [falhou, setFalhou] = useState(false);
  if (!produto.imagem_url || falhou) return <SemImagem />;
  return <img src={produto.imagem_url} alt={produto.nome} onError={() => setFalhou(true)} />;
}

export default function VitrineApp() {
  const [produtos, setProdutos] = useState([]);
  const [publicos, setPublicos] = useState([]);
  const [publico, setPublico] = useState(TODOS);
  const [ordenar, setOrdenar] = useState('nome');
  const [buscaDigitada, setBuscaDigitada] = useState('');
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [escuro, setEscuro] = useState(false);

  useEffect(() => document.body.classList.toggle('dark-mode', escuro), [escuro]);

  useEffect(() => {
    listarOpcoesDeFiltro()
      .then((dados) => setPublicos(dados.publicos || []))
      .catch(() => setPublicos([]));
  }, []);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro('');

    const requisicao = busca
      ? buscarProdutos('nome', busca).then((dados) => ({ produtos: dados }))
      : listarProdutos({ ordenar, ...(publico !== TODOS ? { publico } : {}) });

    requisicao
      .then((dados) => { if (!cancelado) setProdutos(Array.isArray(dados.produtos) ? dados.produtos : []); })
      .catch((e) => { if (!cancelado) { setErro(e.message || 'Não foi possível carregar os produtos.'); setProdutos([]); } })
      .finally(() => { if (!cancelado) setCarregando(false); });

    return () => { cancelado = true; };
  }, [ordenar, publico, busca]);

  const pesquisar = (e) => { e.preventDefault(); setBusca(buscaDigitada.trim()); };
  const limpar = () => { setBuscaDigitada(''); setBusca(''); };

  return (
    <div className="site-wrapper">
      <div className="top-bar-security">
        <span>Atendimento pelo WhatsApp</span><span>Retirada nas lojas de {LOJA.cidade}</span><span>Consulte numeração e cor antes de vir</span>
      </div>

      <header className="main-header">
        <div className="header-top-container">
          <div className="header-container">
            <h1 className="logo">CALÇADOS <span>MARIANO</span></h1>
            <p className="slogan">A loja do Antônio Lasmar</p>
          </div>
          <label className="theme-switch-wrapper">
            <input type="checkbox" checked={escuro} onChange={(e) => setEscuro(e.target.checked)} />
            <span>{escuro ? 'Escuro' : 'Claro'}</span>
          </label>
        </div>

        <form onSubmit={pesquisar} className="search-bar-container">
          <input type="search" aria-label="Pesquisar calçado pelo nome" placeholder="Pesquisar calçado pelo nome..." value={buscaDigitada} onChange={(e) => setBuscaDigitada(e.target.value)} />
          <button type="submit">Buscar</button>
          {busca && <button type="button" onClick={limpar}>Limpar</button>}
        </form>

        <div className="header-actions-bar">
          <nav className="nav-categorias">
            {[TODOS, ...publicos].map((item) => (
              <button key={item} type="button" className={`btn-categoria ${publico === item ? 'ativo' : ''}`} onClick={() => { limpar(); setPublico(item); }}>{item}</button>
            ))}
          </nav>
          <select value={ordenar} onChange={(e) => setOrdenar(e.target.value)} disabled={Boolean(busca)} className="select-ordenacao" aria-label="Ordenar os produtos">
            {ORDENACOES.map((item) => <option key={item.valor} value={item.valor}>{item.rotulo}</option>)}
          </select>
        </div>
      </header>

      <main className="container">
        <div className="section-title">
          <h2>{busca ? `Resultados para "${busca}"` : `Catálogo de produtos (${publico})`}</h2>
          <p>Consulte tamanhos e cores, e tire dúvidas direto com a nossa equipe</p>
        </div>

        <div className="grid-produtos">
          {carregando && <p className="aviso-vitrine">Carregando os produtos...</p>}
          {!carregando && erro && <p className="aviso-vitrine">{erro}</p>}
          {!carregando && !erro && produtos.length === 0 && <p className="aviso-vitrine">Nenhum calçado encontrado. Fale com a loja pelo WhatsApp {LOJA.whatsappVisivel}.</p>}
          {!carregando && !erro && produtos.map((produto) => {
            const quantidade = Number(produto.quantidade) || 0;
            return (
              <button type="button" className="card" key={produto.id} onClick={() => setSelecionado(produto)}>
                {quantidade > 0 && quantidade <= 3 && <div className="badge-ultimos-pares">Últimos pares!</div>}
                {quantidade === 0 && <div className="badge-esgotado">Esgotado</div>}
                <Foto produto={produto} />
                <div className="card-info">
                  <span className="marca">{produto.marca || produto.categoria}</span>
                  <h2>{produto.nome}</h2>
                  <p className="tamanhos">Numeração: {produto.numeracao}</p>
                  <p className="cor-card">Cor: <strong>{produto.cor || 'Única'}</strong></p>
                  <span className="card-acao">Ver detalhes</span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {selecionado && (
        <div className="modal-overlay" onClick={() => setSelecionado(null)}>
          <div className="modal-content" role="dialog" aria-label={selecionado.nome} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelecionado(null)} aria-label="Fechar">×</button>
            <div className="modal-grid">
              <div className="modal-img-container"><Foto produto={selecionado} /></div>
              <div className="modal-details">
                <span className="marca">{selecionado.marca || selecionado.categoria}</span>
                <h2>{selecionado.nome}</h2>
                <div className="modal-secao-info">
                  <p><strong>Numeração:</strong> {selecionado.numeracao}</p>
                  <p><strong>Cor:</strong> {selecionado.cor || 'Única'}</p>
                  <p><strong>Em estoque:</strong> {Number(selecionado.quantidade) === 0 ? 'Produto esgotado' : selecionado.quantidade}</p>
                  <p><strong>Detalhes:</strong> {selecionado.descricao || DESCRICAO_PADRAO}</p>
                </div>
                <a href={whatsappLink(selecionado)} target="_blank" rel="noreferrer" className="btn-whatsapp">Consultar no WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-col"><h3>{LOJA.nome}</h3><p>Tradição e qualidade em calçados para toda a família.</p></div>
          <div className="footer-col"><h3>Nossas lojas em {LOJA.cidade}</h3>{LOJA.unidades.map((u) => <p key={u.rotulo}>{u.rotulo}: {u.telefone}</p>)}<p>WhatsApp: {LOJA.whatsappVisivel}</p></div>
          <div className="footer-col"><h3>Como funciona</h3><p>A vitrine mostra o que temos em estoque.</p><p>A conversa e a compra acontecem no WhatsApp ou na loja.</p><p>Passe para provar antes de levar.</p></div>
        </div>
        <div className="footer-bottom"><p>© 2026 {LOJA.nome}.</p></div>
      </footer>
    </div>
  );
}
