from flask import session, request
from database import get_db

def log_activity(action, target=None, status="success"):
    db = get_db()

    user_id = session.get("user_id")
    if not user_id:
        return

    db.execute("""
        INSERT INTO activity_logs
        (user_id, action, target, status, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        action,
        target,
        status,
        request.remote_addr,
        request.headers.get("User-Agent")
    ))

    db.commit()
