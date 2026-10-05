import english from "./en.json";

export function resolveLocale(preference, browserLanguage = "es") {
  const language = preference === "auto" ? browserLanguage : preference;
  return /^en(?:-|$)/i.test(language || "") ? "en" : "es";
}

export function readLanguagePreference() {
  try {
    const saved = window.localStorage.getItem("pawtrack-locale");
    return ["es", "en", "auto"].includes(saved) ? saved : "auto";
  } catch { return "auto"; }
}

export function translate(locale, message, values = {}) {
  if (typeof message !== "string") return message;
  const text = locale === "en" ? english[message] ?? message : message;
  return text.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}
