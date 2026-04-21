from fastapi import APIRouter, HTTPException
from backend.utils.template_loader import get_all_templates, get_template_by_id

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("")
async def list_templates():
    templates = get_all_templates()
    return {
        "count": len(templates),
        "templates": [
            {
                "id": t["id"],
                "name": t["name"],
                "description": t["description"],
                "use_cases": t.get("use_cases", []),
                "scale": t.get("scale", []),
            }
            for t in templates
        ],
    }


@router.get("/{template_id}")
async def get_template(template_id: str):
    template = get_template_by_id(template_id)
    if not template:
        raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
    return template
