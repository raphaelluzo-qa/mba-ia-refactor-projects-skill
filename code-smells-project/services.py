"""Domain validation and orchestration for the e-commerce API."""

VALID_CATEGORIES = {"informatica", "moveis", "vestuario", "geral", "eletronicos", "livros"}
VALID_ORDER_STATUSES = {"pendente", "aprovado", "enviado", "entregue", "cancelado"}

def validate_product(data):
    if not data:
        return "Dados inválidos"
    for field, label in (("nome", "Nome"), ("preco", "Preço"), ("estoque", "Estoque")):
        if field not in data:
            return f"{label} é obrigatório"
    if not isinstance(data["nome"], str) or not 2 <= len(data["nome"]) <= 200:
        return "Nome deve ter entre 2 e 200 caracteres"
    if not isinstance(data["preco"], (int, float)) or data["preco"] < 0:
        return "Preço não pode ser negativo"
    if not isinstance(data["estoque"], int) or data["estoque"] < 0:
        return "Estoque não pode ser negativo"
    if data.get("categoria", "geral") not in VALID_CATEGORIES:
        return "Categoria inválida"
    return None

