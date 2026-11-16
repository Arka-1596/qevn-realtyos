
from openai import OpenAI

from app.core.config import get_settings


settings = get_settings()

if not settings.ai_provider_api_key:
    raise SystemExit(
        "Please configure AI_PROVIDER_API_KEY in .env"
    )

client = OpenAI(
    api_key=settings.ai_provider_api_key,
    base_url=settings.ai_provider_base_url,
    timeout=20,
    max_retries=0
)

try:
    response = client.chat.completions.create(
        model=settings.ai_model,
        messages=[
            {
                "role": "user",
                "content": (
                    "Reply exactly: QEVN AI connection successful"
                )
            }
        ]
    )

    print(
        response.choices[0].message.content
    )

except Exception as exc:
    print(
        "AI provider connection failed:",
        type(exc).__name__
    )
    raise SystemExit(1)
