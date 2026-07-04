// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PawTrackContext } from "../context/usePawTrack";
import LoginForm from "./LoginForm";
import Register from "./Register";

const context = {
  login: vi.fn(),
  register: vi.fn(),
};

function renderAuth(ui) {
  return render(
    <PawTrackContext.Provider value={context}>
      <MemoryRouter>{ui}</MemoryRouter>
    </PawTrackContext.Provider>,
  );
}

describe("password visibility controls", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("toggles the login password field", async () => {
    renderAuth(<LoginForm />);

    const password = screen.getByLabelText("Contrasena");
    expect(password.type).toBe("password");

    await userEvent.click(screen.getByRole("button", { name: "Mostrar contrasena" }));
    expect(password.type).toBe("text");

    await userEvent.click(screen.getByRole("button", { name: "Ocultar contrasena" }));
    expect(password.type).toBe("password");
  });

  it("toggles register password fields independently", async () => {
    renderAuth(<Register />);

    const password = screen.getByLabelText("Contrasena");
    const confirmation = screen.getByLabelText("Confirmar contrasena");

    await userEvent.click(screen.getByRole("button", { name: "Mostrar contrasena" }));
    expect(password.type).toBe("text");
    expect(confirmation.type).toBe("password");

    await userEvent.click(screen.getByRole("button", { name: "Mostrar confirmacion de contrasena" }));
    expect(password.type).toBe("text");
    expect(confirmation.type).toBe("text");
  });
});
