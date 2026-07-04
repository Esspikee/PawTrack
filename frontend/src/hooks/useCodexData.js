import { useEffect, useMemo, useState } from "react";
import { buildCodex } from "../utils/codex";
import { usePawTrack } from "../context/usePawTrack";

const emptyCodex = buildCodex();

export function useCodexData() {
  const {
    animals,
    animalsError,
    animalsLoading,
    currentUser,
    loadHistory,
  } = usePawTrack();
  const [historiesByAnimalId, setHistoriesByAnimalId] = useState({});
  const [historyError, setHistoryError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    let active = true;

    if (!currentUser || animalsLoading) {
      return () => { active = false; };
    }

    Promise.resolve()
      .then(() => {
        if (active) {
          setHistoryLoading(true);
          setHistoryError("");
        }
        return Promise.all(animals.map(async (animal) => {
          const history = await loadHistory(animal.id);
          return [animal.id, history];
        }));
      })
      .then((entries) => {
        if (active) setHistoriesByAnimalId(Object.fromEntries(entries));
      })
      .catch((error) => {
        if (active) setHistoryError(error.message);
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });

    return () => { active = false; };
  }, [animals, animalsLoading, currentUser, loadHistory]);

  const codex = useMemo(() => {
    if (!currentUser) return emptyCodex;
    return buildCodex({
      animals,
      currentUserId: currentUser.id,
      historiesByAnimalId,
    });
  }, [animals, currentUser, historiesByAnimalId]);

  return {
    codex,
    error: animalsError || historyError,
    loading: animalsLoading || Boolean(currentUser && historyLoading),
  };
}
