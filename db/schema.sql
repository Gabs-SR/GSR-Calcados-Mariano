CREATE TABLE IF NOT EXISTS produtos (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT,
    numeracao TEXT,
    categoria TEXT,
    publico TEXT,
    subcategoria TEXT,
    quantidade INTEGER NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
    status_estoque TEXT,
    marca TEXT,
    cor TEXT,
    descricao TEXT,
    imagem_url TEXT,
    nome_ordenacao TEXT
);

CREATE INDEX IF NOT EXISTS idx_produtos_publico ON produtos (publico);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos (categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_numeracao ON produtos (numeracao);
CREATE INDEX IF NOT EXISTS idx_produtos_nome_ordenacao ON produtos (nome_ordenacao);
