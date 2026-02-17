<p align="center">
  <img src="files/static/img/fplogo.png" alt="FootPrint Logo" width="200">
</p>

<h1 align="center">FootPrint</h1>

<p align="center">
  <strong>Track - Detect - Protect</strong>
</p>

<p align="center">
  A data breach detection web application that helps users discover if their personal information has been compromised in known data breaches.
</p>

<p align="center">
  <a href="https://github.com/inshaal81/FootPrint.git">View Repository</a>
</p>

---

## Table of Contents

- [Why FootPrint?](#why-footprint)
- [Features](#features)
- [How It Works](#how-it-works)
- [Application Flow](#application-flow)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Security Measures](#security-measures)
- [External APIs](#external-apis)
- [Project Structure](#project-structure)
- [Contributors](#contributors)
- [License](#license)

---

## Why FootPrint?

In today's digital age, data breaches occur with alarming frequency. Major companies like Adobe, LinkedIn, and Yahoo have all experienced breaches exposing millions of user credentials. The average person has over 100 online accounts, and many reuse passwords across multiple services. When a breach occurs, compromised credentials often end up for sale on the dark web within hours.

**FootPrint empowers you to:**

- **Priority** - Identify if your email or password has been exposed before attackers can exploit it
- **Protect** - Regain control of your digital security by knowing which accounts need attention
- **Prevent** - Stop credential stuffing attacks by identifying and changing compromised passwords

FootPrint provides a simple, secure interface to check your credentials against databases of known breaches without ever storing or transmitting your actual password.

---

## Features

### Email Breach Checking
Check if your email address appears in any known data breaches. FootPrint queries the XposedOrNot database containing millions of compromised records from documented breaches.

### Password Breach Checking
Verify if your password has been exposed in data breaches. Using the k-anonymity model, your password is never sent over the network - only a partial hash is transmitted, ensuring your password remains private even during the check.

### Secure User Authentication
- Create an account with validated credentials
- Login with rate limiting protection against brute-force attacks
- Session-based authentication with secure cookies

### Modern UI/UX
- Clean, responsive dashboard design
- Real-time breach checking with visual feedback
- Light and dark theme toggle for comfortable viewing
- Mobile-responsive layout

### Privacy-First Design
- No passwords are stored in plain text
- Password checking uses k-anonymity (only 5 characters of SHA-1 hash sent to API)
- All sensitive operations happen server-side

---

## How It Works

### Email Breach Checking Process

```
User enters email
        |
        v
+-------------------+
| Frontend sends    |
| email to backend  |
+-------------------+
        |
        v
+-------------------+
| Backend proxies   |
| request to        |
| XposedOrNot API   |
+-------------------+
        |
        v
+-------------------+
| API returns list  |
| of breaches       |
| (if any)          |
+-------------------+
        |
        v
+-------------------+
| Results displayed |
| with breach names |
| and advice        |
+-------------------+
```

### Password Breach Checking Process (k-Anonymity)

The password check uses a privacy-preserving technique called k-anonymity:

```
User enters password
        |
        v
+------------------------+
| Backend computes       |
| SHA-1 hash of password |
| Example: 5BAA61E4...   |
+------------------------+
        |
        v
+------------------------+
| Only first 5 chars     |
| sent to HIBP API       |
| Example: 5BAA6          |
+------------------------+
        |
        v
+------------------------+
| API returns all hashes |
| starting with 5BAA6    |
| (hundreds of matches)  |
+------------------------+
        |
        v
+------------------------+
| Backend checks if full |
| hash exists in results |
| locally (never sent!)  |
+------------------------+
        |
        v
+------------------------+
| Return breach count    |
| and severity level     |
+------------------------+
```

**Why this matters:** Your actual password never leaves your browser. Only a partial hash prefix is transmitted, making it impossible for anyone (including the API provider) to determine your password.

### Severity Levels for Password Breaches

| Severity | Breach Count | Meaning |
|----------|--------------|---------|
| Critical | 100,000+ | Extremely common, change immediately |
| High | 10,000+ | Very frequently exposed |
| Medium | 1,000+ | Moderately common |
| Low | < 1,000 | Less common but still exposed |

---

## Application Flow

### 1. Landing Page
Users arrive at the landing page which showcases:
- Key features: Leak Path Mapping, Real-Time Alerts, Policy Guardrails, Incident Analysis
- Statistics about the platform
- Clear call-to-action for signup and login

### 2. Authentication
- **Signup**: Create account with username, email, and password (with validation)
- **Login**: Authenticate with rate limiting protection (3 attempts, 5-minute lockout)

### 3. Dashboard
After authentication, users access the dashboard where they can:
- Enter email addresses to check for breaches
- Enter passwords to verify if they have been exposed
- View detailed results with breach names and recommendations
- Toggle between light and dark themes

### 4. Results Display
- **Email breaches**: Shows list of compromised services (e.g., LinkedIn, Adobe)
- **Password breaches**: Shows exposure count and severity rating
- **No breaches**: Green confirmation message
- Actionable security advice for compromised credentials

---

## Architecture

```
+--------------------------------------------------+
|                    CLIENT                         |
|  +-------------+  +-------------+  +-----------+  |
|  | Landing     |  | Auth Modals |  | Dashboard |  |
|  | Page        |  | (Login/     |  |           |  |
|  | (index.html)|  | Signup)     |  |           |  |
|  +-------------+  +-------------+  +-----------+  |
|        |               |               |          |
|        +-------+-------+-------+-------+          |
|                |               |                  |
|           script.js     dashboardScripts.js       |
+--------------------------------------------------+
                         |
                         | HTTP/HTTPS
                         v
+--------------------------------------------------+
|                 FLASK BACKEND                     |
|  +------------+  +------------+  +--------------+ |
|  | Routes     |  | Auth       |  | API Proxy    | |
|  | - /        |  | - /login   |  | - /api/      | |
|  | - /dashboard| | - /signup  |  |   check-     | |
|  | - /logout  |  | - /logout  |  |   breach     | |
|  +------------+  +------------+  | - /api/      | |
|                                  |   check-     | |
|                                  |   password   | |
|                                  +--------------+ |
|                         |                         |
|  +------------------+   |   +------------------+  |
|  | Security Layer   |   |   | Session Mgmt    |  |
|  | - CSRF Protection|   |   | - Flask Session |  |
|  | - Rate Limiting  |   |   | - User Context  |  |
|  | - Input Valid.   |   |   +------------------+  |
|  +------------------+                             |
+--------------------------------------------------+
           |                           |
           v                           v
+------------------+         +-------------------+
|    SQLite DB     |         |   External APIs   |
| +-------------+  |         | +---------------+ |
| | Users       |  |         | | XposedOrNot   | |
| | - id        |  |         | | (Email)       | |
| | - username  |  |         | +---------------+ |
| | - email     |  |         | +---------------+ |
| | - password  |  |         | | HIBP Pwned    | |
| +-------------+  |         | | Passwords     | |
| +-------------+  |         | +---------------+ |
| | LoginAttempt|  |         +-------------------+
| | - id        |  |
| | - username  |  |
| | - count     |  |
| | - locked    |  |
| +-------------+  |
+------------------+
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Flask 3.x (Python 3.10+) | Web framework, routing, API handling |
| **Database** | SQLite | User storage, login attempt tracking |
| **ORM** | Flask-SQLAlchemy | Database abstraction layer |
| **Security** | Flask-WTF | CSRF protection |
| **Security** | Werkzeug | Password hashing (PBKDF2-SHA256) |
| **Frontend** | HTML5, CSS3 | Structure and styling |
| **Frontend** | JavaScript (ES6+) | Client-side interactivity |
| **Frontend** | jQuery 4.0 | DOM manipulation |
| **Fonts** | Google Fonts (Inter) | Typography |

---

## Installation

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Git

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/inshaal81/FootPrint.git
cd FootPrint

# 2. Navigate to the application directory
cd files

# 3. Create a virtual environment
python -m venv venv

# 4. Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# 5. Install dependencies
pip install flask flask-sqlalchemy flask-wtf requests

# 6. (Optional) Set a production secret key
export FLASK_SECRET_KEY="your-secure-random-key-here"

# 7. Run the application
python app.py
```

### Quick Start (One-liner)

```bash
git clone https://github.com/inshaal81/FootPrint.git && cd FootPrint/files && python -m venv venv && source venv/bin/activate && pip install flask flask-sqlalchemy flask-wtf requests && python app.py
```

---

## Usage

### Creating an Account

1. Navigate to http://localhost:5001
2. Click "Sign Up" button
3. Enter:
   - Username (3-30 characters, alphanumeric with underscores/hyphens)
   - Email address
   - Password (minimum 8 characters, must include uppercase, lowercase, and number)
   - Confirm password
4. Click "Register"

### Checking for Breaches

1. Log in to your account
2. On the dashboard, you can check:
   - **Email Address**: Enter your email in the "Email Address" field
   - **Additional Email**: Check multiple emails at once
   - **Password**: Enter any password to check (it will NOT be stored)
3. Click "Check for Breaches"
4. Review results:
   - Green = No breaches found
   - Red = Breaches detected with list of compromised services

### Understanding Results

**Email Results:**
- Lists specific breaches where your email was found
- Each breach shown as a tag (e.g., "LinkedIn", "Adobe")
- Recommendations for securing affected accounts

**Password Results:**
- Shows how many times the password appeared in breaches
- Severity badge (Critical/High/Medium/Low)
- Recommendation to change if compromised

---

## API Documentation

### Authentication Required

All API endpoints require an active session (user must be logged in).

### POST /api/check-breach

Check if an email address has been exposed in data breaches.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (breaches found):**
```json
{
  "email": "user@example.com",
  "breached": true,
  "breach_count": 3,
  "breaches": ["LinkedIn", "Adobe", "Dropbox"]
}
```

**Response (no breaches):**
```json
{
  "email": "user@example.com",
  "breached": false,
  "breaches": []
}
```

**Error Responses:**
| Status | Description |
|--------|-------------|
| 400 | Invalid email format |
| 401 | Unauthorized (not logged in) |
| 429 | Rate limit exceeded |
| 502 | External API error |
| 503 | Service unavailable |
| 504 | Request timeout |

### POST /api/check-password

Check if a password has been exposed in data breaches using k-anonymity.

**Request:**
```json
{
  "password": "yourpassword123"
}
```

**Response (password found):**
```json
{
  "breached": true,
  "count": 52847,
  "severity": "critical",
  "message": "This password has been exposed 52,847 times in data breaches."
}
```

**Response (password safe):**
```json
{
  "breached": false,
  "count": 0,
  "message": "This password has not been found in known data breaches."
}
```

### Web Routes

| Route | Method | Auth Required | Description |
|-------|--------|---------------|-------------|
| `/` | GET | No | Landing page |
| `/login` | POST | No | Process login |
| `/signup` | POST | No | Process registration |
| `/dashboard` | GET | Yes | User dashboard |
| `/logout` | GET | Yes | End session |
| `/login_modal` | GET | No | Login form HTML |
| `/signup_modal` | GET | No | Signup form HTML |

---

## Security Measures

### Password Storage

Passwords are never stored in plain text. FootPrint uses Werkzeug's secure password hashing:

```python
# Hashing (on signup)
hashed = generate_password_hash(password, method='pbkdf2:sha256')

# Verification (on login)
check_password_hash(stored_hash, provided_password)
```

**PBKDF2-SHA256** uses:
- 260,000 iterations (Werkzeug default)
- Random salt per password
- Industry-standard key derivation

### Rate Limiting

Protection against brute-force attacks:

| Setting | Value |
|---------|-------|
| Max attempts | 3 |
| Lockout duration | 5 minutes (300 seconds) |
| Storage | Database (persists across restarts) |

```python
# After 3 failed attempts:
"Account locked for 5 minutes due to multiple failed attempts."
```

### CSRF Protection

All forms include CSRF tokens via Flask-WTF:

```html
<input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
```

This prevents:
- Cross-site request forgery attacks
- Unauthorized form submissions
- Session hijacking via forged requests

### Input Validation

Both client-side and server-side validation:

**Username:**
- 3-30 characters
- Alphanumeric, underscores, hyphens only
- Unique in database

**Email:**
- Valid email format
- Maximum 254 characters
- Unique in database

**Password:**
- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Session Security

- Server-side sessions using Flask's secure cookie implementation
- Sessions cleared on logout
- Secret key required for production (environment variable)

### k-Anonymity for Password Checking

Your password is NEVER sent to external services:

1. Password hashed locally with SHA-1
2. Only first 5 characters of hash sent to HIBP API
3. API returns all matching hash suffixes
4. Matching done locally on server
5. Password never leaves your infrastructure

---

## External APIs

### XposedOrNot API

**Purpose:** Email breach checking

| Property | Value |
|----------|-------|
| Endpoint | `https://api.xposedornot.com/v1/check-email/{email}` |
| Method | GET |
| Authentication | None required |
| Rate Limit | Reasonable use policy |
| Cost | Free |

**Response Format:**
```json
{
  "breaches": [["Adobe", "LinkedIn", "Dropbox"]]
}
```

### HIBP Pwned Passwords API

**Purpose:** Password breach checking with k-anonymity

| Property | Value |
|----------|-------|
| Endpoint | `https://api.pwnedpasswords.com/range/{hash_prefix}` |
| Method | GET |
| Authentication | None required |
| Rate Limit | ~10 requests/second |
| Cost | Free |

**Response Format:**
```
1E4C9B93F3F0682250B6CF8331B7EE68FD8:3
3D4F2BF07DC1BE38B20CD6E46949A1071F4:2
...
```

---

## Project Structure

```
FootPrint/
|-- files/
|   |-- app.py                    # Main Flask application
|   |-- security.py               # Security utilities
|   |-- static/
|   |   |-- styles.css            # Landing page styles
|   |   |-- dashboardStyles.css   # Dashboard styles
|   |   |-- script.js             # Landing page JavaScript
|   |   |-- dashboardScripts.js   # Dashboard JavaScript
|   |   |-- jquery-4.0.0.min.js   # jQuery library
|   |   |-- img/
|   |       |-- fplogo.png        # Application logo
|   |       |-- tbg.png           # Background image (light)
|   |       |-- tbbg.png          # Background image (dark)
|   |       |-- mbg.png           # Mobile background
|   |-- templates/
|   |   |-- index.html            # Landing page template
|   |   |-- dashboard.html        # Dashboard template
|   |   |-- login.html            # Login modal template
|   |   |-- signup.html           # Signup modal template
|   |-- instance/
|   |   |-- data.db               # SQLite database (auto-generated)
|   |-- venv/                     # Python virtual environment
|-- README.md                     # This file
```

---

## Contributors

<table>
  <tr>
    <td align="center">
      <strong>Muhammad Inshaal</strong><br>
      <sub>Web Development, Machine Learning</sub><br>
      <sub>Project Lead & Developer</sub>
    </td>
    <td align="center">
      <strong>Terry Tran</strong><br>
      <sub>Information Systems</sub><br>
      <sub>Database Developer</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Trung Nguyen</strong><br>
      <sub>Information Systems</sub><br>
      <sub>JavaScript Dev</sub>
    </td>
    <td align="center">
      <strong>Vi Khang Tran</strong><br>
      <sub>Information Systems</sub><br>
      <sub>Networking</sub>
    </td>
  </tr>
</table>

---

## Troubleshooting

### Port 5001 Already in Use

```bash
# Find and kill the process using port 5001
lsof -i :5001
kill -9 <PID>
```

### Database Errors

```bash
# Delete and recreate database
rm files/instance/data.db
python app.py  # Database auto-creates on startup
```

### Module Not Found

```bash
# Ensure virtual environment is activated
source files/venv/bin/activate

# Reinstall dependencies
pip install flask flask-sqlalchemy flask-wtf requests
```

### Rate Limit Exceeded

Wait 5 minutes for the lockout to expire, or manually clear the LoginAttempt table in the database.

---

## License

This is an academic project developed for coursework at **Drexel University**.

---

## Acknowledgments

- [XposedOrNot](https://xposedornot.com/) for the free email breach checking API
- [Have I Been Pwned](https://haveibeenpwned.com/) for the Pwned Passwords API
- [Inter Font](https://rsms.me/inter/) for typography

---

<p align="center">
  <strong>Stay safe. Check your footprint.</strong>
</p>
