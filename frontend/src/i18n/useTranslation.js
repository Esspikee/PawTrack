import { useCallback, useContext } from "react";
import { PawTrackContext } from "../context/usePawTrack";
import { translate } from "./translate";
import { formatDateTime, formatRelativeTime } from "../utils/dataMappers";

export function useTranslation() {
  const locale = useContext(PawTrackContext)?.locale || "es";
  const t = useCallback((message, values) => translate(locale, message, values), [locale]);
  return {
    t, locale,
    dateTime: (value) => formatDateTime(value, locale),
    relativeTime: (value) => formatRelativeTime(value, locale),
    animalName: (animal) => animal.customName || (animal.raw && !animal.raw.nombre
      ? `${t(animal.species)} · ${animal.color}` : animal.name),
  };
}
