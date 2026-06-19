import { createContext, useContext } from "react";

export const PawTrackContext = createContext(null);

export function usePawTrack() {
  const context = useContext(PawTrackContext);

  if (!context) {
    throw new Error("usePawTrack must be used inside PawTrackProvider");
  }

  return context;
}
