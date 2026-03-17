import hashlib
import secrets
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime, timedelta
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import nltk
import os

# Download NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

DB_PATH = 'reviews.db'

# ─────────────────────────────────────────────
#  DATABASE INIT
# ─────────────────────────────────────────────

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript('''
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

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_name TEXT NOT NULL,
            review_text TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            confidence REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    ''')
    conn.commit()

    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM reviews")
    if c.fetchone()[0] == 0:
        seed_data(conn)

    conn.close()


def seed_data(conn):
    np.random.seed(42)
    c = conn.cursor()

    products = ['Wireless Earbuds', 'Smartphone', 'Laptop', 'Coffee Maker', 'Running Shoes',
                'Winter Jacket', 'Yoga Mat', 'Desk Lamp', 'USB-C Cable', 'Power Bank']

    positive_reviews = [
        "Excellent product! Works exactly as described. Highly recommend!",
        "Amazing quality for the price. Very satisfied with this purchase.",
        "Love it! Fast delivery and great customer service.",
        "Outstanding performance. Better than expected!",
        "Best purchase I've made in years. Worth every penny!",
        "Fantastic quality and durability. Highly impressed!",
        "Perfect product. Does exactly what it promises.",
        "Extremely happy with this. Great value for money."
    ]
    negative_reviews = [
        "Terrible quality. Broke after one week. Waste of money.",
        "Very disappointed. Nothing like the photos online.",
        "Horrible experience. Product stopped working immediately.",
        "Worst purchase ever. Don't waste your money on this.",
        "Extremely poor quality. Disappointed with everything.",
        "Completely useless. Doesn't work as advertised.",
        "Awful product. I want my money back.",
        "Terrible customer service and poor product quality."
    ]
    neutral_reviews = [
        "It's okay. Does what it's supposed to do, nothing more.",
        "Average product. Neither great nor terrible.",
        "Decent for the price, but has some minor issues.",
        "Good but could be better. Acceptable quality.",
        "It works as expected. Nothing special though.",
        "Acceptable quality. Has pros and cons.",
        "Pretty standard product. Nothing remarkable.",
        "Decent option if you need it. Not bad overall."
    ]

    records = []
    for _ in range(35):
        records.append((
            np.random.choice(products),
            np.random.choice(positive_reviews),
            'positive',
            round(np.random.uniform(0.75, 0.99), 4),
            (datetime.now() - timedelta(days=int(np.random.randint(0, 180)))).isoformat()
        ))
    for _ in range(25):
        records.append((
            np.random.choice(products),
            np.random.choice(negative_reviews),
            'negative',
            round(np.random.uniform(0.70, 0.95), 4),
            (datetime.now() - timedelta(days=int(np.random.randint(0, 180)))).isoformat()
        ))
    for _ in range(40):
        records.append((
            np.random.choice(products),
            np.random.choice(neutral_reviews),
            'neutral',
            round(np.random.uniform(0.60, 0.80), 4),
            (datetime.now() - timedelta(days=int(np.random.randint(0, 180)))).isoformat()
        ))

    c.executemany(
        'INSERT INTO reviews (product_name, review_text, sentiment, confidence, timestamp) VALUES (?, ?, ?, ?, ?)',
        records
    )
    conn.commit()


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ─────────────────────────────────────────────
#  AUTH HELPERS
# ─────────────────────────────────────────────

def hash_password(password: str) -> str:
    """SHA-256 hash — swap for bcrypt in production."""
    return hashlib.sha256(password.encode()).hexdigest()


def create_token() -> str:
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
    """Decorator — protects routes that need a logged-in user."""
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


# ─────────────────────────────────────────────
#  SENTIMENT MODEL
# ─────────────────────────────────────────────

class SentimentAnalyzer:
    def __init__(self):
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=1000, stop_words='english', lowercase=True)),
            ('clf', MultinomialNB())
        ])
        self.is_trained = False
        self._train_default_model()

    def _train_default_model(self):
        sample_reviews = [
            "This product is amazing! I love it", "Excellent quality, highly recommend",
            "Great performance, very satisfied", "Outstanding product, worth every penny",
            "This is terrible, waste of money", "Horrible quality, very disappointed",
            "Worst purchase ever, don't buy", "Completely broken, very poor",
            "It's okay, nothing special", "Average product, acceptable",
            "Neither good nor bad", "Could be better",
            "This product works well", "Very happy with this purchase",
            "Not bad for the price", "Decent but has issues"
        ]
        labels = [1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 2, 1, 1, 2, 2]
        self.pipeline.fit(sample_reviews, labels)
        self.is_trained = True

    def analyze(self, text):
        if not self.is_trained:
            return {'sentiment': 'neutral', 'confidence': 0.5}
        try:
            prediction = self.pipeline.predict([text])[0]
            probabilities = self.pipeline.predict_proba([text])[0]
            confidence = float(np.max(probabilities))
            sentiment_map = {0: 'negative', 1: 'positive', 2: 'neutral'}
            return {
                'sentiment': sentiment_map.get(prediction, 'neutral'),
                'confidence': round(confidence, 4),
                'probabilities': {
                    'negative': round(float(probabilities[0]), 4),
                    'positive': round(float(probabilities[1]), 4),
                    'neutral':  round(float(probabilities[2]), 4)
                }
            }
        except Exception:
            return {'sentiment': 'neutral', 'confidence': 0.5}


analyzer = SentimentAnalyzer()


# ─────────────────────────────────────────────
#  AUTH ROUTES
# ─────────────────────────────────────────────

@app.route('/api/auth/signup', methods=['POST'])
def auth_signup():
    data     = request.get_json() or {}
    name     = (data.get('name')     or '').strip()
    email    = (data.get('email')    or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    conn = get_db()
    c = conn.cursor()
    try:
        pw_hash = hash_password(password)
        c.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            (name, email, pw_hash)
        )
        conn.commit()
        user_id = c.lastrowid

        token = create_token()
        c.execute('INSERT INTO sessions (token, user_id) VALUES (?, ?)', (token, user_id))
        conn.commit()

        return jsonify({
            'token': token,
            'user': {'id': user_id, 'name': name, 'email': email}
        }), 201

    except Exception as e:
        if 'UNIQUE' in str(e):
            return jsonify({'error': 'Email already registered'}), 409
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    data     = request.get_json() or {}
    email    = (data.get('email')    or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    conn = get_db()
    c = conn.cursor()
    try:
        pw_hash = hash_password(password)
        c.execute(
            'SELECT * FROM users WHERE email = ? AND password_hash = ?',
            (email, pw_hash)
        )
        user = c.fetchone()
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401

        token = create_token()
        c.execute('INSERT INTO sessions (token, user_id) VALUES (?, ?)', (token, user['id']))
        conn.commit()

        return jsonify({
            'token': token,
            'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/api/auth/logout', methods=['POST'])
def auth_logout():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1]
        conn = get_db()
        conn.execute('DELETE FROM sessions WHERE token = ?', (token,))
        conn.commit()
        conn.close()
    return jsonify({'message': 'Logged out'}), 200


@app.route('/api/auth/me', methods=['GET'])
@require_auth
def auth_me():
    u = request.current_user
    return jsonify({'id': u['id'], 'name': u['name'], 'email': u['email']}), 200


# ─────────────────────────────────────────────
#  REVIEW ROUTES
# ─────────────────────────────────────────────

@app.route('/api/analyze-review', methods=['POST'])
@require_auth
def analyze_review():
    try:
        data = request.get_json() or {}

        if 'review_text' not in data or 'product_name' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        review_text  = data['review_text'].strip()
        product_name = data['product_name'].strip()

        if not review_text or not product_name:
            return jsonify({'error': 'Review text and product name cannot be empty'}), 400

        analysis = analyzer.analyze(review_text)

        conn = get_db()
        c = conn.cursor()
        c.execute(
            'INSERT INTO reviews (user_id, product_name, review_text, sentiment, confidence) VALUES (?, ?, ?, ?, ?)',
            (request.current_user['id'], product_name, review_text, analysis['sentiment'], analysis['confidence'])
        )
        conn.commit()
        review_id = c.lastrowid
        conn.close()

        return jsonify({
            'id': review_id,
            'product_name': product_name,
            'review_text': review_text,
            'sentiment': analysis['sentiment'],
            'confidence': analysis['confidence'],
            'probabilities': analysis['probabilities'],
            'timestamp': datetime.now().isoformat()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/reviews', methods=['GET'])
@require_auth
def get_reviews():
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT * FROM reviews ORDER BY timestamp DESC')
        reviews = c.fetchall()
        conn.close()

        return jsonify([{
            'id':           r['id'],
            'product_name': r['product_name'],
            'review_text':  r['review_text'],
            'sentiment':    r['sentiment'],
            'confidence':   r['confidence'],
            'timestamp':    r['timestamp']
        } for r in reviews]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics', methods=['GET'])
@require_auth
def get_analytics():
    try:
        conn = get_db()
        c = conn.cursor()

        c.execute('SELECT sentiment, COUNT(*) as count FROM reviews GROUP BY sentiment')
        sentiment_counts = {row['sentiment']: row['count'] for row in c.fetchall()}

        c.execute('SELECT sentiment, AVG(confidence) as avg_confidence FROM reviews GROUP BY sentiment')
        sentiment_confidence = {row['sentiment']: round(row['avg_confidence'], 4) for row in c.fetchall()}

        c.execute('SELECT COUNT(*) as total FROM reviews')
        total = c.fetchone()['total']

        c.execute('SELECT product_name, COUNT(*) as count FROM reviews GROUP BY product_name ORDER BY count DESC')
        product_reviews = {row['product_name']: row['count'] for row in c.fetchall()}

        c.execute('''
            SELECT AVG(CASE WHEN sentiment="positive" THEN 1
                            WHEN sentiment="negative" THEN -1
                            ELSE 0 END) as avg_score
            FROM reviews
        ''')
        avg_score = c.fetchone()['avg_score']
        conn.close()

        return jsonify({
            'total_reviews': total,
            'sentiment_distribution': {
                'positive': sentiment_counts.get('positive', 0),
                'negative': sentiment_counts.get('negative', 0),
                'neutral':  sentiment_counts.get('neutral',  0)
            },
            'average_confidence': {
                'positive': sentiment_confidence.get('positive', 0),
                'negative': sentiment_confidence.get('negative', 0),
                'neutral':  sentiment_confidence.get('neutral',  0)
            },
            'average_sentiment_score': round(avg_score if avg_score else 0, 4),
            'top_products': list(product_reviews.items())[:5]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────
#  HEALTH CHECK
# ─────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200


# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)