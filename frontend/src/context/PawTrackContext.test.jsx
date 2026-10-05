// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PawTrackProvider } from "./PawTrackContext";
import { usePawTrack } from "./usePawTrack";
import { api, clearToken, setToken } from "../services/api";

const user = { id_usuario: "user-a", username: "Ana", nivel_actual: 1, puntos_totales: 0 };
const animal = { id_animal: "animal-a", especie: "Gato", color_principal: "Negro" };
const sighting = { id_avistamiento: "sighting-a", id_animal: "animal-a" };
async function mountSession() {
  const hook = renderHook(usePawTrack, { wrapper: PawTrackProvider });
  await waitFor(() => expect(hook.result.current.currentUser?.id).toBe("user-a"));
  return hook;
}

describe("session and save recovery", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearToken();
    setToken("session-a");
    vi.spyOn(api, "listAnimals").mockResolvedValue([]);
    vi.spyOn(api, "getMe").mockResolvedValue(user);
    vi.spyOn(api, "listAchievements").mockResolvedValue({ logros: [], puntos_logros: 0 });
  });
  afterEach(() => { cleanup(); clearToken(); vi.restoreAllMocks(); });

  it.each(["animal", "sighting"])("returns the saved %s when a later stats refresh fails", async (kind) => {
    vi.spyOn(api, "createAnimal").mockResolvedValue(animal);
    vi.spyOn(api, "addSighting").mockResolvedValue(sighting);
    const { result } = await mountSession();
    api.getMe.mockRejectedValue(new Error("Temporary profile outage"));
    await act(async () => {
      const save = kind === "animal" ? result.current.createAnimal({}) : result.current.addSighting("animal-a", {});
      await expect(save).resolves.toMatchObject({ id: `${kind}-a` });
    });
    expect(kind === "animal" ? api.createAnimal : api.addSighting).toHaveBeenCalledTimes(1);
  });

  it("does not restore a profile after logout while its request is pending", async () => {
    const { result } = await mountSession();
    const pending = Promise.withResolvers();
    api.getMe.mockReturnValue(pending.promise);
    let refresh;
    act(() => { refresh = result.current.loadCurrentUser(); });
    act(() => result.current.logout());
    await act(async () => { pending.resolve(user); await refresh; });
    expect(result.current.authenticated).toBe(false);
    expect(result.current.currentUser).toBeNull();
  });

  it("does not restore achievement points after logout", async () => {
    const { result } = await mountSession();
    const pending = Promise.withResolvers();
    api.listAchievements.mockReturnValue(pending.promise);
    let refresh;
    act(() => { refresh = result.current.loadAchievements(); });
    act(() => result.current.logout());
    await act(async () => { pending.resolve({ logros: [], puntos_logros: 100 }); await refresh; });
    expect(result.current.achievementPoints).toBe(0);
  });
});
