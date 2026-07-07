import os


class Config:

    SECRET_KEY = "AI_Learning_Assistant_2026"

    MYSQL_HOST = "localhost"
    MYSQL_USER = "root"
    MYSQL_PASSWORD = ""
    MYSQL_DB = "ai_learning_assistant"

    ZAI_API_KEY = os.environ.get("ZAI_API_KEY", "")
    ZAI_MODEL = "glm-4.7-flash"