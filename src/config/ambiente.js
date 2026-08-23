const path = require('path');
const dotenv = require('dotenv');

const carregarAmbiente = () => {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    return process.env;
};

module.exports = { carregarAmbiente };
