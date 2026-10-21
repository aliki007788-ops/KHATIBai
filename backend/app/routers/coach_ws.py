from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import websockets
import json
import os
import asyncio
import base64

router = APIRouter()

OPENAI_API_KEY = os.getenv("AI_API_KEY")

@router.websocket("/ws/coach")
async def coach_websocket(websocket: WebSocket):
    await websocket.accept()
    
    if not OPENAI_API_KEY:
        await websocket.send_json({"type": "error", "message": "OPENAI_API_KEY تنظیم نشده است."})
        await websocket.close()
        return

    try:
        async with websockets.connect(
            "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
            extra_headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "OpenAI-Beta": "realtime=v1"
            }
        ) as openai_ws:
            
            await openai_ws.send(json.dumps({
                "type": "session.update",
                "session": {
                    "input_audio_transcription": {"model": "whisper-1"},
                    "turn_detection": {"type": "server_vad"},
                    "voice": "alloy"
                }
            }))

            async def receive_from_openai():
                try:
                    async for message in openai_ws:
                        data = json.loads(message)
                        await websocket.send_json(data)
                except Exception as e:
                    print(f"OpenAI connection closed: {e}")

            async def receive_from_client():
                try:
                    while True:
                        audio_chunk = await websocket.receive_bytes()
                        await openai_ws.send(json.dumps({
                            "type": "input_audio_buffer.append",
                            "audio": base64.b64encode(audio_chunk).decode()
                        }))
                except WebSocketDisconnect:
                    print("Client disconnected")

            await asyncio.gather(receive_from_openai(), receive_from_client())

    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass