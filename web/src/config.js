export const URL_API = import.meta.env.VITE_API_URL || 'https://calcados-mariano.onrender.com';
export const PUBLICOS = ['Masculino', 'Feminino', 'Infantil', 'Unissex'];
export const ORDENACOES = [
  { valor: 'nome', rotulo: 'Nome: A - Z' },
  { valor: 'nome_desc', rotulo: 'Nome: Z - A' },
  { valor: 'recentes', rotulo: 'Cadastrados por último' },
  { valor: 'quantidade', rotulo: 'Menor estoque' },
  { valor: 'quantidade_desc', rotulo: 'Maior estoque' },
];
export const WHATSAPP = import.meta.env.VITE_WHATSAPP || '553798414547';
export const LOJA = {
  nome: 'Calçados Mariano',
  cidade: 'Bambuí (MG)',
  whatsappVisivel: '(37) 9841-4547',
  unidades: [
    { rotulo: 'Matriz', telefone: '(37) 3431-2762' },
    { rotulo: 'Filial', telefone: '(37) 3431-2270' },
  ],
};
