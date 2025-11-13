# security.py
import time
from werkzeug.security import check_password_hash

failed_attempts = {}
locked_users = {}
MAX_ATTEMPTS = 3
LOCK_TIME = 300  # 5 minutes

def unauthorized_alert(username):
    print(f"⚠️ ALERT: Too many failed login attempts for '{username}'! Account locked for 5 minutes.")

def check_login(username, password, user):
    """
    Returns None if login succeeds, or a string message if login fails or account is locked.
    """
    current_time = time.time()

    if username in locked_users:
        unlock_time = locked_users[username]
        if current_time < unlock_time:
            remaining = int(unlock_time - current_time)
            return f"Account '{username}' is locked. Try again in {remaining} seconds."
        else:
            del locked_users[username]
            failed_attempts[username] = 0

    if user and check_password_hash(user.password, password):
        failed_attempts[username] = 0
        return None

    failed_attempts[username] = failed_attempts.get(username, 0) + 1
    print(f"Login failed for '{username}' ({failed_attempts[username]} attempts)")

    if failed_attempts[username] >= MAX_ATTEMPTS:
        locked_users[username] = current_time + LOCK_TIME
        unauthorized_alert(username)
        return f"Account '{username}' locked for 5 minutes due to multiple failed attempts."

    return "Invalid credentials, please try again."
