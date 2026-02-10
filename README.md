# FootPrint

A web application that helps users check if their personal information has been compromised in data breaches. Built with Flask and Python.

## Features

- **Email Breach Detection** - Check if your email addresses have appeared in known data breaches using the XposedOrNot API
- **Password Breach Detection** - Verify if your passwords have been exposed using the HaveIBeenPwned API with k-anonymity (your password is never sent over the network)
- **Multiple Email Support** - Check up to 2 email addresses at once
- **Severity Ratings** - Password breaches are categorized by severity (Critical, High, Medium, Low)
- **User Authentication** - Secure login/signup system with password hashing
- **Rate Limiting** - Protection against brute-force attacks with account lockout
- **CSRF Protection** - All forms protected against cross-site request forgery
- **Dark Mode** - Toggle between light and dark themes

## Tech Stack

- **Backend**: Python, Flask, SQLAlchemy
- **Database**: SQLite
- **Security**: Flask-WTF (CSRF), Werkzeug (password hashing)
- **APIs**: XposedOrNot (email breaches), HaveIBeenPwned (password breaches)
- **Frontend**: HTML, CSS, JavaScript

## Installation

1. Clone the repository:
```bash
git clone https://gitlab.cci.drexel.edu/cid/2526/fw1023/c4/footprint.git
cd footprint
```

2. Create and activate a virtual environment:
```bash
cd files
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install flask flask-sqlalchemy flask-wtf requests werkzeug
```

4. Run the application:
```bash
python app.py
```

5. Open your browser and navigate to:
```
http://127.0.0.1:5001
```

## Usage

1. **Sign Up** - Create an account with a username, email, and password
2. **Log In** - Access your dashboard
3. **Check Breaches** - Enter your email addresses and/or password to check for breaches
4. **View Results** - See which services have been breached and password exposure counts

## Security Features

- **Password Hashing** - All passwords are hashed using PBKDF2-SHA256
- **k-Anonymity** - Password breach checking uses partial hash matching (only first 5 characters of SHA-1 hash sent to API)
- **Rate Limiting** - Accounts are locked for 5 minutes after 3 failed login attempts
- **CSRF Tokens** - All forms include CSRF protection
- **Input Validation** - Server-side validation for all user inputs

## API Integrations

| API | Purpose | Cost |
|-----|---------|------|
| XposedOrNot | Email breach checking | Free |
| HaveIBeenPwned Pwned Passwords | Password breach checking | Free |

## Project Structure

```
footprint/
├── files/
│   ├── app.py              # Main Flask application
│   ├── security.py         # Security utilities
│   ├── static/
│   │   ├── dashboardScripts.js
│   │   ├── dashboardStyles.css
│   │   ├── script.js
│   │   └── styles.css
│   ├── templates/
│   │   ├── index.html
│   │   ├── dashboard.html
│   │   ├── login.html
│   │   └── signup.html
│   └── instance/
│       └── data.db         # SQLite database
└── README.md
```

## Team

- Terry
- Trung
- Khang
- Inshaal

## License

MIT License - See [LICENSE](LICENSE) file for details.
