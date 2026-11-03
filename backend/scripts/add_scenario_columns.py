from sqlalchemy import text
from app.core.db import engine

cols = [
    ("slug", "VARCHAR(64)"),
    ("title_iq", "VARCHAR(255)"),
    ("situation", "TEXT"),
    ("objectives", "JSON"),
    ("model_dialogue", "JSON"),
    ("success_criteria", "JSON"),
    ("common_mistakes", "JSON"),
    ("cultural_note", "TEXT"),
    ("difficulty", "INTEGER DEFAULT 1"),
    ("estimated_minutes", "INTEGER DEFAULT 8"),
    ("content_version", "INTEGER DEFAULT 1"),
]

with engine.connect() as conn:
    existing = {row[1] for row in conn.execute(text("PRAGMA table_info(iraqi_scenarios)"))}
    for name, typ in cols:
        if name not in existing:
            conn.execute(text(f"ALTER TABLE iraqi_scenarios ADD COLUMN {name} {typ}"))
            print("added", name)
        else:
            print("exists", name)
    conn.commit()

print("DB schema updated")