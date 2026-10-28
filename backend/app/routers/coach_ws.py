from __future__ import annotations

import asyncio
import base64
import json
import logging
import os

import websockets
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core import coach_ticket

logger = logging.getLogger("khatib.coach_ws")

router = APIRouter()

OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview"
MAX_SESSION_SECONDS = int(os.getenv("COACH_MAX_SESSION_SECONDS", "600"))  # سقف هزینه‌ی هر جلسه
MAX_CHUNK_BYTES = 64 * 1024

# فقط همین رویدادها به کلاینت برگردانده می‌شوند (نه کل session/config).
FORWARDED_EVENT_TYPES = {
    "conversation.item.input_audio_transcription.completed",
    "response.text.delta",
    "response.text.done",
    "response.done",
}

COACH_INSTRUCTIONS = (
    "شما «خطیب» هستید، یک مربی حرفه‌ای و باتجربه سخنرانی که به فارسی صحبت "
    "می‌کند. در حین صحبت کردن کاربر، بعد از هر جمله یا مکث طبیعی، یک بازخورد "
    "بسیار کوتاه (حداکثر ۱۵ کلمه)، فوری و کاربردی مثل یک استاد واقعی کنار "
    "گوش او بدهید — مثلاً درباره سرعت، تکرار کلمات، مکث‌های زیاد، لحن یا "
    "اعتماد به نفس. هرگز کل سخنرانی را خلاصه نکنید، هرگز بیش از یک جمله کوتاه "
    "ننویسید، و هرگز به زبانی غیر از فارسی پاسخ ندهید. اگر چیزی برای گفتن "
    "نیست، پاسخ خالی برگردانید."
)


def _header_kwargs(headers: dict[str, str]) -> dict:
    """نام آرگومان هدر در websockets از نسخه‌ی ۱۴ عوض شده است (extra_headers → additional_headers)."""
    try:
        major = int(str(websockets.__version__).split(".")[0])
    except (ValueError, AttributeError):
        major = 0
    return {("additional_headers" if major >= 14 else "extra_headers"): headers}


@router.websocket("/ws/coach")
async def coach_websocket(websocket: WebSocket):
    await websocket.accept()

    # ---- احراز هویت: بلیت کوتاه‌مدتِ گرفته‌شده از POST /api/practice/coach-ticket ----
    user_id = coach_ticket.verify_ticket(websocket.query_params.get("ticket"))
    if user_id is None:
        await websocket.send_json({"type": "error", "message": "unauthorized"})
        await websocket.close(code=4401)
        return

    api_key = os.getenv("AI_API_KEY")
    if not api_key:
        await websocket.send_json({"type": "error", "message": "سرویس مربی زنده تنظیم نشده است."})
        await websocket.close()
        return

    try:
        async with websockets.connect(
            OPENAI_REALTIME_URL,
            **_header_kwargs({"Authorization": f"Bearer {api_key}", "OpenAI-Beta": "realtime=v1"}),
        ) as openai_ws:
            await openai_ws.send(json.dumps({
                "type": "session.update",
                "session": {
                    "modalities": ["text"],
                    "instructions": COACH_INSTRUCTIONS,
                    "input_audio_format": "pcm16",
                    "input_audio_transcription": {"model": "whisper-1"},
                    "turn_detection": {
                        "type": "server_vad",
                        "threshold": 0.5,
                        "prefix_padding_ms": 300,
                        "silence_duration_ms": 700,
                    },
                },
            }))

            async def receive_from_openai() -> None:
                async for message in openai_ws:
                    data = json.loads(message)
                    if data.get("type") in FORWARDED_EVENT_TYPES:
                        await websocket.send_json(data)

            async def receive_from_client() -> None:
                try:
                    while True:
                        audio_chunk = await websocket.receive_bytes()
                        if not audio_chunk or len(audio_chunk) > MAX_CHUNK_BYTES:
                            continue
                        await openai_ws.send(json.dumps({
                            "type": "input_audio_buffer.append",
                            "audio": base64.b64encode(audio_chunk).decode(),
                        }))
                except WebSocketDisconnect:
                    logger.info("coach client disconnected (user=%s)", user_id)

            tasks = [
                asyncio.create_task(receive_from_openai()),
                asyncio.create_task(receive_from_client()),
            ]
            # با پایان هر طرف (یا رسیدن به سقف زمان) طرف دیگر هم بسته می‌شود تا اتصال معلق نماند.
            done, pending = await asyncio.wait(
                tasks, timeout=MAX_SESSION_SECONDS, return_when=asyncio.FIRST_COMPLETED
            )
            for task in pending:
                task.cancel()
            for task in done:
                exc = task.exception()
                if exc is not None and not isinstance(exc, (WebSocketDisconnect, websockets.ConnectionClosed)):
                    logger.warning("coach session ended with error: %r", exc)

    except Exception:
        logger.exception("coach websocket error (user=%s)", user_id)
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
