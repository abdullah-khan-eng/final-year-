import os


class Config:

    SECRET_KEY = "AI_Learning_Assistant_2026"

    MYSQL_HOST = "localhost"
    MYSQL_USER = "root"
    MYSQL_PASSWORD = ""
    MYSQL_DB = "ai_learning_assistant"

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    GEMINI_MODEL = "gemini-2.5-flash"