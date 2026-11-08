"""Run from the repo root:  python fix_dburl.py
1) config.py: auto-convert postgres:// and postgresql:// to postgresql+psycopg://
2) render.yaml: add a free Postgres DB, link DATABASE_URL to it, run bootstrap before uvicorn
"""
from pathlib import Path

cfg = Path("backend/app/core/config.py")
t = cfg.read_text(encoding="utf-8")
if "_normalize_db_url" not in t:
    marker = '    database_url: str = Field(default="sqlite:///./data/khatib.db")\n'
    add = marker + '''
    @field_validator("database_url")
    @classmethod
    def _normalize_db_url(cls, v: str) -> str:
        for old in ("postgres://", "postgresql://"):
            if v.startswith(old):
                return "postgresql+psycopg://" + v[len(old):]
        return v
'''
    assert t.count(marker) >= 1
    t = t.replace(marker, add, 1)
    cfg.write_text(t, encoding="utf-8")
    print("config.py patched")
else:
    print("config.py already patched")

ry = Path("render.yaml")
y = ry.read_text(encoding="utf-8")
old_cmd = "startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT"
new_cmd = "startCommand: python scripts/bootstrap_db.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
if old_cmd in y:
    y = y.replace(old_cmd, new_cmd)
if "fromDatabase" not in y:
    y = y.replace("    envVars:\n", "    envVars:\n      - key: DATABASE_URL\n        fromDatabase:\n          name: khatib-db\n          property: connectionString\n", 1)
if "databases:" not in y:
    y = y.rstrip("\n") + "\n\ndatabases:\n  - name: khatib-db\n    plan: free\n"
ry.write_text(y, encoding="utf-8")
print("render.yaml patched")
