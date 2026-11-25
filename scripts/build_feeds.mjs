import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { normalize } from "../docs/catalog.js";
import { themes } from "../docs/taxonomy.js";

const site = "https://tudu1223.github.io/awesome-computational-biology-papers/";
const baseline = "ef882fb07473d53d094931ca919a63c2207b5a65";
const catalogPath = "docs/data/catalog.json";
const escapes = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };
const xml = (value) => String(value).replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, "")
  .replace(/[&<>"']/g, (character) => escapes[character]);

function identifiers(paper) {
  const url = new URL(paper.url);
  if (url.protocol !== "https:") throw new Error(`Non-HTTPS paper URL for ${paper.title}`);
  const doi = paper.doi || (url.hostname === "doi.org" ? decodeURIComponent(url.pathname.slice(1)) : "");
  url.hash = "";
  url.search = "";
  const keys = [
    doi && `doi:${doi.toLowerCase()}`,
    `url:${url.href.replace(/(arxiv\.org\/abs\/\d+\.\d+)v\d+$/, "$1")}`,
    `title:${normalize(paper.title).replaceAll(" ", "")}`,
  ];
  if (paper.previousDoi) keys.push(`doi:${paper.previousDoi.toLowerCase()}`);
  return keys.filter(Boolean);
}

export function collectNewRecords(snapshots) {
  const seen = new Map();
  let current = new Map();
  for (const { date, papers } of snapshots) {
    current = new Map();
    for (const paper of papers) {
      const keys = identifiers(paper);
      const record = keys.map((key) => seen.get(key)).find(Boolean) ?? {
        id: `urn:sha256:${createHash("sha256").update(keys[0]).digest("hex")}`,
        addedAt: date,
        feedSection: paper.section,
      };
      for (const key of keys) seen.set(key, record);
      current.set(record.id, { ...paper, ...record });
    }
  }
  return [...current.values()].filter((paper) => paper.addedAt)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.title.localeCompare(b.title, "en"));
}

export function renderFeed(section, papers) {
  const theme = themes[section];
  const title = theme ? `${theme.name[0]} · ${theme.name[1]} | Literature Atlas` : "Literature Atlas · 文献图谱";
  const feedUrl = `${site}feeds/${section}.xml`;
  const catalogUrl = theme ? `${site}?theme=${section}#library` : `${site}#library`;
  const items = papers.map((paper) => {
    const source = `${paper.venue} · ${paper.year}${paper.kind === "preprint" ? " · Preprint / 预印本" : ""}`;
    return [
      "    <item>",
      `      <title>${xml(paper.title)}</title>`,
      `      <link>${xml(paper.url)}</link>`,
      `      <guid isPermaLink="false">${xml(paper.id)}</guid>`,
      `      <pubDate>${new Date(paper.addedAt).toUTCString()}</pubDate>`,
      `      <description>${xml(source)}</description>`,
      "    </item>",
    ].join("\n");
  });
  const buildDate = papers.length ? `    <lastBuildDate>${new Date(papers[0].addedAt).toUTCString()}</lastBuildDate>` : "";
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xml(title)}</title>`,
    `    <link>${xml(catalogUrl)}</link>`,
    '    <description>New entries in the Computational Biology Literature Atlas · 计算生物学文献图谱新入库条目</description>',
    `    <atom:link href="${xml(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    ...(buildDate ? [buildDate] : []),
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }).trim();
}

function* snapshots() {
  yield { date: null, papers: JSON.parse(git(["show", `${baseline}:${catalogPath}`])).papers };
  const revisions = git(["log", "--first-parent", "--reverse", "--format=%H %ct", `${baseline}..HEAD`, "--", catalogPath]);
  for (const revision of revisions.split("\n").filter(Boolean)) {
    const [commit, seconds] = revision.split(" ");
    yield { date: new Date(Number(seconds) * 1000).toISOString(), papers: JSON.parse(git(["show", `${commit}:${catalogPath}`])).papers };
  }
}

function main() {
  const papers = collectNewRecords(snapshots());
  const target = new URL("../docs/feeds/", import.meta.url);
  mkdirSync(target, { recursive: true });
  for (const section of ["all", ...Object.keys(themes)]) {
    const entries = section === "all" ? papers : papers.filter((paper) => paper.feedSection === section);
    writeFileSync(new URL(`${section}.xml`, target), renderFeed(section, entries));
  }
  const latest = Object.keys(themes).flatMap((section) => papers.filter((paper) => paper.feedSection === section).slice(0, 5))
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.title.localeCompare(b.title, "en"))
    .map(({ title, url, feedSection, addedAt }) => ({ title, url, feedSection, addedAt }));
  writeFileSync(new URL("updates.json", target), JSON.stringify(latest) + "\n");
  console.log(`Generated ${Object.keys(themes).length + 1} RSS feeds with ${papers.length} new catalog entries.`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
