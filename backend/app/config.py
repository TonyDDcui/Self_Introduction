from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = Field(default="development", alias="APP_ENV")
    app_name: str = Field(default="cuizhexiao-api", alias="APP_NAME")
    app_url: str = Field(default="http://localhost:8000", alias="APP_URL")
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    secret_key: str = Field(default="replace-me", alias="SECRET_KEY")
    database_url: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/czx",
        alias="DATABASE_URL",
    )

    github_client_id: str = Field(default="", alias="GITHUB_CLIENT_ID")
    github_client_secret: str = Field(default="", alias="GITHUB_CLIENT_SECRET")
    github_admin_whitelist: str = Field(default="", alias="GITHUB_ADMIN_WHITELIST")

    ollama_base_url: str = Field(
        default="http://localhost:11434/v1", alias="OLLAMA_BASE_URL"
    )
    ollama_model: str = Field(default="gemma4:e4b", alias="OLLAMA_MODEL")
    ollama_timeout_seconds: int = Field(default=40, alias="OLLAMA_TIMEOUT_SECONDS")

    access_token_minutes: int = Field(default=15, alias="ACCESS_TOKEN_MINUTES")
    refresh_token_days: int = Field(default=30, alias="REFRESH_TOKEN_DAYS")
    free_daily_limit: int = Field(default=5, alias="FREE_DAILY_LIMIT")
    user_rate_limit_per_min: int = Field(default=5, alias="USER_RATE_LIMIT_PER_MIN")
    ip_rate_limit_per_min: int = Field(default=5, alias="IP_RATE_LIMIT_PER_MIN")
    cookie_secure: bool = Field(default=True, alias="COOKIE_SECURE")
    cookie_domain: str | None = Field(default=None, alias="COOKIE_DOMAIN")

    wp_api_base: str = Field(default="http://localhost:8080/wp-json/wp/v2", alias="WP_API_BASE")

    @property
    def admin_set(self) -> set[str]:
        return {
            item.strip().lower()
            for item in self.github_admin_whitelist.split(",")
            if item.strip()
        }


settings = Settings()
