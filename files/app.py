#Terry
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify, g
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from werkzeug.security import generate_password_hash
import json
import os
import re
import hashlib
import requests  # For HIBP API calls
from datetime import datetime, timedelta
#Terry added
from tracker.activity import log_activity
from database import get_db




#  Create ONE Flask app (Terry)
app = Flask(__name__, static_folder='static')

# ===== Secure Secret Key =====
app.secret_key = os.environ.get("FLASK_SECRET_KEY")
if not app.secret_key:
    if os.environ.get("RENDER"):
        raise RuntimeError("FLASK_SECRET_KEY must be set in production!")
    app.secret_key = "dev-only-secret-key-local-only"

#Terry - modified (made more modular and flexible for larger Flask apps)
csrf = CSRFProtect()
csrf.init_app(app)

#Terry modified
# ===== Configure and link the database =====
# Database configuration - PostgreSQL (production) or SQLite (local dev)
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    # Render uses 'postgres://' but SQLAlchemy requires 'postgresql://'
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config["DATABASE"] = os.path.join(basedir, "instance", "data.db")
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + app.config["DATABASE"]
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ===== User model =====
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)


#Inshaal - LoginAttempt model (persistent rate limiting)
class LoginAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, index=True)
    failed_count = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime, nullable=True)
    last_attempt = db.Column(db.DateTime, default=datetime.utcnow)


#Inshaal - Input Validation
def validate_email(email):
    """Validate email format."""
    if not email or len(email) > 254:
        return False, "Email is required and must be under 254 characters."
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False, "Invalid email format."
    return True, ""


def validate_username(username):
    """Validate username - alphanumeric, underscore, hyphen only."""
    if not username:
        return False, "Username is required."
    if len(username) < 3 or len(username) > 30:
        return False, "Username must be 3-30 characters."
    pattern = r'^[a-zA-Z0-9_-]+$'
    if not re.match(pattern, username):
        return False, "Username can only contain letters, numbers, underscores, and hyphens."
    return True, ""


def validate_password(password):
    """Validate password strength."""
    if not password:
        return False, "Password is required."
    if len(password) < 8:
        return False, "Password must be at least 8 characters."
    if len(password) > 128:
        return False, "Password must be under 128 characters."
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number."
    return True, ""

#Khang 
class RemovalProvider(db.Model):
    id = db.Column(db.String(50), primary_key=True)  
    name = db.Column(db.String(120), nullable=False)
    opt_out_url = db.Column(db.String(300), nullable=False)
    eta = db.Column(db.String(50), nullable=True)
    steps_json = db.Column(db.Text, nullable=True)   

class RemovalAction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)        
    provider_id = db.Column(db.String(50), nullable=False)   
    status = db.Column(db.String(30), nullable=False)        
    notes = db.Column(db.Text, nullable=True)                
    created_at = db.Column(db.String(40), nullable=False)  

#Khang (review model for user feedback on providers)
class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=True)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)



# Create tables
with app.app_context():
    db.create_all() 
    if RemovalProvider.query.count() == 0:
        providers = [
            RemovalProvider(
                id="whitepages",
                name="Whitepages",
                opt_out_url="https://www.whitepages.com/suppression-requests",
                eta="7–14 days",
                steps_json=json.dumps([
                    "Open the suppression request page",
                    "Search for your listing",
                    "Submit the request and confirm if prompted"
                ])
            ),
            RemovalProvider(
                id="spokeo",
                name="Spokeo",
                opt_out_url="https://www.spokeo.com/optout",
                eta="3–10 days",
                steps_json=json.dumps([
                    "Open the opt-out page",
                    "Find your profile",
                    "Submit request and verify via email"
                ])
            )
        ]
        db.session.add_all(providers)
        db.session.commit()


# ===== Home =====
@app.route("/")
def home():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template("index.html")

# ===== Rate Limiting Constants =====
MAX_ATTEMPTS = 3
LOCK_TIME = 300  # 5 minutes in seconds


# ===== Login POST with security checks =====
@app.route("/login", methods=["POST"])
def login():
    from werkzeug.security import check_password_hash

    username = request.form.get("username", "").strip()
    password = request.form.get("password", "")

    if not username or not password:
        flash("Username and password are required.", "error")
        return redirect(url_for('home'))

    # Get or create login attempt record
    attempt = LoginAttempt.query.filter_by(username=username).first()
    if not attempt:
        attempt = LoginAttempt(username=username, failed_count=0)
        db.session.add(attempt)

    current_time = datetime.utcnow()

    # Check if account is locked
    if attempt.locked_until and current_time < attempt.locked_until:
        remaining = int((attempt.locked_until - current_time).total_seconds())
        flash(f"Account locked. Try again in {remaining} seconds.", "error")
        return redirect(url_for('home'))

    # Clear lock if expired
    if attempt.locked_until and current_time >= attempt.locked_until:
        attempt.failed_count = 0
        attempt.locked_until = None

    # Check credentials
    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        # Successful login - reset attempts
        attempt.failed_count = 0
        attempt.locked_until = None
        db.session.commit()

        session['user_id'] = user.id
        session['username'] = user.username
        #added
        log_activity("login")
        flash("Login successful!", "success")

        return redirect(url_for('dashboard'))

    # Failed login - increment counter
    attempt.failed_count += 1
    attempt.last_attempt = current_time

    if attempt.failed_count >= MAX_ATTEMPTS:
        attempt.locked_until = current_time + timedelta(seconds=LOCK_TIME)
        db.session.commit()
        flash(f"Account locked for {LOCK_TIME // 60} minutes due to multiple failed attempts.", "error")
    else:
        db.session.commit()
        remaining_attempts = MAX_ATTEMPTS - attempt.failed_count
        flash(f"Invalid credentials. {remaining_attempts} attempt(s) remaining.", "error")

    return redirect(url_for('home'))

# ===== Signup POST =====

@app.route("/signup", methods=["POST"])
def signup():
    username = request.form.get("username", "").strip()
    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")
    confirm_password = request.form.get("confirm_password", "")

    # Validate username
    valid, error = validate_username(username)
    if not valid:
        flash(error, "error")
        return redirect(url_for("home"))

    # Validate email
    valid, error = validate_email(email)
    if not valid:
        flash(error, "error")
        return redirect(url_for("home"))

    # Validate password
    valid, error = validate_password(password)
    if not valid:
        flash(error, "error")
        return redirect(url_for("home"))

    # Password match check
    if password != confirm_password:
        flash("Passwords do not match.", "error")
        return redirect(url_for("home"))

    # Username exists check
    if User.query.filter_by(username=username).first():
        flash("Username already exists!", "error")
        return redirect(url_for("home"))

    # Email exists check
    if User.query.filter_by(email=email).first():
        flash("Email already registered!", "error")
        return redirect(url_for("home"))

    # Create user
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    flash("Signup successful! Please log in.", "success")
    return redirect(url_for("home"))

#Khang
# ===== Dashboard =====
@app.route("/dashboard")
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('home'))
    username = session.get('username', 'User')
    return render_template("dashboard.html", username=username)

# ===== Logout =====
@app.route("/logout")
def logout():
    #added
    log_activity("logout")
    session.clear()
    return redirect(url_for('home'))

# ===== Modals served separately =====
@app.route("/login_modal")
def login_modal():
    return render_template("login.html")

@app.route("/signup_modal")
def signup_modal():
    return render_template("signup.html")

#GET 
@app.route("/api/removal/providers", methods=["GET"])
def api_removal_providers():
    # Only allow logged-in users to access this API
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    providers = RemovalProvider.query.all()

    # Convert DB rows into JSON objects for the frontend
    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "optOutUrl": p.opt_out_url,
            "eta": p.eta,
            "steps": json.loads(p.steps_json) if p.steps_json else []
        } for p in providers
    ])

#POST
@app.route("/api/removal/action", methods=["POST"])
def api_removal_action():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(force=True)
    provider_id = data.get("provider_id")
    status = data.get("status")
    notes = data.get("notes", "")

    # Validate request
    if not provider_id or not status:
        return jsonify({"error": "provider_id and status required"}), 400

    if status not in ["Not started", "Submitted", "Completed"]:
        return jsonify({"error": "invalid status"}), 400

    action = RemovalAction(
        user_id=session["user_id"],
        provider_id=provider_id,
        status=status,
        notes=notes,
        created_at=datetime.utcnow().isoformat()

    )

    db.session.add(action)
    db.session.commit()

    return jsonify({"ok": True})

#SUMMARY
@app.route("/api/removal/summary", methods=["GET"])
def api_removal_summary():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    actions = (RemovalAction.query
               .filter_by(user_id=session["user_id"])
               .order_by(RemovalAction.id.desc())
               .all())

    submitted = sum(1 for a in actions if a.status == "Submitted")
    completed = sum(1 for a in actions if a.status == "Completed")

    return jsonify({
        "submitted": submitted,
        "completed": completed,
        "actions": [
            {
                "provider_id": a.provider_id,
                "status": a.status,
                "notes": a.notes,
                "created_at": a.created_at
            } for a in actions
        ]
    })

# Khang (add GET route for reviews)
@app.route("/api/reviews", methods=["GET"])
def get_reviews():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    reviews = Review.query.order_by(Review.created_at.desc()).all()

    return jsonify([
        {
            "id": r.id,
            "user_id": r.user_id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in reviews
    ])


#Inshaal - XposedOrNot API Proxy (FREE email breach checking)
@app.route("/api/check-breach", methods=["POST"])
@csrf.exempt  # Exempt from CSRF - uses session auth + JSON body
def check_breach():
    """
    Backend proxy for XposedOrNot API.
    FREE API - no API key required.
    Avoids CORS issues by making the API call server-side.
    """
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    email = data.get("email", "").strip().lower() if data else ""

    if not email:
        return jsonify({"error": "Email is required"}), 400

    # Basic email validation
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"error": "Invalid email format"}), 400

    try:
        api_url = f"https://api.xposedornot.com/v1/check-email/{email}"
        headers = {
            "User-Agent": "FootprintApp/1.0"
        }

        response = requests.get(api_url, headers=headers, timeout=10)

        if response.status_code == 404:
            # No breaches found - this is good news
            return jsonify({"breaches": [], "email": email, "breached": False}), 200
        elif response.status_code == 429:
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        elif response.status_code == 200:
            # XposedOrNot returns: {"breaches": [["Adobe", "LinkedIn", ...]]}
            data = response.json()
            # Extract breaches from nested array
            breaches_list = data.get("breaches", [[]])
            breach_names = breaches_list[0] if breaches_list and len(breaches_list) > 0 else []
            return jsonify({
                "breaches": breach_names,
                "email": email,
                "breached": len(breach_names) > 0,
                "breach_count": len(breach_names)
            }), 200
        else:
            return jsonify({"error": f"API error: {response.status_code}"}), 502

    except requests.Timeout:
        return jsonify({"error": "Request timed out. Please try again."}), 504
    except requests.RequestException as e:
        return jsonify({"error": "Unable to check breaches at this time."}), 503


#Inshaal - Pwned Passwords API (k-anonymity model)
@app.route("/api/check-password", methods=["POST"])
@csrf.exempt  # Exempt from CSRF - uses session auth + JSON body
def check_password_pwned():
    """
    Check if password has been exposed in data breaches.
    Uses k-anonymity: only first 5 chars of SHA-1 hash are sent to API.
    """
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    password = data.get("password", "") if data else ""

    if not password:
        return jsonify({"error": "Password is required"}), 400

    try:
        # Hash password with SHA-1 (only for breach checking, NOT storage)
        sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
        prefix = sha1_hash[:5]
        suffix = sha1_hash[5:]

        # Query HIBP Pwned Passwords API (no API key needed)
        api_url = f"https://api.pwnedpasswords.com/range/{prefix}"
        headers = {"User-Agent": "FootprintApp/1.0"}

        response = requests.get(api_url, headers=headers, timeout=5)

        if response.status_code == 200:
            # Parse response - each line is "HASH_SUFFIX:COUNT"
            for line in response.text.splitlines():
                if ':' not in line:
                    continue
                hash_suffix, count = line.split(':', 1)
                if suffix == hash_suffix:
                    count = int(count)
                    # Determine severity
                    if count > 100000:
                        severity = "critical"
                    elif count > 10000:
                        severity = "high"
                    elif count > 1000:
                        severity = "medium"
                    else:
                        severity = "low"

                    return jsonify({
                        "breached": True,
                        "count": count,
                        "severity": severity,
                        "message": f"This password has been exposed {count:,} times in data breaches."
                    })

            # Password not found in breaches
            return jsonify({
                "breached": False,
                "count": 0,
                "message": "This password has not been found in known data breaches."
            })
        else:
            return jsonify({"error": f"API error: {response.status_code}"}), 502

    except requests.Timeout:
        return jsonify({"error": "Request timed out. Please try again."}), 504
    except requests.RequestException:
        return jsonify({"error": "Unable to check password at this time."}), 503

#Terry added

@app.route("/scan", methods=["POST"])
def scan():
    domain = request.form["domain"]

    log_activity("run_scan", domain)
    return redirect(url_for("dashboard"))
    # scan logic here

@app.teardown_appcontext
def close_db(exception=None):
    db_conn = g.pop("db", None)

    if db_conn is not None:
        db_conn.close()



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug, host="0.0.0.0", port=port)
