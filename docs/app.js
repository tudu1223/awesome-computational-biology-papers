import { defaults, indexPapers, pageSize, parseFilters, selectPapers } from "./catalog.js";
import { kinds, sources, themes } from "./taxonomy.js";
import { mountSubscriptions } from "./subscriptions.js";
import { element, getLanguage, rememberLanguage, trendUrl } from "./ui.js";

const copy = {
  skip: ["Skip to the library", "跳到文献库"],
  brand: ["Literature Atlas", "文献图谱"],
  primaryNav: ["Primary navigation", "主导航"],
  themesNav: ["Themes", "专题"],
  libraryNav: ["Library", "文献库"],
  trendsNav: ["Trends", "专题趋势"],
  resultsTrend: ["View topic trends", "查看专题趋势"],
  subscribeNav: ["Subscribe", "订阅"],
  subscribeTitle: ["Follow new entries", "订阅新入库文献"],
  subscribeDescription: ["Choose a theme to follow newly added papers by RSS or email.", "选择专题，通过 RSS 或邮件跟踪新入库文献。"],
  feedTheme: ["Subscription theme", "订阅专题"],
  rssLink: ["Open RSS feed", "打开 RSS"],
  emailLink: ["Subscribe via FeedMail", "通过 FeedMail 邮件订阅"],
  feedUrl: ["RSS address", "RSS 地址"],
  copyFeed: ["Copy", "复制"],
  feedNote: ["Confirm email subscriptions on FeedMail. Its delivery plans and limits apply.", "邮件订阅在 FeedMail 确认，发送频率与额度以该服务为准。"],
  recentTitle: ["Recently added", "近期入库"],
  sourcesNav: ["Sources", "来源"],
  github: ["GitHub", "GitHub"],
  language: ["Language", "语言"],
  field: ["Computational biology", "计算生物学"],
  heroTitle: ["A literature atlas", "文献图谱"],
  heroDescription: ["Find the papers, datasets and benchmarks behind single-cell biology, virtual cells and molecular modeling.", "查找单细胞生物学、虚拟细胞和分子建模相关论文、数据资源与评估基准。"],
  explore: ["Explore the library", "检索文献"],
  browse: ["Browse themes", "浏览专题"],
  papersStat: ["Papers", "篇文献"],
  themesStat: ["Themes", "个专题"],
  yearsStat: ["Publication years", "发表年份"],
  themesTitle: ["Explore the field", "按研究主题浏览"],
  themesDescription: ["Choose a theme to browse its methods, resources and related studies.", "选择专题，查看该方向的方法、资源及相关研究。"],
  libraryTitle: ["Find a paper", "查找文献"],
  libraryDescription: ["Search titles, authors, methods and identifiers, or narrow the catalog using the filters.", "可搜索题名、作者、方法名和 DOI，也可组合筛选。"],
  searchLabel: ["Search papers", "搜索文献"],
  searchPlaceholder: ["Try scGPT, Perturb-seq, or Nature Methods", "例如 scGPT、Perturb-seq 或 Nature Methods"],
  themeFilter: ["Theme", "专题"],
  topicFilter: ["Subtopic", "子方向"],
  yearFilter: ["Year", "年份"],
  typeFilter: ["Type", "类型"],
  collectionFilter: ["Collection", "收录方式"],
  sortFilter: ["Sort by", "排序"],
  allThemes: ["All themes", "全部专题"],
  allTopics: ["All subtopics", "全部子方向"],
  chooseTheme: ["Choose a theme first", "请先选择专题"],
  allYears: ["All years", "全部年份"],
  allTypes: ["All types", "全部类型"],
  allCollections: ["All records", "全部文献"],
  featured: ["Editorial picks", "精选导读"],
  index: ["Discovery records", "检索索引"],
  auto: ["Best match / newest", "相关度 / 最新"],
  new: ["Newest first", "年份从新到旧"],
  old: ["Oldest first", "年份从旧到新"],
  title: ["Title A–Z", "按题名 A–Z"],
  loading: ["Loading the catalog…", "正在加载文献目录…"],
  reset: ["Clear filters", "清除筛选"],
  resultsLabel: ["Paper results", "文献结果"],
  pagesLabel: ["Paper result pages", "文献结果分页"],
  previous: ["Previous", "上一页"],
  next: ["Next", "下一页"],
  noResults: ["No matching papers", "未找到匹配文献"],
  noResultsDetail: ["Try a broader term or remove a filter.", "可尝试更宽泛的关键词，或取消一项筛选。"],
  unavailable: ["The catalog could not be loaded", "文献目录加载失败"],
  unavailableDetail: ["Reload the page to try again, or open the bibliography on GitHub.", "可刷新页面重试，或前往 GitHub 查看目录。"],
  code: ["Code or project", "代码或项目"],
  sourcesTitle: ["How the atlas is built", "图谱如何整理"],
  sourcesDescription: ["The reading collection is supplemented by topic-specific discovery. Records link back to their publication sources.", "精选导读配合专题检索扩充覆盖。文献条目链接至原始发表或书目记录。"],
  coverage: ["Coverage depends on source indexing. The catalog includes bibliographic records and original conceptual illustrations.", "覆盖范围受来源索引限制。图谱提供书目信息与原创概念插图。"],
  sourceRecords: ["Browse source", "查看来源"],
  discover: ["Discovered via", "发现来源"],
  updated: ["Catalog updated", "目录更新于"],
  selectionData: ["View search and selection details", "查看检索与筛选记录"],
  footer: ["Computational Biology Literature Atlas", "计算生物学文献图谱"],
  contribute: ["Suggest a paper", "推荐论文"],
  backToTop: ["Back to top", "回到顶部"],
};

const get = (id) => document.getElementById(id);
const languageButtons = document.querySelectorAll("[data-language]");
const fields = Object.fromEntries(["theme", "subtopic", "year", "kind", "collection", "sort"].map((id) => [id, get(id)]));
const queryInput = get("query");
const list = get("results");
let language = getLanguage();
let data;
let index = [];
let years = [];
let filters = { ...defaults };
let queryFrame;

const local = (pair) => pair[language === "zh" ? 1 : 0];
const message = (key) => local(copy[key]);
const formatNumber = (value) => new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en").format(value);
const renderSubscriptions = mountSubscriptions(local);

function externalLink(label, href, className) {
  const link = element("a", className, label);
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function countText(count) {
  return language === "zh" ? `${formatNumber(count)} 篇` : `${formatNumber(count)} ${count === 1 ? "paper" : "papers"}`;
}

function applyLanguage() {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = message("footer");
  document.querySelectorAll("[data-text]").forEach((node) => {
    node.textContent = message(node.dataset.text);
  });
  document.querySelectorAll("[data-aria]").forEach((node) => {
    node.setAttribute("aria-label", message(node.dataset.aria));
  });
  document.querySelectorAll("[data-placeholder]").forEach((node) => {
    node.placeholder = message(node.dataset.placeholder);
  });
  for (const button of languageButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  }
  document.querySelector(".wordmark").setAttribute("aria-label", message("brand"));
  get("trends-nav").href = get("trends-overview").href = trendUrl(language);
  renderSubscriptions();
}

function paramsFor(state) {
  const params = new URLSearchParams({ lang: language });
  for (const key of Object.keys(defaults)) {
    if (state[key] !== defaults[key]) params.set(key, state[key]);
  }
  return params;
}

function synchronizeUrl(method = "replaceState", hash = location.hash) {
  const url = new URL(location.href);
  url.search = paramsFor(filters).toString();
  url.hash = hash;
  history[method](null, "", url);
}

function renderOverview() {
  const grid = get("theme-grid");
  grid.replaceChildren();
  for (const [key, theme] of Object.entries(themes)) {
    const [sheet, half] = theme.art;
    const card = element("a", "theme-card");
    card.href = `?${paramsFor({ ...defaults, theme: key })}#library`;
    card.dataset.half = half;
    const illustration = element("div", "theme-art");
    const image = element("img");
    image.src = `./images/atlas-topics-${sheet}.webp`;
    image.alt = "";
    image.width = 2172;
    image.height = 724;
    image.loading = "lazy";
    illustration.append(image);
    const body = element("div", "theme-body");
    const heading = element("div", "theme-heading");
    const count = index.filter((paper) => paper.section === key).length;
    heading.append(element("h3", "", local(theme.name)), element("span", "theme-count", countText(count)));
    body.append(heading, element("p", "", local(theme.description)));
    card.append(illustration, body);
    card.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      filters = { ...defaults, theme: key };
      renderFilters();
      renderResults();
      synchronizeUrl("pushState", "#library");
      scrollToLibrary();
    });
    grid.append(card);
  }
  get("stat-papers").textContent = formatNumber(index.length);
  get("stat-themes").textContent = formatNumber(Object.keys(themes).length);
  get("stat-years").textContent = `${years.at(-1)}–${years[0]}`;
  get("stats").hidden = false;
}

function makeOptions(field, entries, value) {
  field.replaceChildren(...entries.map(([key, text]) => new Option(text, key)));
  field.value = value;
}

function renderSubtopics() {
  const available = themes[filters.theme]?.topics;
  fields.subtopic.disabled = !available;
  makeOptions(fields.subtopic, [
    ["", message(available ? "allTopics" : "chooseTheme")],
    ...Object.entries(available ?? {}).map(([key, label]) => [key, local(label)]),
  ], filters.topic);
}

function renderFilters() {
  queryInput.value = filters.q;
  makeOptions(fields.theme, [
    ["", message("allThemes")],
    ...Object.entries(themes).map(([key, theme]) => [key, local(theme.name)]),
  ], filters.theme);
  renderSubtopics();
  makeOptions(fields.year, [["", message("allYears")], ...years.map((year) => [year, year])], filters.year);
  makeOptions(fields.kind, [["", message("allTypes")], ...Object.entries(kinds).map(([key, label]) => [key, local(label)])], filters.kind);
  makeOptions(fields.collection, [["", message("allCollections")], ["featured", message("featured")], ["index", message("index")]], filters.collection);
  makeOptions(fields.sort, [["", message("auto")], ...["new", "old", "title"].map((key) => [key, message(key)])], filters.sort);
}

function paperCard(paper) {
  const entry = element("article", "paper");
  const meta = element("div", "paper-meta");
  meta.append(
    element("span", "year", String(paper.year)),
    element("span", "", paper.venue),
    element("span", paper.kind === "preprint" ? "preprint" : "", local(kinds[paper.kind])),
  );
  const title = element("h3");
  title.append(externalLink(paper.title, paper.url));
  entry.append(meta, title);
  if (paper.authors?.length) {
    const names = paper.authors.slice(0, 3).join(", ");
    entry.append(element("p", "paper-authors", names + (paper.authors.length > 3 ? (language === "zh" ? " 等" : " et al.") : "")));
  }
  const note = paper.notes?.[language];
  if (note) {
    const text = element("p", "paper-note");
    if (paper.alias) text.append(element("strong", "", paper.alias), document.createTextNode(" · "));
    text.append(document.createTextNode(note));
    entry.append(text);
  }
  const theme = themes[paper.section];
  const foot = element("div", "paper-foot");
  foot.append(element("span", "", local(theme.topics[paper.topic])));
  if (paper.code) foot.append(externalLink(message("code"), paper.code));
  if (paper.collection === "index") {
    foot.append(element("span", "", `${message("discover")} ${local(sources[paper.source].name)}`));
  }
  entry.append(foot);
  return entry;
}

function emptyState(title, detail) {
  const box = element("div", "empty");
  box.append(element("h3", "", message(title)), element("p", "", message(detail)));
  list.replaceChildren(box);
  list.setAttribute("aria-busy", "false");
}

function renderResults() {
  const trend = get("results-trend");
  trend.hidden = !filters.theme;
  trend.href = trendUrl(language, filters.theme, filters.topic);
  const selected = selectPapers(index, filters);
  const pages = Math.max(1, Math.ceil(selected.length / pageSize));
  filters.page = Math.min(filters.page, pages);
  const start = (filters.page - 1) * pageSize;
  const end = Math.min(start + pageSize, selected.length);
  const formatRange = `${formatNumber(start + 1)}–${formatNumber(end)}`;
  get("results-count").textContent = selected.length
    ? (language === "zh" ? `共 ${countText(selected.length)} · 显示 ${formatRange}` : `${countText(selected.length)} · showing ${formatRange}`)
    : countText(0);
  if (selected.length) {
    list.replaceChildren(...selected.slice(start, end).map(paperCard));
    list.setAttribute("aria-busy", "false");
  } else {
    emptyState("noResults", "noResultsDetail");
  }
  get("pagination").hidden = pages === 1;
  get("previous").disabled = filters.page === 1;
  get("next").disabled = filters.page === pages;
  get("page-indicator").textContent = language === "zh" ? `第 ${filters.page} / ${pages} 页` : `Page ${filters.page} of ${pages}`;
}

function renderSources() {
  const grid = get("source-grid");
  grid.replaceChildren();
  for (const [key, source] of Object.entries(sources)) {
    const section = element("article", "source-card");
    const count = index.filter((paper) => paper.source === key).length;
    section.append(
      element("h3", "", local(source.name)),
      element("p", "", `${countText(count)} · ${local(source.description)}`),
      externalLink(message("sourceRecords"), source.url),
    );
    grid.append(section);
  }
  get("updated").textContent = `${message("updated")} ${data.updated}`;
}

function scrollToLibrary() {
  get("library").scrollIntoView();
  queryInput.focus({ preventScroll: true });
}

function renderCatalog() {
  renderOverview();
  renderFilters();
  renderResults();
  renderSources();
}

function updateResultState(options = {}) {
  if (!options.keepPage) filters.page = 1;
  renderResults();
  synchronizeUrl();
}

function wireCatalog() {
  for (const [key, field] of Object.entries(fields)) {
    field.addEventListener("change", () => {
      filters[key === "subtopic" ? "topic" : key] = field.value;
      if (key === "theme") {
        filters.topic = "";
        renderSubtopics();
      }
      updateResultState();
    });
  }
  queryInput.addEventListener("input", () => {
    filters.q = queryInput.value.slice(0, 180);
    cancelAnimationFrame(queryFrame);
    queryFrame = requestAnimationFrame(() => updateResultState());
  });
  get("reset").addEventListener("click", () => {
    filters = { ...defaults };
    renderFilters();
    updateResultState();
    queryInput.focus({ preventScroll: true });
  });
  for (const [id, direction] of [["previous", -1], ["next", 1]]) {
    get(id).addEventListener("click", () => {
      filters.page += direction;
      updateResultState({ keepPage: true });
      scrollToLibrary();
    });
  }
  window.addEventListener("popstate", () => {
    language = getLanguage();
    filters = parseFilters(new URLSearchParams(location.search), years);
    applyLanguage();
    renderCatalog();
  });
}

for (const button of languageButtons) {
  button.addEventListener("click", () => {
    language = button.dataset.language;
    rememberLanguage(language);
    applyLanguage();
    if (data) renderCatalog();
    else if (list.getAttribute("aria-busy") === "false") {
      get("results-count").textContent = message("unavailable");
      emptyState("unavailable", "unavailableDetail");
    } else {
      get("results-count").textContent = message("loading");
    }
    synchronizeUrl();
  });
}

applyLanguage();
try {
  const response = await fetch(new URL("./data/catalog.json", import.meta.url));
  if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
  const catalog = await response.json();
  if (!Array.isArray(catalog.papers) || !catalog.papers.length) throw new Error("Empty catalog");
  index = indexPapers(catalog.papers);
  years = [...new Set(index.map((paper) => paper.year))].sort((a, b) => b - a);
  filters = parseFilters(new URLSearchParams(location.search), years);
  data = catalog;
  renderCatalog();
  if (location.hash === "#library") get("library").scrollIntoView();
  wireCatalog();
} catch (error) {
  console.error(error);
  get("results-count").textContent = message("unavailable");
  emptyState("unavailable", "unavailableDetail");
  for (const field of [queryInput, ...Object.values(fields), get("reset")]) field.disabled = true;
}
