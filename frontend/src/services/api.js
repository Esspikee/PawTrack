const DEFAULT_BASE_URL = "http://127.0.0.1:8000";
const TOKEN_KEY = "pawtrack_access_token";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
export const AUTH_TOKEN_CLEARED_EVENT = "pawtrack:auth-token-cleared";

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_CLEARED_EVENT));
}

export function hasToken() {
  return Boolean(getToken());
}

function extractMessage(payload, fallback) {
  if (typeof payload?.detail === "string") {
    return payload.detail;
  }

  if (Array.isArray(payload?.detail)) {
    return payload.detail.map((item) => item.msg).filter(Boolean).join(" ") || fallback;
  }

  if (typeof payload?.message === "string") {
    return payload.message;
  }

  return fallback;
}

async function request(path, options = {}) {
  const { auth = false, body, headers: customHeaders, ...fetchOptions } = options;
  const headers = new Headers(customHeaders || {});
  const token = getToken();

  if (auth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      body,
      headers,
    });
  } catch {
    throw new ApiError("No se pudo conectar con PawTrack. Verifica que el backend este activo.");
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = response.status === 204
    ? null
    : contentType.includes("application/json")
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearToken();
    }

    throw new ApiError(
      extractMessage(payload, `La solicitud fallo (${response.status}).`),
      response.status,
      payload,
    );
  }

  return payload;
}

export const api = {
  health: () => request("/health"),
  register: (data) => request("/usuarios/", { method: "POST", body: JSON.stringify(data) }),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
  },
  getMe: () => request("/usuarios/me", { auth: true }),
  listUsers: () => request("/usuarios/"),
  uploadImage: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/upload", { method: "POST", auth: true, body: form });
  },
  listAnimals: () => request("/animales/"),
  getAnimal: (id) => request(`/animales/${id}`),
  createAnimal: (data) => request("/animales/", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  }),
  updateAnimal: (id, data) => request(`/animales/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  }),
  addSighting: (animalId, data) => request(`/animales/${animalId}/avistamientos`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  }),
  getAnimalHistory: (animalId) => request(`/animales/${animalId}/historial`),
  deleteSighting: (sightingId) => request(`/avistamientos/${sightingId}`, {
    method: "DELETE",
    auth: true,
  }),
  confirmSighting: (sightingId) => request(`/avistamientos/${sightingId}/confirmar`, {
    method: "POST",
    auth: true,
  }),
  unconfirmSighting: (sightingId) => request(`/avistamientos/${sightingId}/confirmar`, {
    method: "DELETE",
    auth: true,
  }),
  getSightingConfirmations: (sightingId) => request(`/avistamientos/${sightingId}/confirmaciones`),
};

export function assetUrl(path) {
  if (!path) return null;
  if (/^(https?:|blob:|data:)/.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
