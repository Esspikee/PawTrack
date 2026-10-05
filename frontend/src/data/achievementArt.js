// Explicit backend achievement IDs keep art stable across translated titles and sorting.
export const ACHIEVEMENT_ART = {
  first_steps: { asset: "first-steps" },
  explorer_i: { asset: "explorer", tier: 1 },
  explorer_ii: { asset: "explorer", tier: 2 },
  explorer_iii: { asset: "explorer", tier: 3 },
  three_huskies: { asset: "pack", tier: 1 },
  pack_caller_ii: { asset: "pack", tier: 2 },
  pack_caller_iii: { asset: "pack", tier: 3 },
  pack_caller_iv: { asset: "pack", tier: 4 },
  pack_caller_v: { asset: "pack", tier: 5 },
  dog_enthusiast_i: { asset: "dog-enthusiast", tier: 1 },
  dog_enthusiast_ii: { asset: "dog-enthusiast", tier: 2 },
  dog_enthusiast_iii: { asset: "dog-enthusiast", tier: 3 },
  cat_enthusiast_i: { asset: "cat-enthusiast", tier: 1 },
  cat_enthusiast_ii: { asset: "cat-enthusiast", tier: 2 },
  cat_enthusiast_iii: { asset: "cat-enthusiast", tier: 3 },
  new_discovery: { asset: "collector" },
  collector_i: { asset: "collector", tier: 1 },
  collector_ii: { asset: "collector", tier: 2 },
  master_collector: { asset: "master-collector", ornament: "crown" },
  daily_explorer: { asset: "streak", tier: 1 },
  field_researcher: { asset: "streak", tier: 2 },
  wildlife_expert: { asset: "streak", tier: 3 },
  master_naturalist: { asset: "streak", tier: 4 },
  dog_lover: { asset: "dog-enthusiast", ornament: "heart" },
  cat_lover: { asset: "cat-enthusiast", ornament: "heart" },
  field_veteran: { asset: "veteran", ornament: "crown" },
  lucky_encounter: { asset: "lucky" },
  perfect_balance: { asset: "balance" },
  double_discovery: { asset: "double-discovery" },
};

const rarities = new Set(["common", "uncommon", "rare", "epic", "legendary"]);
const numerals = ["", "I", "II", "III", "IV", "V"];

export function getAchievementArt(achievement) {
  // Do not reveal hidden families, tiers or rarity through art or accessible labels.
  if (achievement.hidden && !achievement.completed) {
    return { asset: "mystery", tier: 0, numeral: "", rarity: "common", state: "hidden", label: "Logro oculto" };
  }
  const art = Object.hasOwn(ACHIEVEMENT_ART, achievement.id) ? ACHIEVEMENT_ART[achievement.id] : {};
  const tier = art.tier || 0;
  return {
    ...art, tier, numeral: numerals[tier],
    rarity: rarities.has(achievement.rarity) ? achievement.rarity : "common",
    state: achievement.completed ? "earned" : "pending",
    label: `${achievement.label || "Logro"}${tier ? ` · Nivel ${numerals[tier]}` : ""} · ${achievement.completed ? "Desbloqueado" : "Pendiente"}`,
  };
}
