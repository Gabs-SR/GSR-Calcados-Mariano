const crypto = require('crypto');

const NOME_COOKIE = 'sessao_mariano';
const DURACAO_HORAS = 12;
const PREFIXO_SCRYPT = 'scrypt';

const gerarHashDeSenha = (senha) => {
    const sal = crypto.randomBytes(16);
    const hash = crypto.scryptSync(senha, sal, 64);
    return `${PREFIXO_SCRYPT}$${sal.toString('hex')}$${hash.toString('hex')}`;
};

const senhaConfere = (senha, guardado) => {
    if (typeof senha !== 'string' || typeof guardado !== 'string') return false;
    const partes = guardado.split('$');
    if (partes.length !== 3 || partes[0] !== PREFIXO_SCRYPT) return false;
    try {
        const sal = Buffer.from(partes[1], 'hex');
        const esperado = Buffer.from(partes[2], 'hex');
        const calculado = crypto.scryptSync(senha, sal, 64);
        return esperado.length === calculado.length && crypto.timingSafeEqual(calculado, esperado);
    } catch { return false; }
};

const autenticacaoConfigurada = () => Boolean(process.env.ADMIN_SENHA_HASH && process.env.SESSAO_SEGREDO);
const assinar = (dados) => crypto.createHmac('sha256', process.env.SESSAO_SEGREDO).update(dados).digest('base64url');

const criarToken = () => {
    const dados = Buffer.from(JSON.stringify({ dono: true, expiraEm: Date.now() + DURACAO_HORAS * 3600000 })).toString('base64url');
    return `${dados}.${assinar(dados)}`;
};

const tokenValido = (token) => {
    if (!token || !autenticacaoConfigurada()) return false;
    const [dados, assinatura] = String(token).split('.');
    if (!dados || !assinatura) return false;
    const a = Buffer.from(assinar(dados));
    const b = Buffer.from(assinatura);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    try {
        const conteudo = JSON.parse(Buffer.from(dados, 'base64url').toString());
        return conteudo.dono === true && conteudo.expiraEm > Date.now();
    } catch { return false; }
};

const lerCookie = (req) => {
    const cabecalho = req.headers.cookie || '';
    const item = cabecalho.split(';').find((parte) => parte.trim().startsWith(`${NOME_COOKIE}=`));
    return item ? decodeURIComponent(item.split('=').slice(1).join('=').trim()) : undefined;
};

const gravarCookieDeSessao = (res, token) => {
    const atributos = [`${NOME_COOKIE}=${encodeURIComponent(token)}`, 'HttpOnly', 'SameSite=Lax', 'Path=/', `Max-Age=${DURACAO_HORAS * 3600}`];
    if (process.env.NODE_ENV === 'production') atributos.push('Secure');
    res.setHeader('Set-Cookie', atributos.join('; '));
};

const limparCookieDeSessao = (res) => res.setHeader('Set-Cookie', `${NOME_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
const temSessao = (req) => tokenValido(lerCookie(req));

module.exports = { NOME_COOKIE, gerarHashDeSenha, senhaConfere, autenticacaoConfigurada, criarToken, tokenValido, gravarCookieDeSessao, limparCookieDeSessao, temSessao };
