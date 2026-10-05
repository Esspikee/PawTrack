// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PawTrackContext } from "../context/usePawTrack";
import { api } from "../services/api";
import ReportSighting from "./ReportSighting";
import PhotoCapture from "../components/PhotoCapture";

vi.mock("../utils/image", () => ({ compressImage: async (file) => file }));
vi.mock("../hooks/useGeolocation", () => ({ useGeolocation: () => ({
  coordinates: { latitude: "4.7", longitude: "-74" }, locate: vi.fn(), setCoordinates: vi.fn(),
}) }));

describe("photo upload flow", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", class extends URL {
      static createObjectURL() { return "blob:preview"; }
      static revokeObjectURL() {}
    });
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it("requires choosing an animal instead of silently reporting the first one", async () => {
    const addSighting = vi.fn().mockResolvedValue({});
    render(<PawTrackContext.Provider value={{
      addSighting, animals: [{ id: "a", name: "Luna" }], animalsLoading: false,
    }}><MemoryRouter><ReportSighting /></MemoryRouter></PawTrackContext.Provider>);
    await userEvent.click(screen.getByRole("button", { name: "Publicar avistamiento" }));
    expect(addSighting).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("Selecciona el animal que viste.");
    await userEvent.selectOptions(screen.getByRole("combobox"), "a");
    await userEvent.click(screen.getByRole("button", { name: "Publicar avistamiento" }));
    expect(addSighting).toHaveBeenCalledWith("a", expect.objectContaining({ foto_url: null, latitud: 4.7, longitud: -74 }));
  });

  it("waits for the optional photo before submitting a sighting", async () => {
    const pending = Promise.withResolvers();
    vi.spyOn(api, "uploadImage").mockReturnValue(pending.promise);
    const addSighting = vi.fn().mockResolvedValue({});
    const { container } = render(<PawTrackContext.Provider value={{
      addSighting, animals: [{ id: "a", name: "Luna" }], animalsLoading: false,
    }}><MemoryRouter><ReportSighting /></MemoryRouter></PawTrackContext.Provider>);
    await userEvent.selectOptions(screen.getByRole("combobox"), "a");
    await userEvent.upload(container.querySelector('input[type="file"]'), new File(["png"], "cat.png", { type: "image/png" }));
    await waitFor(() => expect(api.uploadImage).toHaveBeenCalled());
    const submit = screen.getByRole("button", { name: "Publicar avistamiento" });
    expect(submit.disabled).toBe(true);
    await userEvent.click(submit);
    expect(addSighting).not.toHaveBeenCalled();
    await act(async () => pending.resolve({ url: "/uploads/cat.png" }));
    await userEvent.click(submit);
    expect(addSighting).toHaveBeenCalledWith("a", expect.objectContaining({ foto_url: "/uploads/cat.png" }));
  });

  it("allows selecting the same file again after an upload failure", async () => {
    vi.spyOn(api, "uploadImage").mockRejectedValueOnce(new Error("Connection lost")).mockResolvedValue({ url: "/uploads/retry.png" });
    const onUploaded = vi.fn();
    const { container } = render(<PhotoCapture onUploaded={onUploaded} />);
    const file = new File(["png"], "cat.png", { type: "image/png" });
    const input = container.querySelector('input[type="file"]');
    await userEvent.upload(input, file);
    await screen.findByText("Connection lost");
    await userEvent.upload(input, file);
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith("/uploads/retry.png"));
  });
});
