from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/digitalhq"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "antigravity-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: list = ["http://localhost:5173", "https://digitalhq.vercel.app"]
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
