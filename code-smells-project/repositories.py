"""Persistence boundary for the legacy store.

The public functions remain compatible with the original model module so existing
clients can migrate incrementally.
"""

from models import (
    atualizar_produto, buscar_produtos, criar_pedido, criar_produto,
    criar_usuario, deletar_produto, get_pedidos_usuario, get_produto_por_id,
    get_todos_pedidos, get_todos_produtos, get_todos_usuarios,
    get_usuario_por_id, login_usuario, relatorio_vendas,
    atualizar_status_pedido,
)

__all__ = [name for name in globals() if not name.startswith("_")]
