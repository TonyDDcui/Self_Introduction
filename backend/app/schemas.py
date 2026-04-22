from datetime import datetime
from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    code: str
    message: str


class MeResponse(BaseModel):
    authenticated: bool
    id: int | None = None
    role: str | None = None
    username: str | None = None
    avatar_url: str | None = None


class ChatMessage(BaseModel):
    role: str
    content: str


class AiChatRequest(BaseModel):
    model: str | None = None
    messages: list[ChatMessage] = Field(default_factory=list)
    temperature: float | None = None


class AiChatResponse(BaseModel):
    id: str | None = None
    model: str
    content: str
    finish_reason: str | None = None


class BillingStatusResponse(BaseModel):
    plan: str
    status: str
    today_used: int
    today_limit: int | None
    today_remaining: int | None
    expires_at: datetime | None
    is_admin: bool


class AdminUserItem(BaseModel):
    id: int
    role: str
    created_at: datetime
    last_login_at: datetime | None
    providers: list[str]
    username: str | None
    subscription_status: str


class AdminSubscriptionUpdateRequest(BaseModel):
    status: str
    plan: str = "pro"
    expires_at: datetime | None = None


class AdminUsageResponse(BaseModel):
    user_id: int
    rows: list[dict]

