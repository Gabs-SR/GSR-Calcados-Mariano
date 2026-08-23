const crypto = require('crypto');

const senha = process.argv[2];
if (!senha) {
    console.error('Informe a senha: npm run db:hash -- "minha senha"');
    process.exit(1);
}
if (senha.length < 10) {
    console.error('Use uma senha com pelo menos 10 caracteres.');
    process.exit(1);
}

const sal = crypto.randomBytes(16);
const hash = crypto.scryptSync(senha, sal, 64);
console.log(`ADMIN_SENHA_HASH=scrypt$${sal.toString('hex')}$${hash.toString('hex')}`);
console.log(`SESSAO_SEGREDO=${crypto.randomBytes(32).toString('hex')}`);
