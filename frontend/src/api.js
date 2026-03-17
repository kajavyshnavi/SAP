const BASE_URL = "http://localhost:5000/api";

// --- Auth helpers ---
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// --- Auth ---
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function signup(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(res);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// --- Reviews ---
export async function analyzeReview(productName, reviewText) {
  const res = await fetch(`${BASE_URL}/analyze-review`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ product_name: productName, review_text: reviewText }),
  });
  return handleResponse(res);
}

export async function getReviews() {
  const res = await fetch(`${BASE_URL}/reviews`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getAnalytics() {
  const res = await fetch(`${BASE_URL}/analytics`, { headers: authHeaders() });
  return handleResponse(res);
}