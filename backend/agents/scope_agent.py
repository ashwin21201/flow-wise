from backend.agents.base import BaseAgent
from backend.llm.claude_client import ClaudeClient

_SYSTEM = """You are an expert cloud architect. Analyze the user's application description and extract key signals.

Return ONLY a valid JSON object with exactly these fields:
{
  "app_type": "one of: web|mobile-backend|api|data-pipeline|microservices|batch-processing|real-time|iot|saas",
  "stack": ["array of detected technologies - only what is mentioned or strongly implied"],
  "scale_hint": "one of: small|medium|large|enterprise",
  "domain": "one of: e-commerce|healthcare|fintech|social-media|iot|saas|education|media|logistics|general",
  "confidence_score": 0.0,
  "detected_signals": ["list of specific things you detected from the description"]
}

Scale guide: small=<1k users, medium=1k-100k, large=100k-1M, enterprise=>1M.
Do NOT hallucinate technologies not mentioned or clearly implied.
confidence_score reflects how specific the description is (0.0=vague, 1.0=very detailed)."""


class ScopeAgent(BaseAgent):
    def __init__(self, client: ClaudeClient) -> None:
        super().__init__(client)

    async def run(self, user_input: str) -> dict:
        raw = await self.client.generate_json(
            system_prompt=_SYSTEM,
            user_message=f"Analyze this application description:\n\n{user_input}",
        )
        return {
            "app_type": raw.get("app_type", "web"),
            "stack": raw.get("stack", []),
            "scale_hint": raw.get("scale_hint", "medium"),
            "domain": raw.get("domain", "general"),
            "confidence_score": float(raw.get("confidence_score", 0.5)),
            "detected_signals": raw.get("detected_signals", []),
        }
