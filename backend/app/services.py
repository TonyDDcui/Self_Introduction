from __future__ import annotations

import datetime as dt
from collections import defaultdict, deque
from typing import Deque
from zoneinfo import ZoneInfo

import httpx


ASIA_SHANGHAI = ZoneInfo("Asia/Shanghai")


def now_shanghai_date() -> dt.date:
    return dt.datetime.now(ASIA_SHANGHAI).date()


def should_retry_ollama(exc: Exception) -> bool:
    if isinstance(exc, httpx.TimeoutException):
        return True
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code >= 500
    if isinstance(exc, httpx.ConnectError):
        return True
    return False


class Limiter:
    """
    Simple in-memory limiter for MVP.
    In production multi-instance deployment, replace with Redis.
    """

    def __init__(self, user_limit_per_min: int, ip_limit_per_min: int) -> None:
        self.user_limit = user_limit_per_min
        self.ip_limit = ip_limit_per_min
        self.user_events: dict[str, Deque[dt.datetime]] = defaultdict(deque)
        self.ip_events: dict[str, Deque[dt.datetime]] = defaultdict(deque)

    @staticmethod
    def _trim(queue: Deque[dt.datetime], now: dt.datetime) -> None:
        one_minute_ago = now - dt.timedelta(minutes=1)
        while queue and queue[0] < one_minute_ago:
            queue.popleft()

    def _hit(self, bucket: dict[str, Deque[dt.datetime]], key: str, limit: int) -> None:
        now = dt.datetime.now(dt.timezone.utc)
        q = bucket[key]
        self._trim(q, now)
        if len(q) >= limit:
            raise ValueError("RATE_LIMIT_EXCEEDED")
        q.append(now)

    def hit_user(self, user_id: int) -> None:
        self._hit(self.user_events, str(user_id), self.user_limit)

    def hit_ip(self, ip: str) -> None:
        self._hit(self.ip_events, ip, self.ip_limit)
