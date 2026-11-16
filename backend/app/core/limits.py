
from collections import defaultdict
from threading import Lock
from time import time

from fastapi import HTTPException, Request

from app.core.config import get_settings


_counters = defaultdict(lambda: [0, 0.0])
_lock = Lock()


def throttle(
    request: Request,
    route: str,
    limit: int,
    seconds: int
):
    settings = get_settings()

    ip = (
        request.client.host
        if request.client
        else "unknown"
    )

    key = (
        f"qevn:rl:{route}:{ip}:"
        f"{int(time() / seconds)}"
    )

    if settings.rate_limit_storage_url.startswith("redis"):
        from redis import Redis

        redis = Redis.from_url(
            settings.rate_limit_storage_url,
            socket_timeout=2
        )

        count = redis.incr(key)

        if count == 1:
            redis.expire(key, seconds + 2)

    else:
        with _lock:
            if len(_counters) > 20000:
                _counters.clear()

            item = _counters[key]
            item[0] += 1
            item[1] = time()
            count = item[0]

    if count > limit:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded"
        )
