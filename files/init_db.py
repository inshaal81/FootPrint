from app import app, db
from sqlalchemy import text

with app.app_context():
    with db.engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action TEXT,
                target TEXT,
                ip_address TEXT,
                user_agent TEXT,
                created_at TEXT
            )
        """))
        conn.commit()

    print("activity_logs table created successfully.")
