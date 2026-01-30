#Trung
# security.py
import time
from werkzeug.security import check_password_hash

MAX_ATTEMPTS = 3
LOCK_TIME = 300  # 5 minutes

def unauthorized_alert(username):
    print(f"⚠️ ALERT: Too many failed login attempts for '{username}'! Account locked for 5 minutes.")

def check_login(username, password, user, db, LoginState):
    """
    Returns None if login succeeds, or a string message if login fails or account is locked.
    Uses DB storage so attempts/lockouts persist after server restart.
    """
    current_time = time.time()

    # Get or create login state row
    state = LoginState.query.filter_by(username=username).first()
    if not state:
        state = LoginState(username=username, failed_attempts=0, lock_until=0)
        db.session.add(state)
        db.session.commit()

    # If currently locked
    if state.lock_until and current_time < state.lock_until:
        remaining = int(state.lock_until - current_time)
        return f"Account '{username}' is locked. Try again in {remaining} seconds."

    # If lock expired, reset
    if state.lock_until and current_time >= state.lock_until:
        state.lock_until = 0
        state.failed_attempts = 0
        db.session.commit()

    # Successful login
    if user and check_password_hash(user.password, password):
        state.failed_attempts = 0
        state.lock_until = 0
        db.session.commit()
        return None

    # Failed login
    state.failed_attempts += 1

    if state.failed_attempts >= MAX_ATTEMPTS:
        state.lock_until = current_time + LOCK_TIME
        db.session.commit()
        unauthorized_alert(username)
        return f"Account '{username}' locked for 5 minutes due to multiple failed attempts."

    db.session.commit()
    return "Invalid credentials, please try again."
