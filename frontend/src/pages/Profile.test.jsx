// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { PawTrackContext } from "../context/usePawTrack";
import Profile from "./Profile";

afterEach(cleanup);
function mount(overrides = {}) {
  render(<PawTrackContext.Provider value={{ locale: "en", achievementPoints: 25,
    currentUser: { username: "Bryan", level: 2, rank: "Explorador", points: 34, xpProgress: 60,
      sightings: 6, animalsDiscovered: 3, confirmations: 4 },
    loadAchievements: vi.fn().mockResolvedValue(), ...overrides,
  }}><MemoryRouter><Profile /></MemoryRouter></PawTrackContext.Provider>);
}

it("shows live progress and only the three most recently earned badges", async () => {
  mount({ achievements: [
    { id: "first_steps", label: "Older badge", completed: true, unlockedAt: "2026-01-01" },
    { id: "explorer_i", label: "Explorer badge", completed: true, unlockedAt: "2026-01-02" },
    { id: "collector_i", label: "Collector badge", completed: true, unlockedAt: "2026-01-03" },
    { id: "lucky_encounter", label: "Secret earned badge", hidden: true, completed: true, unlockedAt: "2026-01-04" },
    { id: "perfect_balance", label: "Secret unearned badge", hidden: true, completed: false },
  ] });
  expect(screen.getByText("34 / 50 XP")).toBeTruthy();
  expect(screen.getByText("16 XP to level up")).toBeTruthy();
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("60");
  const names = screen.getAllByRole("listitem").map((item) => item.textContent);
  expect(names[0]).toContain("Secret earned badge");
  expect(names).toHaveLength(3);
  expect(screen.queryByText("Older badge")).toBeNull();
  expect(screen.queryByText("Secret unearned badge")).toBeNull();
  expect(screen.getByRole("link", { name: /My sightings/ }).getAttribute("href")).toBe("/my-sightings");
  expect(screen.getByRole("link", { name: "View all →" }).getAttribute("href")).toBe("/codex/achievements");
  expect(screen.queryByRole("button", { name: "Log out" })).toBeNull();
  await screen.findByText("25 Paw points");
});

it("handles a new account without displaying unearned badges", async () => {
  mount({ achievementPoints: 0, achievements: [], currentUser: { username: "New", level: 1,
    rank: "Novato", points: 0, xpProgress: 0, sightings: 0, animalsDiscovered: 0, confirmations: 0 } });
  await screen.findByText("Your achievements will appear here when you complete them.");
  expect(screen.queryByRole("listitem")).toBeNull();
  expect(screen.getByText("0 / 10 XP")).toBeTruthy();
});

it("shows maximum-level progress without an imaginary next level", async () => {
  mount({ currentUser: { username: "Legend", level: 5, rank: "Leyenda", points: 600, xpProgress: 100 } });
  expect(screen.getByText("600 XP")).toBeTruthy();
  expect(screen.getByText("You reached Legend level!")).toBeTruthy();
  await screen.findByText("Your achievements will appear here when you complete them.");
});
