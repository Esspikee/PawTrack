// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PawTrackContext } from "../context/usePawTrack";
import CreateAnimal from "./CreateAnimal";
import ReportSighting from "./ReportSighting";

const geoMock = vi.hoisted(() => ({
  state: {
    coordinates: { latitude: "", longitude: "" },
    locate: vi.fn(),
    locating: false,
    locationError: "",
    locationHint: "En iPhone toca Localizar para permitir el GPS. Si no aparece, escribe las coordenadas manualmente.",
    setCoordinates: vi.fn(),
  },
}));

vi.mock("../hooks/useGeolocation", () => ({
  useGeolocation: () => geoMock.state,
}));

vi.mock("../components/PhotoCapture", () => ({
  default: () => <div>Foto mock</div>,
}));

const baseContext = {
  addSighting: vi.fn(),
  animals: [
    {
      id: "animal-1",
      name: "Buddy",
      species: "Perro",
    },
  ],
  animalsError: "",
  animalsLoading: false,
  createAnimal: vi.fn(),
};

function renderWithContext(ui, context = {}) {
  return render(
    <PawTrackContext.Provider value={{ ...baseContext, ...context }}>
      <MemoryRouter>{ui}</MemoryRouter>
    </PawTrackContext.Provider>,
  );
}

describe("geolocation screens", () => {
  beforeEach(() => {
    geoMock.state = {
      coordinates: { latitude: "", longitude: "" },
      locate: vi.fn(),
      locating: false,
      locationError: "",
      locationHint: "En iPhone toca Localizar para permitir el GPS. Si no aparece, escribe las coordenadas manualmente.",
      setCoordinates: vi.fn(),
    };
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("keeps manual coordinates available on the create animal screen when iOS needs a tap", async () => {
    renderWithContext(<CreateAnimal />);

    expect(screen.getByText(/En iPhone toca Localizar/)).toBeTruthy();
    expect(screen.getByLabelText("Latitud")).toBeTruthy();
    expect(screen.getByLabelText("Longitud")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Localizar" }));
    expect(geoMock.state.locate).toHaveBeenCalledTimes(1);
  });

  it("keeps manual coordinates available on the report sighting screen when iOS needs a tap", async () => {
    renderWithContext(<ReportSighting />);

    expect(screen.getByText(/En iPhone toca Localizar/)).toBeTruthy();
    expect(screen.getByText("Ubicacion manual")).toBeTruthy();
    await userEvent.click(screen.getByText("Ubicacion manual"));
    expect(screen.getByLabelText("Latitud")).toBeTruthy();
    expect(screen.getByLabelText("Longitud")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Localizar" }));
    expect(geoMock.state.locate).toHaveBeenCalledTimes(1);
  });
});
