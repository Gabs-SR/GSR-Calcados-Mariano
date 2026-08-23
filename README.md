# Calçados Mariano

Vitrine web e API de catálogo da Calçados Mariano.

## Arquitetura

- `web/`: React + Vite, responsável pela vitrine e apresentação dos produtos.
- `src/`: API Express, autenticação e regras de negócio.
- `db/`: schema PostgreSQL usado pelo Supabase.
- PostgreSQL/Supabase é a fonte oficial dos produtos. Não há fallback para SQLite.

## Fluxo dos produtos

A vitrine consulta `GET /produtos`. O backend consulta o PostgreSQL e devolve o envelope `{ produtos, total, pagina, limite, paginas }`. Busca, filtros e ordenação também são executados no banco.

## Execução

1. Configure `.env` a partir de `.env.example`.
2. Execute `db/schema.sql` no PostgreSQL/Supabase.
3. No diretório raiz: `npm install` e `npm start`.
4. Em `web/`: `npm install` e `npm run dev`.

A API exige `DATABASE_URL`. O painel administrativo utiliza `ADMIN_SENHA_HASH` e `SESSAO_SEGREDO`.
