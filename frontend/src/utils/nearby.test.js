import { describe, expect, it } from "vitest";
import { distanceKm, distanceLabel, sortNearby, validPosition } from "./nearby";

describe("nearby discovery", () => {
  it("does not treat missing coordinates as the equator", () => {
    for (const latitude of ["", null, undefined, NaN, 91]) expect(validPosition({ latitude, longitude: 0 })).toBe(false);
    expect(validPosition({ latitude: 0, longitude: 0 })).toBe(true);
    expect(distanceKm({ latitude: "", longitude: "" }, { latitude: 0, longitude: 0 })).toBeNull();
  });
  it("calculates geographic distance and sorts closest first", () => {
    const position = { latitude: 0, longitude: 0 };
    const animals = [{ id: "far", latitude: 1, longitude: 0 }, { id: "near", latitude: 0, longitude: .01 }];
    expect(distanceKm(position, animals[0])).toBeCloseTo(111.195, 2);
    expect(sortNearby(animals, position).map(a => a.id)).toEqual(["near", "far"]);
    expect(distanceLabel(.25)).toBe("A 250 m");
    expect(distanceLabel(null)).toBeNull();
  });
  it("falls back to recent sightings without location permission", () => {
    const animals = [{ id: "old", lastSeenAt: "2026-01-01" }, { id: "new", lastSeenAt: "2026-10-01" }];
    expect(sortNearby(animals, {}).map(a => a.id)).toEqual(["new", "old"]);
  });
});
