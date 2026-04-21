import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent.parent
load_dotenv(BASE_DIR / ".env", override=True)

CLAUDE_API_KEY: str = os.getenv("CLAUDE_API_KEY", "")
CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6")
TEMPLATES_PATH: Path = BASE_DIR / "templates" / "templates.json"
