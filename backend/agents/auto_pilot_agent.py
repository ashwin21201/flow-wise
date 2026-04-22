from backend.agents.base import BaseAgent
from backend.llm.claude_client import ClaudeClient

_SYSTEM = """CONTENT POLICY - MANDATORY:
You MUST refuse to process requests that contain or describe:
- Adult/sexual content, pornography, sexual services, or explicit sexual material
- Profanity, vulgar language, or obscene terms
- Hate speech, slurs, or content targeting protected groups
- Violence, weapons manufacturing, explosives, or self-harm
- Illegal activities: hacking tools, malware, fraud, credential theft, drug trafficking
- Any content involving minors in inappropriate contexts

If the user's input violates this policy, respond with ONLY this JSON:
{
  "error": "content_policy_violation",
  "message": "Request blocked: input contains disallowed content. Please remove profanity, adult content, or restricted material and try again.",
  "category": "specify: profanity|adult|hate|violence|illegal"
}

Otherwise, proceed normally with the task below.

---

You are a cloud architecture assistant. Based on the scope analysis, produce confirmed detections.

Return ONLY a valid JSON object:
{
  "confirmed_detections": {
    "app_type": "human-readable app type label",
    "stack": ["tech1", "tech2"],
    "architecture_pattern": "one of: monolith|microservices|serverless|event-driven|three-tier|two-tier",
    "session_store": "one of: stateless|redis|database|cookie",
    "deployment_model": "one of: cloud-native|containerized|serverless|hybrid"
  },
  "missing_fields": [
    {
      "id": "users",
      "label": "Expected Users",
      "question": "How many concurrent users do you expect at peak?",
      "placeholder": "e.g., 500, 10000, 1M",
      "type": "text",
      "options": []
    },
    {
      "id": "visibility",
      "label": "Visibility",
      "question": "Will this application be accessible from the internet?",
      "placeholder": "",
      "type": "select",
      "options": ["public", "internal", "both"]
    },
    {
      "id": "uptime",
      "label": "Uptime Requirement",
      "question": "What uptime level does your business need?",
      "placeholder": "",
      "type": "select",
      "options": ["99% (~87h downtime/year)", "99.9% (~8.7h/year)", "99.99% (~52m/year)", "99.999% (~5m/year)"]
    }
  ],
  "architecture_hint": "brief 1-sentence hint about likely final architecture"
}

The missing_fields MUST always be exactly these three fields in this order: users, visibility, uptime."""


class AutoPilotAgent(BaseAgent):
    def __init__(self, client: ClaudeClient) -> None:
        super().__init__(client)

    async def run(self, user_input: str, scope: dict) -> dict:
        context = (
            f"User Input: {user_input}\n"
            f"App Type: {scope.get('app_type')}\n"
            f"Stack: {scope.get('stack')}\n"
            f"Scale Hint: {scope.get('scale_hint')}\n"
            f"Domain: {scope.get('domain')}\n"
            f"Detected Signals: {scope.get('detected_signals')}"
        )
        raw = await self.client.generate_json(
            system_prompt=_SYSTEM,
            user_message=f"Generate auto-pilot init for:\n\n{context}",
            max_tokens=1024,
        )
        detections = raw.get("confirmed_detections", {})
        return {
            "confirmed_detections": {
                "app_type": detections.get("app_type", scope.get("app_type", "web")),
                "stack": detections.get("stack", scope.get("stack", [])),
                "architecture_pattern": detections.get("architecture_pattern", "three-tier"),
                "session_store": detections.get("session_store", "stateless"),
                "deployment_model": detections.get("deployment_model", "cloud-native"),
            },
            "missing_fields": raw.get("missing_fields", _default_missing_fields()),
            "architecture_hint": raw.get("architecture_hint", "A cloud-native deployment is likely optimal."),
        }


def _default_missing_fields() -> list[dict]:
    return [
        {
            "id": "users",
            "label": "Expected Users",
            "question": "How many concurrent users do you expect at peak?",
            "placeholder": "e.g., 500, 10000, 1M",
            "type": "text",
            "options": [],
        },
        {
            "id": "visibility",
            "label": "Visibility",
            "question": "Will this application be accessible from the internet?",
            "placeholder": "",
            "type": "select",
            "options": ["public", "internal", "both"],
        },
        {
            "id": "uptime",
            "label": "Uptime Requirement",
            "question": "What uptime level does your business need?",
            "placeholder": "",
            "type": "select",
            "options": ["99%", "99.9%", "99.99%", "99.999%"],
        },
    ]
