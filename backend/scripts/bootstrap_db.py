"""Idempotent DB bootstrap for Render (free tier has no shell).
Empty DB  -> create all tables from models, then `alembic stamp head`.
Existing  -> `alembic upgrade head`.
Then seeds the Iraqi curriculum if no scenarios exist.
Run before uvicorn:  python scripts/bootstrap_db.py && uvicorn ...
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, text

import app.core.models  # noqa: F401  (register all tables)
from app.core.db import Base, engine


def main() -> None:
    cfg = Config(str(ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(ROOT / "alembic"))
    tables = set(inspect(engine).get_table_names())
    if "users" not in tables:
        print("[bootstrap] empty database -> create_all + stamp head")
        Base.metadata.create_all(bind=engine)
        command.stamp(cfg, "head")
    else:
        print("[bootstrap] existing database -> alembic upgrade head")
        command.upgrade(cfg, "head")

    with engine.connect() as c:
        n = c.execute(text("select count(*) from iraqi_scenarios")).scalar() or 0
    if n == 0:
        print("[bootstrap] seeding Iraqi curriculum")
        sys.path.insert(0, str(ROOT / "scripts"))
        import seed_iraqi_curriculum as s
        s.run()
    else:
        print(f"[bootstrap] {n} scenarios present, skip seed")


if __name__ == "__main__":
    main()
