// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGeolocation } from "./useGeolocation";

const successPosition = {
  coords: {
    latitude: 4.711,
    longitude: -74.0721,
  },
};

const newerPosition = {
  coords: {
    latitude: 6.2442,
    longitude: -75.5812,
  },
};

function setNavigatorValue(name, value) {
  Object.defineProperty(navigator, name, {
    configurable: true,
    value,
  });
}

function setSecureContext(value) {
  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value,
  });
}

function mockGeolocation(implementation) {
  const getCurrentPosition = vi.fn(implementation);
  setNavigatorValue("geolocation", { getCurrentPosition });
  return getCurrentPosition;
}

function mockAppleMobile() {
  setNavigatorValue("userAgent", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");
  setNavigatorValue("platform", "iPhone");
  setNavigatorValue("maxTouchPoints", 5);
}

describe("useGeolocation", () => {
  beforeEach(() => {
    setSecureContext(true);
    setNavigatorValue("userAgent", "Mozilla/5.0");
    setNavigatorValue("platform", "Win32");
    setNavigatorValue("maxTouchPoints", 0);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("asks iOS users to start GPS from a tap instead of auto-locating on mount", async () => {
    mockAppleMobile();
    const getCurrentPosition = mockGeolocation((resolve) => resolve(successPosition));

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.locationHint).toContain("En iPhone toca Localizar");
    });
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("keeps auto-location enabled on non-iOS devices", async () => {
    const getCurrentPosition = mockGeolocation((resolve) => resolve(successPosition));

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.coordinates).toEqual({ latitude: "4.711000", longitude: "-74.072100" });
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(getCurrentPosition.mock.calls[0][2].enableHighAccuracy).toBe(true);
  });

  it("falls back from balanced to precise location on iOS", async () => {
    mockAppleMobile();
    const getCurrentPosition = mockGeolocation((resolve, reject) => {
      if (getCurrentPosition.mock.calls.length === 1) {
        reject({ code: 3 });
        return;
      }
      resolve(successPosition);
    });

    const { result } = renderHook(() => useGeolocation({ auto: false }));

    await act(async () => {
      await result.current.locate();
    });

    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
    expect(getCurrentPosition.mock.calls[0][2].enableHighAccuracy).toBe(false);
    expect(getCurrentPosition.mock.calls[0][2].maximumAge).toBe(60000);
    expect(getCurrentPosition.mock.calls[1][2].enableHighAccuracy).toBe(true);
    expect(result.current.coordinates).toEqual({ latitude: "4.711000", longitude: "-74.072100" });
    expect(result.current.locationError).toBe("");
  });

  it("shows a manual-coordinate fallback when geolocation is denied", async () => {
    mockGeolocation((resolve, reject) => reject({ code: 1 }));

    const { result } = renderHook(() => useGeolocation({ auto: false }));

    await act(async () => {
      await result.current.locate();
    });

    expect(result.current.coordinates).toEqual({ latitude: "", longitude: "" });
    expect(result.current.locationError).toContain("Permiso de ubicacion denegado");
    expect(result.current.locationHint).toContain("latitud y longitud");
  });

  it("explains secure-context requirements before requesting GPS", async () => {
    setSecureContext(false);
    const getCurrentPosition = mockGeolocation((resolve) => resolve(successPosition));

    const { result } = renderHook(() => useGeolocation({ auto: false }));

    await act(async () => {
      await result.current.locate();
    });

    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(result.current.locationError).toContain("HTTPS");
  });

  it("ignores stale GPS responses when requests overlap", async () => {
    const resolvers = [];
    mockGeolocation((resolve) => {
      resolvers.push(resolve);
    });

    const { result } = renderHook(() => useGeolocation({ auto: false }));
    let firstRequest;
    let secondRequest;

    act(() => {
      firstRequest = result.current.locate();
      secondRequest = result.current.locate();
    });

    await act(async () => {
      resolvers[1](newerPosition);
      await secondRequest;
    });

    expect(result.current.coordinates).toEqual({ latitude: "6.244200", longitude: "-75.581200" });

    await act(async () => {
      resolvers[0](successPosition);
      await firstRequest;
    });

    expect(result.current.coordinates).toEqual({ latitude: "6.244200", longitude: "-75.581200" });
  });
});
