from __future__ import annotations

import datetime as dt
import json
from typing import Any

import httpx
from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .db import Base, engine, get_db
from .models import Identity, Provider, Subscription, SubscriptionStatus, User, UserRole, UsageDaily
from .schemas import (
    AdminSubscriptionUpdateRequest,
    AdminUsageResponse,
    AdminUserItem,
    AiChatRequest,
    AiChatResponse,
    BillingStatusResponse,
    ErrorResponse,
    MeResponse,
)
from .security import create_access_token, hash_token, verify_access_token
from .services import (
    can_use_ai,
    consume_usage_after_success,
    create_refresh_token as persist_refresh_token,
    get_usage_status,
    revoke_refresh_token,
    should_retry_ollama,
    write_admin_audit,
)
from .rate_limit import limiter

app = FastAPI(title=settings.app_name)
Base.metadata.create_all(bind=engine)


def get_client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for", "")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def error_json(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=ErrorResponse(code=code, message=message).model_dump(),
    )


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    common = {
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": "lax",
        "path": "/api",
        "domain": settings.cookie_domain,
    }
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.access_token_minutes * 60,
        **common,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.refresh_token_days * 24 * 3600,
        **common,
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/api", domain=settings.cookie_domain)
    response.delete_cookie("refresh_token", path="/api", domain=settings.cookie_domain)


def get_current_user(
    request: Request,
    db: Session,
    *,
    required: bool = True,
) -> User | None:
    access = request.cookies.get("access_token")
    if not access:
        if required:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return None
    try:
        payload = verify_access_token(access)
    except Exception:  # noqa: BLE001
        if required:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return None
    if payload.get("type") != "access" or "sub" not in payload:
        if required:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return None
    user = db.get(User, int(payload["sub"]))
    if required and not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return user


def require_admin(request: Request, db: Session) -> User:
    user = get_current_user(request, db, required=True)
    assert user is not None
    if user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return user


@app.get("/api/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/auth/google/login")
def google_login_placeholder():
    return error_json(501, "NOT_ENABLED", "Google login is reserved but not enabled in MVP.")


@app.get("/api/auth/google/callback")
def google_callback_placeholder():
    return error_json(501, "NOT_ENABLED", "Google callback is reserved but not enabled in MVP.")


@app.get("/api/auth/wechat/login")
def wechat_login_placeholder():
    return error_json(501, "NOT_ENABLED", "WeChat login is reserved but not enabled in MVP.")


@app.get("/api/auth/wechat/callback")
def wechat_callback_placeholder():
    return error_json(501, "NOT_ENABLED", "WeChat callback is reserved but not enabled in MVP.")


@app.get("/api/auth/github/login")
def github_login() -> RedirectResponse:
    if not settings.github_client_id:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    redirect_uri = f"{settings.app_url}/api/auth/github/callback"
    state = hash_token(f"{settings.secret_key}:{dt.datetime.utcnow().timestamp()}")[:24]
    url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={settings.github_client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&state={state}"
        "&scope=read:user user:email"
    )
    return RedirectResponse(url=url, status_code=302)


@app.get("/api/auth/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)) -> RedirectResponse:
    if not settings.github_client_id or not settings.github_client_secret:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")

    async with httpx.AsyncClient(timeout=20) as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"accept": "application/json"},
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
            },
        )
        token_res.raise_for_status()
        gh_access = token_res.json().get("access_token")
        if not gh_access:
            raise HTTPException(status_code=400, detail="Invalid GitHub oauth response")

        user_res = await client.get(
            "https://api.github.com/user",
            headers={"authorization": f"Bearer {gh_access}"},
        )
        user_res.raise_for_status()
        gh_user = user_res.json()

        emails_res = await client.get(
            "https://api.github.com/user/emails",
            headers={"authorization": f"Bearer {gh_access}"},
        )
        primary_email: str | None = None
        if emails_res.status_code == 200:
            emails = emails_res.json()
            for row in emails:
                if row.get("primary") and row.get("verified"):
                    primary_email = row.get("email")
                    break
            if not primary_email and emails:
                primary_email = emails[0].get("email")

    provider_user_id = str(gh_user["id"])
    username = str(gh_user.get("login") or "")
    avatar_url = gh_user.get("avatar_url")
    identity = db.execute(
        select(Identity).where(
            Identity.provider == Provider.github,
            Identity.provider_user_id == provider_user_id,
        )
    ).scalar_one_or_none()

    user: User | None = None
    if identity:
        user = db.get(User, identity.user_id)
    else:
        if primary_email:
            existing = db.execute(select(Identity).where(Identity.email == primary_email)).scalars().first()
            if existing:
                user = db.get(User, existing.user_id)
        if not user:
            role = UserRole.admin if username.lower() in settings.admin_set else UserRole.user
            user = User(role=role)
            db.add(user)
            db.flush()
            db.add(
                Subscription(
                    user_id=user.id,
                    plan="free",
                    status=SubscriptionStatus.none,
                )
            )
        db.add(
            Identity(
                user_id=user.id,
                provider=Provider.github,
                provider_user_id=provider_user_id,
                email=primary_email,
                username=username,
                avatar_url=avatar_url,
            )
        )

    if not user:
        raise HTTPException(status_code=500, detail="Unable to resolve user")

    user.last_login_at = dt.datetime.now(dt.timezone.utc)
    if username.lower() in settings.admin_set:
        user.role = UserRole.admin

    refresh_raw = persist_refresh_token(db, user.id)
    access = create_access_token(user.id)
    db.commit()

    response = RedirectResponse(url=settings.frontend_url, status_code=302)
    set_auth_cookies(response, access, refresh_raw)
    return response


@app.get("/api/me", response_model=MeResponse)
def me(request: Request, db: Session = Depends(get_db)) -> MeResponse:
    user = get_current_user(request, db, required=False)
    if not user:
        return MeResponse(authenticated=False)
    identity = db.execute(
        select(Identity).where(Identity.user_id == user.id).order_by(Identity.id.asc())
    ).scalars().first()
    return MeResponse(
        authenticated=True,
        id=user.id,
        role=user.role.value,
        username=identity.username if identity else None,
        avatar_url=identity.avatar_url if identity else None,
    )


@app.post("/api/auth/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)) -> dict[str, str]:
    refresh = request.cookies.get("refresh_token")
    if refresh:
        revoke_refresh_token(db, refresh)
        db.commit()
    clear_auth_cookies(response)
    return {"status": "ok"}


@app.get("/api/billing/status", response_model=BillingStatusResponse)
def billing_status(request: Request, db: Session = Depends(get_db)) -> BillingStatusResponse:
    user = get_current_user(request, db, required=True)
    assert user is not None
    status_obj = get_usage_status(db, user)
    db.commit()
    return BillingStatusResponse(**status_obj)


def enforce_rate_limit(request: Request, user: User) -> None:
    ip = get_client_ip(request)
    try:
        limiter.hit_user(user.id)
        limiter.hit_ip(ip)
    except ValueError:
        raise HTTPException(status_code=429, detail="RATE_LIMIT_EXCEEDED")


async def call_ollama(payload: dict[str, Any]) -> dict[str, Any]:
    endpoint = f"{settings.ollama_base_url}/chat/completions"
    attempt = 0
    async with httpx.AsyncClient(timeout=settings.ollama_timeout_seconds) as client:
        while True:
            attempt += 1
            try:
                res = await client.post(endpoint, json=payload)
                if res.status_code >= 500 and attempt == 1:
                    continue
                res.raise_for_status()
                return res.json()
            except Exception as exc:  # noqa: BLE001
                if attempt == 1 and should_retry_ollama(exc):
                    continue
                raise


@app.post("/api/ai/chat", response_model=AiChatResponse)
async def ai_chat(body: AiChatRequest, request: Request, db: Session = Depends(get_db)) -> AiChatResponse:
    user = get_current_user(request, db, required=True)
    assert user is not None
    enforce_rate_limit(request, user)
    allowed, status_obj = can_use_ai(db, user)
    if not allowed:
        db.commit()
        return JSONResponse(
            status_code=402,
            content=ErrorResponse(
                code="SUBSCRIPTION_REQUIRED",
                message="Daily free quota exceeded, subscription required.",
            ).model_dump(),
        )

    payload = {
        "model": body.model or settings.ollama_model,
        "messages": [m.model_dump() for m in body.messages[-10:]],
        "temperature": body.temperature,
        "stream": False,
    }
    try:
        ollama_json = await call_ollama(payload)
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI upstream timeout")
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="AI upstream error")

    choice0 = (ollama_json.get("choices") or [{}])[0]
    message = choice0.get("message") or {}
    content = str(message.get("content") or "")
    finish_reason = choice0.get("finish_reason")

    if content:
        consume_usage_after_success(db, user)
    db.commit()

    return AiChatResponse(
        id=ollama_json.get("id"),
        model=ollama_json.get("model") or (body.model or settings.ollama_model),
        content=content,
        finish_reason=finish_reason,
        usage=status_obj["today_used"] if isinstance(status_obj.get("today_used"), int) else 0,
    )


@app.get("/api/admin/users", response_model=list[AdminUserItem])
def admin_users(
    request: Request,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    provider: str | None = None,
    role: str | None = None,
    db: Session = Depends(get_db),
) -> list[AdminUserItem]:
    _admin = require_admin(request, db)
    stmt = select(User).order_by(User.created_at.desc())
    if role in {"admin", "user"}:
        stmt = stmt.where(User.role == UserRole(role))
    users = db.execute(stmt).scalars().all()
    out: list[AdminUserItem] = []
    for user in users:
        identities = db.execute(select(Identity).where(Identity.user_id == user.id)).scalars().all()
        providers = [i.provider.value for i in identities]
        if provider and provider not in providers:
            continue
        sub = db.get(Subscription, user.id)
        out.append(
            AdminUserItem(
                id=user.id,
                role=user.role.value,
                created_at=user.created_at,
                last_login_at=user.last_login_at,
                providers=providers,
                username=identities[0].username if identities else None,
                subscription_status=sub.status.value if sub else "none",
            )
        )
    start = (page - 1) * page_size
    return out[start : start + page_size]


@app.post("/api/admin/users/{user_id}/subscription")
def admin_set_subscription(
    user_id: int,
    body: AdminSubscriptionUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    admin = require_admin(request, db)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    row = db.get(Subscription, user_id)
    if not row:
        row = Subscription(user_id=user_id, plan="free", status=SubscriptionStatus.none)
        db.add(row)
        db.flush()
    before = {"plan": row.plan.value, "status": row.status.value, "expires_at": str(row.expires_at)}
    row.plan = body.plan
    row.status = body.status
    row.expires_at = body.expires_at
    row.updated_at = dt.datetime.now(dt.timezone.utc)
    after = {"plan": row.plan.value, "status": row.status.value, "expires_at": str(row.expires_at)}
    write_admin_audit(
        db,
        admin_user_id=admin.id,
        target_user_id=user_id,
        action="subscription.update",
        old_value=json.dumps(before, ensure_ascii=True),
        new_value=json.dumps(after, ensure_ascii=True),
    )
    db.commit()
    return {"status": "ok"}


@app.get("/api/admin/users/{user_id}/usage", response_model=AdminUsageResponse)
def admin_usage(user_id: int, request: Request, db: Session = Depends(get_db)) -> AdminUsageResponse:
    _admin = require_admin(request, db)
    rows = db.execute(
        select(UsageDaily).where(UsageDaily.user_id == user_id).order_by(UsageDaily.date.desc()).limit(30)
    ).scalars().all()
    return AdminUsageResponse(user_id=user_id, rows=[{"date": str(r.date), "count": r.count} for r in rows])


@app.get("/api/blog/latest")
async def blog_latest() -> list[dict[str, Any]]:
    url = f"{settings.wp_api_base}/posts"
    params = {"per_page": 5, "_fields": "id,date,link,title"}
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            res = await client.get(url, params=params)
            res.raise_for_status()
        except httpx.HTTPError:
            return []
    posts = []
    for item in res.json():
        posts.append(
            {
                "id": item.get("id"),
                "date": item.get("date"),
                "url": item.get("link"),
                "title": (item.get("title") or {}).get("rendered", ""),
            }
        )
    return posts
