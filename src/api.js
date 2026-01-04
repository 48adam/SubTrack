const API_URL = '/api';

// Przechowywanie tokenu
let token = localStorage.getItem('auth_token');

export const setToken = (newToken) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem('auth_token', newToken);
  } else {
    localStorage.removeItem('auth_token');
  }
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
});

// === AUTH ===
export async function register(username, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  if (data.token) setToken(data.token);
  return data.user;
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  if (data.token) setToken(data.token);
  return data;
}

export function logout() {
  setToken(null);
}

export async function getCurrentUser() {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to get user');
  return res.json();
}

// === SUBSCRIPTIONS ===
export async function getAllSubscriptions() {
  const res = await fetch(`${API_URL}/subscriptions`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch subscriptions');
  return res.json();
}

export async function getSubscriptionById(id) {
  const res = await fetch(`${API_URL}/subscriptions/${id}`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch subscription');
  return res.json();
}

export async function createSubscription(payload) {
  const res = await fetch(`${API_URL}/subscriptions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function updateSubscription(id, payload) {
  const res = await fetch(`${API_URL}/subscriptions/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function deleteSubscription(id) {
  const res = await fetch(`${API_URL}/subscriptions/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  setToken
};
