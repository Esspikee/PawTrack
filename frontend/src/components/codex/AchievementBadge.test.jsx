// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import AchievementBadge from "./AchievementBadge";

afterEach(cleanup);

it("keeps hidden badge art and accessible text secret until earned", () => {
  const achievement = { id: "lucky_encounter", label: "Encuentro afortunado", rarity: "rare", hidden: true, completed: false };
  const { container, rerender } = render(<AchievementBadge achievement={achievement} />);
  expect(screen.getByRole("img", { name: "Logro oculto" })).toBeTruthy();
  expect(container.querySelector("img").getAttribute("src")).toBe("/images/achievements/mystery.webp");
  expect(container.innerHTML).not.toContain("lucky.webp");
  expect(container.innerHTML).not.toContain("badge-rare");
  rerender(<AchievementBadge achievement={{ ...achievement, completed: true }} />);
  expect(container.querySelector("img").getAttribute("src")).toBe("/images/achievements/lucky.webp");
  expect(screen.getByRole("img", { name: /Encuentro afortunado.*Desbloqueado/ })).toBeTruthy();
});

it("distinguishes the first and fifth Husky tiers even when rarity or names change", () => {
  const { container, rerender } = render(<AchievementBadge achievement={{ id: "three_huskies", label: "Translated title", rarity: "common" }} />);
  expect(screen.getByText("I")).toBeTruthy();
  expect(container.querySelector("img").getAttribute("src")).toBe("/images/achievements/pack.webp");
  rerender(<AchievementBadge achievement={{ id: "pack_caller_v", label: "Another title", rarity: "legendary", completed: true }} />);
  expect(screen.getByText("V")).toBeTruthy();
  expect(container.querySelector(".badge-legendary.badge-earned")).toBeTruthy();
});

it("recovers from a broken image when reused for another achievement", () => {
  const { container, rerender } = render(<AchievementBadge achievement={{ id: "first_steps", label: "Primeros pasos" }} />);
  fireEvent.error(container.querySelector("img"));
  expect(container.querySelector(".badge-fallback")).toBeTruthy();
  rerender(<AchievementBadge achievement={{ id: "explorer_i", label: "Explorador" }} />);
  expect(container.querySelector("img").getAttribute("src")).toBe("/images/achievements/explorer.webp");
});

it("handles an unmapped future achievement with a readable fallback", () => {
  const { container } = render(<AchievementBadge achievement={{ id: "new_future_goal", label: "Nuevo reto", rarity: "unexpected" }} />);
  expect(screen.getByRole("img", { name: /Nuevo reto.*Pendiente/ })).toBeTruthy();
  expect(container.querySelector(".badge-fallback")).toBeTruthy();
  expect(container.querySelector("img")).toBeNull();
});
