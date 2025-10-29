// scripts/fetch-news.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../assets/news/news.json");

// List of RSS feeds to pull
const FEEDS = [
  { src: "PV Magazine", url: "https://www.pv-magazine.com/feed/" },
  { src: "Energy Storage News", url: "https://www.energy-storage.news/feed/" },
  { src: "Clean Energy Wire", url: "https://cleanenergywire.org/rss.xml" },
  { src: "Fraunhofer ISE", url: "https://www.ise.fraunhofer.de/en.rss" },
  { src: "Battery-News.de", url: "https://battery-news.de/feed/" },
  { src: "SMA Newsroom", url: "https://www.sma.de/en/newsroom/rss" }
];

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });

async function fetchXML(url) {
  const res = await fetch(url, { headers: { "user-agent": "github-actions-bot" } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return await res.text();
}

function normalize(raw, src) {
  if (raw.rss?.channel?.item) {
    return raw.rss.channel.item.map(i => ({
      title: i.title?.trim(),
      link: i.link?.trim(),
      date: new Date(i.pubDate || i["dc:date"] || i.date || Date.now()).toISOString(),
      source: src
    }));
  }
  if (raw.feed?.entry) {
    return raw.feed.entry.map(i => ({
      title: (i.title?.["#text"] || i.title || "").toString().trim(),
      link: Array.isArray(i.link) ? (i.link.find(l => l.rel === "alternate")?.href || i.link[0]?.href) : i.link?.href,
      date: new Date(i.updated || i.published || Date.now()).toISOString(),
      source: src
    }));
  }
  return [];
}

async function main() {
  const all = [];
  for (const { src, url } of FEEDS) {
    try {
      const xml = await fetchXML(url);
      const json = parser.parse(xml);
      const items = normalize(json, src).slice(0, 6);
      all.push(...items);
    } catch (e) {
      console.error("Feed error:", src, e.message);
    }
  }

  // remove duplicates + sort
  const dedup = new Map();
  for (const i of all) if (i.link) dedup.set(i.link, i);
  const out = [...dedup.values()].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 40);

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2), "utf8");
  console.log(`✅ Wrote ${out.length} items to ${OUT}`);
}

await main();
