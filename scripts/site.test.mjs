import assert from "node:assert/strict";
import test from "node:test";
import { annualTrend } from "../docs/catalog.js";
import { collectNewRecords, renderFeed } from "./build_feeds.mjs";

const before = {
  title: "Cell atlas",
  doi: "10.1234/old",
  url: "https://doi.org/10.1234/old",
  section: "single-cell",
  topic: "atlases",
  year: 2022,
  venue: "bioRxiv",
  kind: "preprint",
};
const addition = {
  ...before,
  title: "New perturbation & atlas",
  doi: "10.1234/new",
  url: "https://doi.org/10.1234/new",
  section: "perturbation",
  topic: "screens",
};
const later = "2026-11-25T15:22:00.000Z";
const finalDate = "2026-12-01T15:22:00.000Z";
const snapshots = [
  { date: null, papers: [before] },
  { date: later, papers: [before, addition] },
];

test("baseline is not sent, first-seen item identifiers and dates survive edits", () => {
  const renamed = { ...addition, title: "Published atlas", kind: "article", doi: "10.1234/formal",
    url: "https://doi.org/10.1234/formal", previousDoi: addition.doi, section: "single-cell" };
  const baselineFormal = { ...before, doi: "10.1234/old-formal", url: "https://doi.org/10.1234/old-formal" };
  const [initial] = collectNewRecords(snapshots);
  const after = collectNewRecords([...snapshots, { date: finalDate, papers: [baselineFormal, renamed] }]);
  assert.equal(after.length, 1);
  assert.equal(after[0].id, initial.id);
  assert.equal(after[0].addedAt, later);
  assert.equal(after[0].feedSection, "perturbation");
  assert.equal(after[0].url, renamed.url);
});

test("entries are suppressed when removed and re-additions preserve their original dates", () => {
  const removal = { date: finalDate, papers: [before] };
  assert.deepEqual(collectNewRecords([...snapshots, removal]), []);
  const readded = { date: "2026-12-03T10:00:00.000Z", papers: [before, addition] };
  assert.equal(collectNewRecords([...snapshots, removal, readded])[0].addedAt, later);
});

test("RSS escapes text, preserves the date, and accepts an empty feed", () => {
  const rss = renderFeed("perturbation", collectNewRecords(snapshots));
  assert.match(rss, /New perturbation &amp; atlas/);
  assert.match(rss, /Wed, 25 Nov 2026 15:22:00 GMT/);
  assert.match(rss, /guid isPermaLink="false"/);
  assert.doesNotMatch(renderFeed("spatial", []), /<item>/);
});

test("yearly counts include zero years and keep overlapping subtopic keys scoped to their theme", () => {
  const papers = [before, { ...before, year: 2024 }, { ...before, section: "perturbation", year: 2025 }];
  assert.deepEqual(annualTrend(papers, "single-cell", "atlases"), [
    { year: 2022, count: 1 }, { year: 2023, count: 0 }, { year: 2024, count: 1 }, { year: 2025, count: 0 },
  ]);
  assert.deepEqual(annualTrend(papers, "spatial", "atlases"), []);
});
