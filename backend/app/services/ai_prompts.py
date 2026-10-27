"""
Prompt templates, isolated and versioned.
"""
from __future__ import annotations

from app.schemas.ai import (
    ChatReplyResponse,
    PracticeSuggestionResponse,
    SPEECH_DIMENSION_KEYS,
    SpeechAnalysisResponse,
    TranslationResponse,
)

PROMPT_VERSIONS = {
    "speech_analysis": "speech_analysis_v1",
    "chat_iraqi_coach": "chat_iraqi_coach_v1",
    "translation_fa_iq": "translation_fa_iq_v1",
    "practice_suggestion": "practice_suggestion_v1",
}

_MODE_LABELS_FA = {
    "free": "سخنرانی آزاد",
    "script": "متن‌خوانی",
    "impromptu": "سخنرانی بداهه",
    "presentation": "ارائه حرفه‌ای",
}

_LEVEL_LABELS_FA = {
    "beginner": "مبتدی",
    "intermediate": "متوسط",
    "advanced": "پیشرفته",
}


def _schema_hint(model_cls) -> str:
    fields = []
    for name, field in model_cls.model_fields.items():
        fields.append(f'"{name}": {field.annotation}')
    return "{\n  " + ",\n  ".join(fields) + "\n}"


def _dimension_example_json() -> str:
    """مثال دقیق JSON برای ۱۲ بعد تحلیل سخنرانی (گزینه A)."""
    lines = []
    for key in SPEECH_DIMENSION_KEYS:
        lines.append(
            f'    "{key}": {{"score": 0, "explanation": "توضیح کوتاه یک تا دو جمله‌ای فارسی"}}'
        )
    dims = ",\n".join(lines)
    return (
        "{\n"
        '  "score": 0,\n'
        '  "dimensions": {\n' + dims + "\n  },\n"
        '  "strengths": ["..."],\n'
        '  "weaknesses": ["..."],\n'
        '  "improvements": ["..."],\n'
        '  "structure_notes": "...",\n'
        '  "next_practice": "..."\n'
        "}"
    )


def build_speech_analysis_prompt(topic: str, text: str) -> tuple[str, str]:
    system = (
        "شما یک مربی حرفه‌ای سخنرانی فارسی‌زبان هستید. متن سخنرانی کاربر را "
        "در ۱۲ بعد زیر تحلیل می‌کنید و بازخورد سازنده، دقیق و قابل‌اجرا می‌دهید:\n"
        "content (محتوا), structure (ساختار: مقدمه/بدنه/نتیجه), "
        "coherence (انسجام منطقی), clarity (وضوح), vocabulary (دایره لغات), "
        "grammar (گرامر), persuasion (اقناع), emotion (بار احساسی), "
        "engagement (تعامل با مخاطب), depth (عمق موضوع), conclusion (نتیجه‌گیری), "
        "confidence (اعتماد به نفس — از روی کلمات قاطع یا مردد در متن).\n\n"
        "برای هر یک از این ۱۲ بعد باید امتیاز ۰ تا ۱۰۰ و یک توضیح کوتاه "
        "(۱ تا ۲ جمله، به فارسی) بدهید. همچنین ۳ تا ۵ نقطه قوت، ۳ تا ۵ نقطه "
        "ضعف و یک پیشنهاد تمرین بعدی مشخص بدهید.\n\n"
        "همیشه فقط یک JSON معتبر و بدون هیچ متن اضافه (بدون ```، بدون توضیح "
        "قبل یا بعد) برمی‌گردانید، دقیقاً با این ساختار و دقیقاً همین ۱۲ کلید "
        "در dimensions (نه کمتر، نه بیشتر):\n"
        f"{_dimension_example_json()}\n\n"
        "score باید میانگین وزنی منطقی از ۱۲ بعد باشد، بین 0 تا 100. "
        "strengths، weaknesses و improvements باید آرایه‌ای از رشته‌های کوتاه "
        "فارسی باشند."
    )
    user = f"موضوع سخنرانی: {topic}\n\nمتن سخنرانی:\n{text}"
    return system, user


def build_chat_iraqi_coach_prompt(user_message: str, history_summary: str = "") -> tuple[str, str]:
    system = (
        "شما «خطیب»، یک مربی مکالمه به گویش عراقی هستید که به فارسی توضیح "
        "می‌دهید. اگر کاربر جمله‌ای به عربی/عراقی نوشت، اشتباهات گرامری یا "
        "تلفظی را با احترام اصلاح کنید. از عبارات رایج بغدادی استفاده کنید، "
        "نه عربی فصیح رسمی. فقط JSON معتبر با ساختار زیر برگردانید:\n"
        f"{_schema_hint(ChatReplyResponse)}"
    )
    context = f"خلاصه گفتگوی قبلی: {history_summary}\n\n" if history_summary else ""
    user = f"{context}پیام کاربر: {user_message}"
    return system, user


def build_practice_suggestion_prompt(
    mode: str,
    level: str,
    hint: str | None = None,
    previous_title: str | None = None,
) -> tuple[str, str]:
    mode_fa = _MODE_LABELS_FA.get(mode, mode)
    level_fa = _LEVEL_LABELS_FA.get(level, level)

    system = (
        "شما یک مربی حرفه‌ای سخنرانی هستید که برای کاربران فارسی‌زبان موضوع یا "
        "متن تمرین طراحی می‌کنید. موضوعات باید مدرن، واقعی و کاربردی باشند "
        "(مثل موقعیت‌های شغلی، کسب‌وکار، اجتماعی یا فناوری) — نه کلیشه‌ای یا "
        "کودکانه. سطح دشواری و طول محتوا باید دقیقاً متناسب با سطح درخواستی "
        "کاربر باشد.\n\n"
        f"حالت تمرین: {mode_fa}\n"
        f"سطح کاربر: {level_fa}\n\n"
        "اگر حالت «متن‌خوانی» است، prompt_text باید یک متن کامل و آماده خواندن "
        "(۳ تا ۶ جمله برای مبتدی، تا ۱۰-۱۲ جمله برای پیشرفته) باشد. "
        "اگر حالت «بداهه» یا «آزاد» است، prompt_text باید یک موضوع کوتاه برای "
        "صحبت بداهه باشد (۱ تا ۲ جمله). "
        "اگر حالت «ارائه حرفه‌ای» است، prompt_text باید یک سناریوی ارائه واقعی "
        "باشد (مثلاً ارائه به سرمایه‌گذار، مدیر، یا مشتری).\n\n"
        "اگر کاربر یک درخواست یا موضوع دلخواه مشخص کرده باشد، پیشنهاد شما باید "
        "دقیقاً حول همان درخواست باشد — نه یک موضوع کاملاً نامرتبط؛ فقط آن را به "
        "شکل حرفه‌ای و متناسب با سطح و حالت تمرین بازنویسی/گسترش دهید. اگر درخواستی "
        "داده نشده، خودتان یک موضوع مدرن و متنوع انتخاب کنید.\n\n"
        "guidance باید یک راهنمای کوتاه ساختاری (مقدمه/بدنه/نتیجه یا نکات "
        "کلیدی) برای کمک به کاربر در تمرین این مورد خاص باشد.\n\n"
        "فقط یک JSON معتبر و بدون متن اضافه، دقیقاً با این ساختار برگردانید:\n"
        '{\n  "title": "عنوان کوتاه",\n  "prompt_text": "متن یا موضوع تمرین",\n'
        '  "guidance": "راهنمای کوتاه ساختاری"\n}'
    )

    user_parts = [f"یک {('متن' if mode == 'script' else 'موضوع')} برای سطح {level_fa} پیشنهاد بده."]
    if hint:
        user_parts.append(f"درخواست یا موضوع دلخواه کاربر: «{hint}». پیشنهاد را دقیقاً حول همین محور بساز.")
    if previous_title:
        user_parts.append(
            f"پیشنهاد قبلی («{previous_title}») مورد پسند کاربر نبود؛ یک نسخه‌ی متفاوت و تازه (نه تکراری) بساز."
        )
    user = " ".join(user_parts)
    return system, user


def build_translation_prompt(text: str, direction: str) -> tuple[str, str]:
    if direction == "fa_to_iq":
        instruction = "متن فارسی زیر را به گویش عراقی (بغدادی) ترجمه کن، نه عربی فصیح."
    else:
        instruction = "متن عربی/عراقی زیر را به فارسی روان ترجمه کن."

    system = (
        f"شما یک مترجم متخصص فارسی و گویش عراقی هستید. {instruction} "
        "ترجمه باید طبیعی و محاوره‌ای باشد، نه لغت‌به‌لغت. فقط JSON معتبر "
        f"با ساختار زیر برگردانید:\n{_schema_hint(TranslationResponse)}"
    )
    user = f"متن: {text}"
    return system, user
