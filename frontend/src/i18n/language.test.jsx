// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PawTrackProvider } from "../context/PawTrackContext";
import { api, setToken } from "../services/api";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import { formatDateTime, formatRelativeTime } from "../utils/dataMappers";
import { resolveLocale, translate } from "./translate";

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("pawtrack-locale", "es");
  setToken("language-test");
  vi.spyOn(api, "health").mockResolvedValue({ environment: "test", version: "test" });
  vi.spyOn(api, "getMe").mockResolvedValue({ id_usuario: "u", username: "Novato", nivel_actual: 1, puntos_totales: 0 });
  vi.spyOn(api, "listAnimals").mockResolvedValue([]);
  vi.spyOn(api, "listAchievements").mockResolvedValue({ logros: [] });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

function mount() {
  return render(<MemoryRouter initialEntries={["/settings"]}><PawTrackProvider><Routes>
    <Route path="/settings" element={<Settings />} />
    <Route path="/profile" element={<Profile />} />
  </Routes></PawTrackProvider></MemoryRouter>);
}

it("changes screens immediately, preserves user text and keeps the choice after remount", async () => {
  const first = mount();
  await screen.findByText("Sesion de Novato");
  await userEvent.click(screen.getByRole("button", { name: "Inglés" }));
  await screen.findByRole("heading", { name: "Settings" });
  expect(document.documentElement.lang).toBe("en");
  expect(localStorage.getItem("pawtrack-locale")).toBe("en");
  await userEvent.click(screen.getByRole("link", { name: "Profile", exact: true }));
  await screen.findByRole("heading", { name: "My profile" });
  expect(screen.getByText("Novato")).toBeTruthy(); // Username must never be translated.
  expect(screen.getByText(/Level 1 - Beginner/)).toBeTruthy();
  first.unmount();
  mount();
  await screen.findByRole("heading", { name: "Settings" });
  expect(screen.getByRole("button", { name: "English" }).getAttribute("aria-pressed")).toBe("true");
  await userEvent.click(screen.getByRole("button", { name: "Español" }));
  await screen.findByRole("heading", { name: "Configuracion" });
  expect(document.documentElement.lang).toBe("es");
});

it("persists Auto and follows browser language changes with a supported fallback", async () => {
  const browserLanguage = vi.spyOn(navigator, "language", "get").mockReturnValue("en-US");
  mount();
  await userEvent.click(screen.getByRole("button", { name: "Auto" }));
  await screen.findByRole("heading", { name: "Settings" });
  expect(localStorage.getItem("pawtrack-locale")).toBe("auto");
  expect(screen.getByRole("button", { name: "Auto" }).getAttribute("aria-pressed")).toBe("true");
  browserLanguage.mockReturnValue("fr-FR");
  act(() => window.dispatchEvent(new Event("languagechange")));
  await waitFor(() => expect(document.documentElement.lang).toBe("es"));
  expect(screen.getByRole("heading", { name: "Configuracion" })).toBeTruthy();
});

it("localizes dates, relative times and placeholders without translating interpolated data", () => {
  expect(resolveLocale("auto", "en-GB")).toBe("en");
  expect(resolveLocale("auto", "fr")).toBe("es");
  expect(translate("en", "Sesion de {0}", { 0: "Novato" })).toBe("Signed in as Novato");
  expect(formatDateTime("2026-10-05T12:00:00Z", "en").date).toContain("Oct");
  expect(formatDateTime("2026-10-05T12:00:00Z", "es").date).not.toBe(formatDateTime("2026-10-05T12:00:00Z", "en").date);
  expect(formatRelativeTime(new Date(Date.now() - 3600000), "en")).toBe("1 hour ago");
});
