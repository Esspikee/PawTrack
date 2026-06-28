// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, clearToken, getToken, setToken } from "./api";

function response(payload, status = 200) {
  return {
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => payload,
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  };
}

describe("api client", () => {
  beforeEach(() => {
    clearToken();
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/login");
  });

  it("sends login as form data with the email in username", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(response({ access_token: "abc", token_type: "bearer" }));

    await api.login("laura@example.com", "secret");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://127.0.0.1:8000/login");
    expect(options.method).toBe("POST");
    expect(options.credentials).toBeUndefined();
    expect(options.headers.get("Content-Type")).toBe("application/x-www-form-urlencoded");
    expect(options.body).toBeInstanceOf(URLSearchParams);
    expect(options.body.get("username")).toBe("laura@example.com");
    expect(options.body.get("password")).toBe("secret");
  });

  it("attaches the bearer token only to protected calls", async () => {
    setToken("token-123");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(response({ id_usuario: "user-id" }));

    await api.getMe();

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("uploads multipart data without forcing a content type", async () => {
    setToken("token-123");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(response({ filename: "photo.jpg", url: "/uploads/photo.jpg" }));
    const file = new File(["image"], "photo.jpg", { type: "image/jpeg" });

    await api.uploadImage(file);

    const [, options] = fetchMock.mock.calls[0];
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("file")).toBe(file);
    expect(options.headers.has("Content-Type")).toBe(false);
  });

  it("throws ApiError with the backend status and message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response({ detail: "El correo ya esta registrado." }, 409));

    await expect(api.register({ username: "laura", email: "laura@example.com", password: "secret" }))
      .rejects.toEqual(expect.objectContaining({
        message: "El correo ya esta registrado.",
        status: 409,
      }));
  });

  it("clears an expired token after a protected 401", async () => {
    setToken("expired-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response({ detail: "Token expirado" }, 401));

    await expect(api.getMe()).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBeNull();
  });

  it("matches every animal and sighting endpoint in OpenAPI", async () => {
    setToken("token-123");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(response({}));
    const animalId = "animal-uuid";
    const sightingId = "sighting-uuid";
    const animalPayload = {
      especie: "Gato",
      color_principal: "Negro",
      latitud: 4.711,
      longitud: -74.0721,
      foto_principal: "/uploads/cat.jpg",
      descripcion: "",
    };
    const sightingPayload = {
      latitud: 4.712,
      longitud: -74.073,
      descripcion: "",
      foto_url: null,
    };

    await api.listAnimals();
    await api.getAnimal(animalId);
    await api.createAnimal(animalPayload);
    await api.addSighting(animalId, sightingPayload);
    await api.getAnimalHistory(animalId);
    await api.confirmSighting(sightingId);
    await api.unconfirmSighting(sightingId);
    await api.getSightingConfirmations(sightingId);
    await api.deleteSighting(sightingId);

    const calls = fetchMock.mock.calls.map(([url, options]) => ({
      auth: options.headers.get("Authorization"),
      body: options.body,
      method: options.method || "GET",
      url,
    }));

    expect(calls).toMatchObject([
      { method: "GET", url: "http://127.0.0.1:8000/animales/" },
      { method: "GET", url: `http://127.0.0.1:8000/animales/${animalId}` },
      { auth: "Bearer token-123", method: "POST", url: "http://127.0.0.1:8000/animales/" },
      { auth: "Bearer token-123", method: "POST", url: `http://127.0.0.1:8000/animales/${animalId}/avistamientos` },
      { method: "GET", url: `http://127.0.0.1:8000/animales/${animalId}/historial` },
      { auth: "Bearer token-123", method: "POST", url: `http://127.0.0.1:8000/avistamientos/${sightingId}/confirmar` },
      { auth: "Bearer token-123", method: "DELETE", url: `http://127.0.0.1:8000/avistamientos/${sightingId}/confirmar` },
      { method: "GET", url: `http://127.0.0.1:8000/avistamientos/${sightingId}/confirmaciones` },
      { auth: "Bearer token-123", method: "DELETE", url: `http://127.0.0.1:8000/avistamientos/${sightingId}` },
    ]);
    expect(JSON.parse(calls[2].body)).toEqual(animalPayload);
    expect(JSON.parse(calls[3].body)).toEqual(sightingPayload);
  });
});
