"""محدودکننده‌ی ساده‌ی پنجره‌ی لغزان در حافظه (per-process)."""
from __future__ import annotations

import threading
import time
from collections import deque


class SlidingWindowLimiter:
    def __init__(self, max_events: int, window_seconds: float) -> None:
        self.max_events = max_events
        self.window_seconds = window_seconds
        self._events: dict[str, deque[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str, now: float | None = None) -> bool:
        now = time.monotonic() if now is None else now
        cutoff = now - self.window_seconds
        with self._lock:
            queue = self._events.setdefault(key, deque())
            while queue and queue[0] <= cutoff:
                queue.popleft()
            if len(queue) >= self.max_events:
                return False
            queue.append(now)
            return True
