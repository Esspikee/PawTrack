// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { clearToken, setToken } from "../services/api";
import ProtectedRoute from "./ProtectedRoute";

function TestRoutes() {
  return (
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/login" element={<p>Login</p>} />
        <Route path="/dashboard" element={<ProtectedRoute><p>Dashboard privado</p></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>
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
    render(<TestRoutes />);
    expect(screen.getByText("Dashboard privado")).toBeTruthy();
  });
});
