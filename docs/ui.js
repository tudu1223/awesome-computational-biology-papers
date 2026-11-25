const storageKey = "literature-atlas-language";

export function getLanguage() {
  const requested = new URLSearchParams(location.search).get("lang");
  if (requested === "zh" || requested === "en") return requested;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    // Language selection works without local storage.
  }
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function rememberLanguage(language) {
  try {
    localStorage.setItem(storageKey, language);
  } catch {
    // The URL retains the selected language.
  }
}

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function trendUrl(language, theme, topic) {
  const params = new URLSearchParams({ lang: language });
  if (theme) params.set("theme", theme);
  if (topic) params.set("topic", topic);
  return `./topics.html?${params}`;
}
