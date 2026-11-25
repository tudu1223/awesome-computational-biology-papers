import { annualTrend } from "./catalog.js";
import { themes } from "./taxonomy.js";
import { element, getLanguage, rememberLanguage, trendUrl } from "./ui.js";

const copy = {
  skip: ["Skip to topic trends", "跳到专题趋势"],
  brand: ["Literature Atlas", "文献图谱"],
  title: ["Topic trends", "专题趋势"],
  library: ["Library", "文献库"],
  subscribe: ["Subscribe", "订阅"],
  what: ["Explore the papers collected in each subtopic by their publication year.", "按发表年份查看每个子方向在本站的收录情况。"],
  theme: ["Theme", "专题"],
  subtopic: ["Subtopic", "子方向"],
  all: ["All subtopics", "全部子方向"],
  browse: ["Browse papers", "查看文献"],
  subscribeTheme: ["Subscribe to this theme", "订阅此专题"],
  chart: ["Papers by publication year", "按发表年份统计收录量"],
  method: ["Counts cover this catalog, including preprints. The most recent year may be incomplete. Select a year to open its papers.", "统计口径为本站收录条目，含预印本。最近年份的收录可能尚不完整。点击年份可查看对应文献。"],
  table: ["View exact annual counts", "查看各年精确计数"],
  year: ["Year", "年份"],
  count: ["Papers", "篇数"],
  loading: ["Loading catalog…", "正在加载文献目录…"],
  empty: ["This subtopic has no entries yet.", "本站暂未收录这个子方向的文献。"],
  unavailable: ["The catalog could not be loaded. Reload the page to try again.", "文献目录加载失败，可刷新页面重试。"],
};

const byId = (id) => document.getElementById(id);
const themeSelect = byId("trend-theme");
const topicSelect = byId("trend-topic");
const languageButtons = document.querySelectorAll("[data-language]");
let language = getLanguage();
let theme, topic, papers;
let loadFailed = false;
const local = (pair) => pair[language === "zh" ? 1 : 0];
const text = (key) => local(copy[key]);

function restoreSelection() {
  const params = new URLSearchParams(location.search);
  const requestedTheme = params.get("theme");
  const requestedTopic = params.get("topic");
  theme = Object.hasOwn(themes, requestedTheme) ? requestedTheme : Object.keys(themes)[0];
  topic = Object.hasOwn(themes[theme].topics, requestedTopic) ? requestedTopic : "";
}

function libraryUrl(year, anchor = "library") {
  const params = new URLSearchParams({ lang: language, theme });
  if (topic) params.set("topic", topic);
  if (year) params.set("year", year);
  return `./?${params}#${anchor}`;
}

function drawTrend(rows) {
  const chart = byId("trend-chart");
  const table = byId("trend-rows");
  chart.replaceChildren();
  table.replaceChildren();
  const highest = Math.max(...rows.map(({ count }) => count));
  for (const { year, count } of rows) {
    const bar = element(count ? "a" : "div", "trend-year");
    const label = language === "zh" ? `${year} 年，${count} 篇` : `${year}: ${count} ${count === 1 ? "paper" : "papers"}`;
    if (count) bar.href = libraryUrl(year);
    bar.title = label;
    bar.setAttribute("aria-label", label);
    const track = element("span", "trend-track");
    track.style.setProperty("--bar-height", `${(count / highest) * 100}%`);
    track.append(element("span", "trend-fill"), element("span", "trend-value", String(count)));
    bar.append(track, element("span", "trend-year-label", String(year)));
    chart.append(bar);
    const row = element("tr");
    const yearCell = element("th", "", String(year));
    yearCell.scope = "row";
    row.append(yearCell, element("td", "", String(count)));
    table.append(row);
  }
}

function render() {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = `${text("title")} | ${text("brand")}`;
  for (const node of document.querySelectorAll("[data-text]")) node.textContent = text(node.dataset.text);
  for (const button of languageButtons) button.setAttribute("aria-pressed", String(button.dataset.language === language));
  byId("topic-nav").setAttribute("aria-label", language === "zh" ? "主导航" : "Primary");
  byId("topic-languages").setAttribute("aria-label", language === "zh" ? "语言" : "Language");
  byId("home").href = `./?lang=${language}`;
  byId("home-library").href = byId("browse-topic").href = libraryUrl();
  byId("home-subscribe").href = byId("subscribe-topic").href = libraryUrl(null, "subscribe");
  byId("topic-title").textContent = local(topic ? themes[theme].topics[topic] : themes[theme].name);
  themeSelect.replaceChildren(...Object.entries(themes).map(([key, value]) => new Option(local(value.name), key)));
  topicSelect.replaceChildren(new Option(text("all"), ""), ...Object.entries(themes[theme].topics).map(([key, name]) => new Option(local(name), key)));
  themeSelect.value = theme;
  topicSelect.value = topic;
  const rows = papers ? annualTrend(papers, theme, topic) : [];
  byId("trend-panel").hidden = !rows.length;
  if (rows.length) {
    const count = rows.reduce((total, row) => total + row.count, 0);
    const preprints = papers.filter((paper) => paper.section === theme && (!topic || paper.topic === topic) && paper.kind === "preprint").length;
    byId("trend-status").textContent = language === "zh" ? `收录 ${count} 篇，含 ${preprints} 篇预印本` : `${count} catalog entries · ${preprints} preprints`;
    drawTrend(rows);
  } else {
    byId("trend-status").textContent = text(loadFailed ? "unavailable" : papers ? "empty" : "loading");
  }
}

function changeSelection() {
  history.replaceState(null, "", trendUrl(language, theme, topic));
  render();
}

restoreSelection();
render();
try {
  const response = await fetch("./data/catalog.json");
  if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
  ({ papers } = await response.json());
  render();
} catch (error) {
  console.error(error);
  loadFailed = true;
  render();
}
themeSelect.addEventListener("change", () => {
  theme = themeSelect.value;
  topic = "";
  changeSelection();
});
topicSelect.addEventListener("change", () => {
  topic = topicSelect.value;
  changeSelection();
});
for (const button of languageButtons) {
  button.addEventListener("click", () => {
    language = button.dataset.language;
    rememberLanguage(language);
    changeSelection();
  });
}
