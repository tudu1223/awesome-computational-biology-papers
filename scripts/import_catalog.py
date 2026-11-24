"""Build the site catalog from the bilingual reading list and discovery batches."""

from argparse import ArgumentParser
from collections import Counter
from datetime import date
from itertools import zip_longest
from pathlib import Path
import html
import json
import re
import unicodedata
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
READING_ROW = re.compile(
    r"^- \*\*(.+?)\*\* · (.+?) · (\d{4})(?: · `(Preprint|预印本)`)? · "
    r"\[(?:Paper|论文)\]\(([^)]+)\)(?: · \[[^\]]+\]\(([^)]+)\))?\\$"
)
ANCHOR = re.compile(r'^<a name="([a-z-]+)"></a>$')
DOI = re.compile(r"^10\.\d{4,9}/[^\s<>]+$", re.IGNORECASE)
KINDS = {"article", "preprint", "review", "conference"}
VENUE_CASE = {
    "bmc bioinformatics": "BMC Bioinformatics",
    "bmc genomics": "BMC Genomics",
    "cell genomics": "Cell Genomics",
    "cell reports": "Cell Reports",
    "elife": "eLife",
    "genome biology": "Genome Biology",
    "genome research": "Genome Research",
    "molecular systems biology": "Molecular Systems Biology",
    "nature biotechnology": "Nature Biotechnology",
    "nature communications": "Nature Communications",
    "nature genetics": "Nature Genetics",
    "nature methods": "Nature Methods",
    "nature reviews genetics": "Nature Reviews Genetics",
    "nucleic acids research": "Nucleic Acids Research",
    "scientific reports": "Scientific Reports",
    "science advances": "Science Advances",
}


def clean(text):
    return " ".join(html.unescape(text).split()).replace("\\[", "[").replace("\\]", "]")


def title_key(title):
    folded = unicodedata.normalize("NFKD", title).casefold()
    return "".join(character for character in folded if character.isalnum())


def valid_url(value):
    try:
        url = urlsplit(value)
        return url.scheme == "https" and url.hostname and not url.username
    except (TypeError, ValueError):
        return False


def doi_from(url):
    parts = urlsplit(url)
    doi = unquote(parts.path.lstrip("/")).rstrip("/")
    if parts.hostname in {"doi.org", "dx.doi.org"} and DOI.fullmatch(doi):
        return doi.lower()
    return None


def topic_for(section, subtype, title):
    hint = subtype.casefold()
    name = title.casefold()
    if section == "single-cell":
        if any(word in hint for word in ("atlas", "atlases", "resource", "data access", "pretraining data")):
            return "atlases"
        if any(word in hint for word in ("integrat", "multimodal", "multi-omic")) and "foundation" not in hint:
            return "integration"
        return "foundations"
    if section == "perturbation":
        if any(word in hint for word in ("benchmark", "evaluation", "baseline", "comparisons")):
            return "benchmarks"
        if any(word in hint for word in ("atlas", "atlases", "dataset", "screening")):
            return "screens"
        return "models"
    if section == "regulation":
        if any(word in hint for word in ("evaluation", "interpret", "benchmark")):
            return "benchmarks"
        if "enhancer" in hint or "enhancer" in name or "cis-regulat" in name:
            return "enhancers"
        if "regulon" in hint or name.startswith(("scenic:", "scenic+:")):
            return "regulons"
        return "networks"
    if section == "spatial":
        if "evaluation" in hint or "benchmark" in hint or "best practices" in hint:
            return "benchmarks"
        if any(word in hint for word in ("measurement", "atlas", "atlases", "technologies")):
            return "assays"
        if any(word in hint for word in ("mapping", "deconvolution")) and "analysis" not in hint:
            return "mapping"
        if any(word in name for word in ("deconvolution", "cell type mixtures", "tangram", "cell2location")):
            return "mapping"
        return "models"
    if section == "genomics-proteins":
        if "reference" in hint and ("variation" in hint or "benchmark" in name or "assembly" in name):
            return "references"
        if "protein" in hint or "protein" in name or "binding" in name and "molecular" in name:
            return "proteins"
        if "molecular prior networks" in name:
            return "proteins"
        if "transcriptome model" in hint:
            return "transcriptome"
        return "sequence"
    if section == "methods":
        if "graph" in hint or "graph neural" in name:
            return "graphs"
        if any(word in hint or word in name for word in ("benchmark", "evaluat", "best practices", "review")):
            return "benchmarks"
        if any(word in hint for word in ("trajectory", "velocity", "dynamics")):
            return "dynamics"
        if any(word in hint for word in ("statistic", "differential expression", "gene sets")):
            return "statistics"
        return "workflows"
    raise ValueError(f"Unrecognized section {section!r}")


def reading_list(path):
    section = subtype = ""
    text = path.read_text(encoding="utf-8")
    if "<!-- Catalog entries" in text:
        text = text.split("<!-- Catalog entries", 1)[1]
    lines = text.splitlines()
    for index, line in enumerate(lines):
        if anchor := ANCHOR.fullmatch(line):
            section = anchor[1]
        if line.startswith("### "):
            subtype = line[4:]
        if row := READING_ROW.fullmatch(line):
            title, venue, year, preprint, url, code = row.groups()
            note = lines[index + 1].strip()
            split = re.match(r"^\*\*(.+?)\*\* · (.+)$", note)
            kind = "preprint" if preprint else "article"
            if venue in {"AAAI", "NeurIPS", "ICLR", "ICML"}:
                kind = "conference"
            if "review" in subtype.casefold() or title.startswith(("Applications of Deep Learning", "Best practices")):
                kind = "review"
            yield {
                "title": clean(title), "venue": clean(venue), "year": int(year),
                "url": url, "doi": doi_from(url), "code": code, "section": section,
                "kind": kind, "topic": topic_for(section, subtype, title),
                "topicHint": subtype, "source": "editorial", "collection": "featured",
                "alias": clean(split[1]) if split else None,
                "note": clean(split[2]) if split else clean(note),
            }


def featured_papers():
    english = reading_list(ROOT / "README.md")
    chinese = reading_list(ROOT / "README.zh-CN.md")
    papers = []
    for first, second in zip_longest(english, chinese):
        if not first or not second or first["url"] != second["url"]:
            raise ValueError("The English and Chinese reading lists do not match")
        first["notes"] = {"en": first.pop("note"), "zh": second["note"]}
        papers.append({key: value for key, value in first.items() if value is not None})
    if not papers:
        raise ValueError("The reading lists contain no entries")
    return papers


def indexed_paper(row, source):
    title = clean(row["title"])
    venue = clean(row["venue"])
    section = row["section"]
    subtype = clean(row.get("subtype") or "")
    doi = (row.get("doi") or "").lower()
    year = int(row["year"])
    url = row["url"]
    kind = row.get("kind", "article")
    if not title or not venue or len(title) < 8 or not valid_url(url) or not 1900 <= year <= date.today().year:
        return None
    if kind not in KINDS:
        raise ValueError(f"Unrecognized kind {kind!r}")
    if doi and DOI.fullmatch(doi):
        url = "https://doi.org/" + doi
    authors = row.get("authors") or []
    if isinstance(authors, str):
        authors = authors.split("; ")
    paper = {
        "title": title, "year": year, "venue": VENUE_CASE.get(venue.casefold(), venue),
        "url": url, "kind": kind, "section": section, "topic": topic_for(section, subtype, title),
        "source": source, "collection": "index",
    }
    if doi and DOI.fullmatch(doi):
        paper["doi"] = doi
    if authors:
        paper["authors"] = [clean(a) for a in authors if a]
    if subtype:
        paper["topicHint"] = subtype
    if valid_url(row.get("sourceUrl")):
        paper["sourceUrl"] = row["sourceUrl"]
    if row.get("metadataSource"):
        paper["metadataSource"] = clean(row["metadataSource"])
    return paper


def deduplicate(featured, additions):
    by_title = {}
    by_identity = {}
    papers = []
    for paper in [*featured, *additions]:
        key = title_key(paper["title"])
        identity = paper.get("doi") or paper["url"].casefold().rstrip("/")
        kept = by_identity.get(identity) or by_title.get(key)
        if kept:
            if kept["kind"] == "preprint" and paper["kind"] != "preprint":
                for field in ("year", "venue", "url", "doi", "kind"):
                    if field in paper:
                        kept[field] = paper[field]
            if not kept.get("authors") and paper.get("authors"):
                kept["authors"] = paper["authors"]
            by_title[key] = by_identity[identity] = kept
            continue
        by_title[key] = by_identity[identity] = paper
        papers.append(paper)
    return sorted(papers, key=lambda paper: (-paper["year"], title_key(paper["title"])))


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--pubmed", type=Path, action="append", default=[])
    parser.add_argument("--omicsml", type=Path, action="append", default=[])
    parser.add_argument("--featured-authors", type=Path)
    parser.add_argument("--date", type=date.fromisoformat, default=date.today())
    args = parser.parse_args()
    if not args.pubmed and not args.omicsml:
        parser.error("provide at least one discovery batch")
    inputs = {}
    additions = []
    for source, paths in (("pubmed", args.pubmed), ("omicsml", args.omicsml)):
        for path in paths:
            batch = json.loads(path.read_text(encoding="utf-8-sig"))
            inputs.setdefault(source, []).append({
                key: batch[key] for key in ("accessedOn", "asOf", "source", "sourceName", "sourceEndpoint",
                                            "license", "sourceDigestSha256", "method", "methods", "queries")
                if key in batch
            })
            for row in batch["papers"]:
                paper = indexed_paper(row, source)
                if paper:
                    additions.append(paper)
    featured = featured_papers()
    if args.featured_authors:
        by_url = json.loads(args.featured_authors.read_text(encoding="utf-8"))
        for paper in featured:
            if authors := by_url.get(paper["url"]):
                paper["authors"] = authors
    additions.sort(key=lambda paper: paper["kind"] == "preprint")
    papers = deduplicate(featured, additions)
    date_text = args.date.isoformat()
    output = ROOT / "docs" / "data"
    output.mkdir(parents=True, exist_ok=True)
    provenance = {
        "updated": date_text,
        "inputs": inputs,
        "counts": dict(Counter(paper["source"] for paper in papers)),
        "deduplication": "Exact DOI or normalized title, preferring published versions when available.",
    }
    rows = ",\n".join("    " + json.dumps(paper, ensure_ascii=False) for paper in papers)
    catalog = f'{{\n  "updated": "{date_text}",\n  "papers": [\n{rows}\n  ]\n}}\n'
    output.joinpath("catalog.json").write_text(catalog, encoding="utf-8", newline="\n")
    output.joinpath("provenance.json").write_text(
        json.dumps(provenance, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n",
    )
    print(f"{len(papers)} distinct papers: {provenance['counts']}")


if __name__ == "__main__":
    main()
