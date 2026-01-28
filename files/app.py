#Terry 
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
from security import check_login  # <-- import your login check logic
import os   # ✅ added

#Terry
# ===== Create Flask app =====
app = Flask(__name__, static_folder='static')

# ===== Secure Secret Key =====
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-only-secret-key")

if app.config.get("ENV") == "production" and app.secret_key == "dev-only-secret":
    raise RuntimeError("FLASK_SECRET_KEY must be set in production!")

# ===== Configure and link the database =====
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ===== User model =====
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

# Create tables
with app.app_context():
    db.create_all()


# ===== Home =====
@app.route("/")
def home():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template("index.html")

# ===== Login POST with security checks =====
@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    user = User.query.filter_by(username=username).first()

    result = check_login(username, password, user)
    if result is None:
        session['user_id'] = user.id
        session['username'] = user.username
        flash("Login successful!", "success")
        return redirect(url_for('dashboard'))
    else:
        flash(result, "error")  # result from check_login should be a message string
        return redirect(url_for('home'))

# ===== Signup POST =====
@app.route("/signup", methods=["POST"])
def signup():
    username = request.form.get("username")
    email = request.form.get("email")
    password = request.form.get("password")
    confirm_password = request.form.get("confirm_password")

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
    session.clear()
    return redirect(url_for('home'))

# ===== Modals served separately =====
@app.route("/login_modal")
def login_modal():
    return render_template("login.html")

@app.route("/signup_modal")
def signup_modal():
    return render_template("signup.html")
