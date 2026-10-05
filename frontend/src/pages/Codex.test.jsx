// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import Codex from "./Codex";
import { PawTrackContext } from "../context/usePawTrack";

vi.mock("../hooks/useCodexData", () => ({ useCodexData: () => ({
  codex: {
    all: [
      { id: "husky", animalType: "dog", breed: { displayName: "Husky" }, discovered: true, totalSightings: 2 },
      { id: "siamese", animalType: "cat", breed: { displayName: "Siamés" }, discovered: false },
    ],
    overallProgress: { discovered: 1, total: 2, percent: 50 },
    progressByType: { dog: { discovered: 1, total: 1 }, cat: { discovered: 0, total: 1 } },
  }, error: "", loading: false,
}) }));
const base = { icon: "trophy", detail: "Completa la meta", rarityLabel: "Común", pawPrintReward: 5, current: 1, goal: 5, progress: 20 };
let loadAchievements;
beforeEach(() => { loadAchievements = vi.fn().mockResolvedValue({}); });
afterEach(cleanup);
function setup(path = "/codex", achievements = []) {
  return render(<PawTrackContext.Provider value={{ achievements, achievementPoints: 12, loadAchievements }}><MemoryRouter initialEntries={[path]}><Codex /></MemoryRouter></PawTrackContext.Provider>);
}
it("filters species and searches accents while preserving breed detail links", async () => {
  setup();
  expect(screen.getByRole("link", { name: /Husky/ }).getAttribute("href")).toBe("/codex/bestiary/dogs/husky");
  await userEvent.click(screen.getByRole("button", { name: "Gatos" }));
  expect(screen.queryByRole("link", { name: /Husky/ })).toBeNull();
  await userEvent.type(screen.getByRole("searchbox"), "siames");
  expect(screen.getByRole("link", { name: /Siamés/ })).toBeTruthy();
  await userEvent.type(screen.getByRole("searchbox"), "xxx");
  expect(screen.getByText(/No hay razas/)).toBeTruthy();
});
it("chooses the closest visible goal and keeps hidden achievement details private", async () => {
  setup("/codex/achievements", [
    { ...base, id: "done", label: "Primer encuentro", completed: true },
    { ...base, id: "next", label: "Explorador", progress: 60 },
    { ...base, id: "other", label: "Coleccionista" },
    { ...base, id: "secret", label: "Secret title", detail: "Secret condition", hidden: true, progress: 99 },
  ]);
  await waitFor(() => expect(loadAchievements).toHaveBeenCalled());
  expect(screen.getByText("1 desbloqueados")).toBeTruthy();
  expect(screen.getByText("12 Patitas")).toBeTruthy();
  expect(screen.getByText("Explorador").closest("article").className).toContain("featured-achievement");
  expect(screen.getByLabelText("Completado")).toBeTruthy();
  expect(screen.queryByText("Secret title")).toBeNull();
  expect(screen.queryByText("Secret condition")).toBeNull();
  expect(screen.getByText("Logro oculto")).toBeTruthy();
});
it("preserves search and species between sections", async () => {
  setup("/codex?species=cat&q=siames");
  await userEvent.click(screen.getByRole("link", { name: "Logros", exact: true }));
  await screen.findByText("Aún no hay logros disponibles.");
  await userEvent.click(screen.getByRole("link", { name: "Bestiario", exact: true }));
  expect(screen.getByRole("searchbox").value).toBe("siames");
  expect(screen.queryByRole("link", { name: /Husky/ })).toBeNull();
});
it("retries failed achievement loading", async () => {
  loadAchievements.mockRejectedValueOnce(new Error("Sin conexión"));
  setup("/codex/achievements");
  await screen.findByText("Sin conexión");
  await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
  await screen.findByText("Aún no hay logros disponibles.");
  expect(loadAchievements).toHaveBeenCalledTimes(2);
});
