// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { PawTrackContext } from "../context/usePawTrack";
import { api } from "../services/api";
import DeleteSightingButton from "./DeleteSightingButton";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function mount(userId = "me") {
  const onDeleted = vi.fn();
  render(<PawTrackContext.Provider value={{ currentUser: userId ? { id: userId } : null,
    loadAnimals: vi.fn().mockResolvedValue([]), loadCurrentUser: vi.fn().mockRejectedValue(new Error("offline")),
    loadAchievements: vi.fn().mockResolvedValue([]) }}>
    <DeleteSightingButton sighting={{ id: "s", userId: "me" }} onDeleted={onDeleted} />
  </PawTrackContext.Provider>);
  return onDeleted;
}
it.each([null, "other"])("hides deletion for non-author %s", (id) => {
  mount(id);
  expect(screen.queryByRole("button")).toBeNull();
});
it("requires confirmation", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(false);
  const remove = vi.spyOn(api, "deleteSighting");
  mount();
  await userEvent.click(screen.getByRole("button"));
  expect(remove).not.toHaveBeenCalled();
});
it("keeps successful deletion successful when profile refresh fails", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  vi.spyOn(api, "deleteSighting").mockResolvedValue({ animal_eliminado: true });
  const onDeleted = mount();
  await userEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce());
  expect(screen.queryByRole("alert")).toBeNull();
});
it("keeps the sighting visible when deletion fails", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  vi.spyOn(api, "deleteSighting").mockRejectedValue(new Error("Sin permisos"));
  const onDeleted = mount();
  await userEvent.click(screen.getByRole("button"));
  await screen.findByText("Sin permisos");
  expect(onDeleted).not.toHaveBeenCalled();
});
