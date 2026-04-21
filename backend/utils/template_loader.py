import json
from functools import lru_cache
from typing import Any
from backend.config import TEMPLATES_PATH


@lru_cache(maxsize=1)
def load_templates() -> dict[str, Any]:
    with open(TEMPLATES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_all_templates() -> list[dict]:
    return load_templates().get("templates", [])


def get_template_by_id(template_id: str) -> dict | None:
    for t in get_all_templates():
        if t["id"] == template_id:
            return t
    return None


def find_matching_templates(keywords: list[str], scale: str) -> list[dict]:
    results = []
    kw_lower = [k.lower() for k in keywords]
    for t in get_all_templates():
        score = 0
        for kw in kw_lower:
            if kw in [k.lower() for k in t.get("keywords", [])]:
                score += 2
            if kw in t.get("description", "").lower():
                score += 1
        if scale in t.get("scale", []):
            score += 1
        if score > 0:
            results.append({"template": t, "score": score})
    results.sort(key=lambda x: x["score"], reverse=True)
    return [r["template"] for r in results]
