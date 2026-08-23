export default function SemImagem({ className = '' }) {
  return (
    <div className={`sem-imagem ${className}`} aria-label="Produto sem imagem">
      <span>Sem imagem</span>
    </div>
  );
}
