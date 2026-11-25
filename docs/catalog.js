import { kinds, themes } from "./taxonomy.js";

export const pageSize = 18;
export const defaults = {
  q: "", theme: "", topic: "", year: "", kind: "", collection: "", sort: "", page: 1,
};

export function annualTrend(papers, theme, topic) {
  const counts = new Map();
  for (const paper of papers) {
    if (paper.section !== theme || (topic && paper.topic !== topic)) continue;
    counts.set(paper.year, (counts.get(paper.year) ?? 0) + 1);
  }
  const years = [...counts.keys()].sort((a, b) => a - b);
  if (!years.length) return [];
  const firstYear = years[0];
  const lastYear = Math.max(...papers.map((paper) => paper.year));
  return Array.from({ length: lastYear - firstYear + 1 }, (_, i) => ({
    year: firstYear + i,
    count: counts.get(firstYear + i) ?? 0,
  }));
}

export function normalize(text) {
  return text.normalize("NFKD").toLowerCase().replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function indexPapers(papers) {
  return papers.map((paper) => ({
    ...paper,
    titleIndex: normalize(paper.title),
    aliasIndex: normalize(paper.alias ?? ""),
    searchIndex: normalize([
      paper.title, paper.venue, paper.year, paper.doi, paper.url, paper.alias,
      paper.authors?.join(" "), paper.notes?.en, paper.notes?.zh,
      paper.topicHint, ...themes[paper.section].name,
      ...themes[paper.section].topics[paper.topic],
    ].filter(Boolean).join(" ")),
  }));
}

export function parseFilters(params, years) {
  const theme = params.get("theme") ?? "";
  const topic = params.get("topic") ?? "";
  const kind = params.get("kind") ?? "";
  const year = params.get("year") ?? "";
  const collection = params.get("collection") ?? "";
  const sorting = params.get("sort") ?? "";
  const page = params.get("page") ?? "";
  return {
    q: (params.get("q") ?? "").slice(0, 180),
    theme: Object.hasOwn(themes, theme) ? theme : "",
    topic: Object.hasOwn(themes, theme) && Object.hasOwn(themes[theme].topics, topic) ? topic : "",
    year: years.some((value) => String(value) === year) ? year : "",
    kind: Object.hasOwn(kinds, kind) ? kind : "",
    collection: ["featured", "index"].includes(collection) ? collection : "",
    sort: ["new", "old", "title"].includes(sorting) ? sorting : "",
    page: /^\d{1,6}$/.test(page) ? Math.max(1, Number(page)) : 1,
  };
}

export function selectPapers(index, filters) {
  const query = normalize(filters.q);
  const tokens = query.split(" ").filter(Boolean);
  const selected = index.filter((paper) =>
    (!filters.theme || paper.section === filters.theme) &&
    (!filters.topic || paper.topic === filters.topic) &&
    (!filters.year || paper.year === Number(filters.year)) &&
    (!filters.kind || paper.kind === filters.kind) &&
    (!filters.collection || paper.collection === filters.collection) &&
    tokens.every((token) => paper.searchIndex.includes(token))
  );
  const score = (paper) => (
    Number(paper.titleIndex.includes(query)) * 6 +
    Number(paper.aliasIndex === query) * 5 +
    tokens.filter((token) => paper.titleIndex.includes(token)).length
  );
  const compareTitles = (a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" });
  return selected.sort((a, b) => {
    if (filters.sort === "old") return a.year - b.year || compareTitles(a, b);
    if (filters.sort === "title") return compareTitles(a, b);
    const relevance = query && !filters.sort ? score(b) - score(a) : 0;
    return relevance || b.year - a.year || compareTitles(a, b);
  });
}
