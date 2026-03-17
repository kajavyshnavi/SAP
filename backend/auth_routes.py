# ── Add these imports at the top of app.py ────────────────────────────────
# import hashlib
# import secrets
# from functools import wraps

# ── Replace / extend your DB init with this table ─────────────────────────

AUTH_SCHEMA = '''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
'''

# ── Helper functions ───────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """SHA-256 hash (swap for bcrypt in production)"""
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

def create_token() -> str:
    import secrets
    return secrets.token_hex(32)

def get_user_from_token(token: str):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "SELECT u.* FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.token = ?",
        (token,)
    )
    user = c.fetchone()
    conn.close()
    return user

def require_auth(f):
    """Decorator – protects routes that need a logged-in user"""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        token = auth_header.split(" ", 1)[1]
        user = get_user_from_token(token)
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

# ── Auth routes ────────────────────────────────────────────────────────────

@app.route("/api/auth/signup", methods=["POST"])
def auth_signup():
    import hashlib, secrets
    data = request.get_json()
    name     = (data.get("name") or "").strip()
    email    = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    conn = get_db()
    c = conn.cursor()
    try:
        pw_hash = hash_password(password)
        c.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, pw_hash)
        )
        conn.commit()
        user_id = c.lastrowid

        token = create_token()
        c.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user_id))
        conn.commit()

        return jsonify({
            "token": token,
            "user": {"id": user_id, "name": name, "email": email}
        }), 201

    except Exception as e:
        if "UNIQUE" in str(e):
            return jsonify({"error": "Email already registered"}), 409
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json()
    email    = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db()
    c = conn.cursor()
    try:
        pw_hash = hash_password(password)
        c.execute(
            "SELECT * FROM users WHERE email = ? AND password_hash = ?",
            (email, pw_hash)
        )
        user = c.fetchone()
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        token = create_token()
        c.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user["id"]))
        conn.commit()

        return jsonify({
            "token": token,
            "user": {"id": user["id"], "name": user["name"], "email": user["email"]}
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
        conn = get_db()
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()
    return jsonify({"message": "Logged out"}), 200


@app.route("/api/auth/me", methods=["GET"])
@require_auth
def auth_me():
    u = request.current_user
    return jsonify({"id": u["id"], "name": u["name"], "email": u["email"]}), 200


# ── Remember to call this inside init_db() ─────────────────────────────────
# conn.executescript(AUTH_SCHEMA)
