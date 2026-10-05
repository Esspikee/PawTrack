// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { PawTrackContext } from "../context/usePawTrack";
import { api } from "../services/api";
import AnimalHistory from "./AnimalHistory";

function mountHistory(context, initial = "/animals/a/history") {
  return render(<PawTrackContext.Provider value={context}>
    <MemoryRouter initialEntries={[initial]}>
      <Link to="/animals/b/history">Open another animal</Link>
      <Routes><Route path="/animals/:animalId/history" element={<AnimalHistory />} /></Routes>
    </MemoryRouter>
  </PawTrackContext.Provider>);
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("animal history recovery", () => {
  it("clears an earlier load error when another animal loads successfully", async () => {
    const loadAnimalDetail = vi.fn().mockRejectedValueOnce(new Error("Animal unavailable"))
      .mockResolvedValue({ id: "b", name: "Luna" });
    mountHistory({ loadAnimalDetail, loadHistory: vi.fn().mockResolvedValue([]) });
    await screen.findByText("Animal unavailable");
    await userEvent.click(screen.getByText("Open another animal"));
    await screen.findByText("Luna");
    expect(screen.queryByText("Animal unavailable")).toBeNull();
  });

  it("refreshes catalog confirmation counts and preserves a successful confirmation if profile refresh fails", async () => {
    vi.spyOn(api, "getSightingConfirmations").mockResolvedValue({ usuarios: [] });
    vi.spyOn(api, "confirmSighting").mockResolvedValue({});
    const loadAnimals = vi.fn().mockResolvedValue([]);
    const loadCurrentUser = vi.fn().mockRejectedValue(new Error("Profile unavailable"));
    mountHistory({ currentUser: { id: "me" }, loadAnimals, loadCurrentUser,
      loadAnimalDetail: vi.fn().mockResolvedValue({ id: "a", name: "Luna" }),
      loadHistory: vi.fn().mockResolvedValue([{ id: "s", userId: "other", confirmations: 0, description: "At the park" }]),
    });
    await userEvent.click(await screen.findByRole("button", { name: "Confirmar" }));
    await screen.findByRole("button", { name: "Retirar" });
    await waitFor(() => expect(loadAnimals).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
