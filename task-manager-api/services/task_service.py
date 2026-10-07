from datetime import datetime
from models.task import Task

def serialize_task(task):
    data = task.to_dict()
    data["overdue"] = task.is_overdue()
    return data

def validate_task_payload(data):
    if not data or not data.get("title"):
        return "Título é obrigatório"
    if not 3 <= len(data["title"]) <= 200:
        return "Título deve ter entre 3 e 200 caracteres"
    if data.get("status", "pending") not in {"pending", "in_progress", "done", "cancelled"}:
        return "Status inválido"
    if not 1 <= data.get("priority", 3) <= 5:
        return "Prioridade deve ser entre 1 e 5"
    return None
