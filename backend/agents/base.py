from abc import ABC, abstractmethod
from typing import Any
from backend.llm.claude_client import ClaudeClient


class BaseAgent(ABC):
    def __init__(self, client: ClaudeClient) -> None:
        self.client = client

    @abstractmethod
    async def run(self, **kwargs) -> dict[str, Any]:
        ...
