from backend.agents.base import BaseAgent
from backend.llm.claude_client import ClaudeClient

_SYSTEM = """You are a senior cloud architect explaining architectural decisions to a technical audience.

Given the selected template, configuration, and business requirements, produce a comprehensive reasoning log.

Return ONLY a valid JSON object:
{
  "template_selection": "2-3 sentences explaining why this architecture pattern was chosen",
  "component_choices": [
    "Reason for load balancer: ...",
    "Reason for auto-scaling: ...",
    "Reason for database choice: ...",
    "Reason for caching layer: ..."
  ],
  "trade_offs": [
    "Trade-off 1: ...",
    "Trade-off 2: ..."
  ],
  "alternatives_considered": [
    "Alternative: [name] - rejected because ...",
    "Alternative: [name] - rejected because ..."
  ],
  "summary": {
    "architecture_type": "human-readable architecture name",
    "components": ["component1", "component2"],
    "estimated_monthly_cost": "$X - $Y/month",
    "deployment_complexity": "Low|Medium|High",
    "key_highlights": ["highlight1", "highlight2", "highlight3"]
  }
}

Be specific and reference actual business requirements (users, uptime, domain) in your reasoning.
estimated_monthly_cost should be a realistic range based on the scale requirements."""


class ReasoningAgent(BaseAgent):
    def __init__(self, client: ClaudeClient) -> None:
        super().__init__(client)

    async def run(self, template_result: dict, requirements: dict) -> dict:
        import json

        context = (
            f"Selected Template: {template_result.get('template_name')}\n"
            f"Template ID: {template_result.get('template_id')}\n"
            f"Configuration Variables: {json.dumps(template_result.get('configuration', {}).get('variables', {}), indent=2)}\n\n"
            f"Business Requirements:\n{json.dumps(requirements, indent=2)}"
        )

        raw = await self.client.generate_json(
            system_prompt=_SYSTEM,
            user_message=f"Generate architecture reasoning:\n\n{context}",
            max_tokens=2048,
        )

        summary = raw.get("summary", {})
        return {
            "reasoning": {
                "template_selection": raw.get("template_selection", ""),
                "component_choices": raw.get("component_choices", []),
                "trade_offs": raw.get("trade_offs", []),
                "alternatives_considered": raw.get("alternatives_considered", []),
            },
            "summary": {
                "architecture_type": summary.get("architecture_type", template_result.get("template_name", "")),
                "components": summary.get("components", []),
                "estimated_monthly_cost": summary.get("estimated_monthly_cost", "Estimate unavailable"),
                "deployment_complexity": summary.get("deployment_complexity", "Medium"),
                "key_highlights": summary.get("key_highlights", []),
            },
        }
