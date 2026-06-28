// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PawTrackContext } from "../context/usePawTrack";
import { clearToken, setToken } from "../services/api";
import ProtectedRoute from "./ProtectedRoute";

const baseContext = {
  authenticated: false,
  userLoading: false,
};

function TestRoutes({ context = baseContext }) {
  return (
    <PawTrackContext.Provider value={context}>
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<p>Login</p>} />
          <Route path="/dashboard" element={<ProtectedRoute><p>Dashboard privado</p></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </PawTrackContext.Provider>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(clearToken);
  afterEach(cleanup);

  it("redirects visitors without a token", () => {
    render(<TestRoutes />);
    expect(screen.getByText("Login")).toBeTruthy();
  });

  it("renders protected content when a token exists", () => {
    setToken("valid-token");
    render(<TestRoutes context={{ ...baseContext, authenticated: true }} />);
    expect(screen.getByText("Dashboard privado")).toBeTruthy();
  });

  it("shows a verification state while a token is being checked", () => {
    setToken("pending-token");
    render(<TestRoutes context={{ ...baseContext, authenticated: true, userLoading: true }} />);
    expect(screen.getByText("Verificando sesion...")).toBeTruthy();
  });

  it("redirects when the token exists but app auth has been cleared", () => {
    setToken("stale-token");
    render(<TestRoutes context={{ ...baseContext, authenticated: false }} />);
    expect(screen.getByText("Login")).toBeTruthy();
  });
});
