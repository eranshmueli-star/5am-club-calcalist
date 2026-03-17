import { Actor } from 'apify';

const URL = 'https://www.calcalist.co.il/updates_news';

await Actor.init();

const res = await fetch(URL);
const html = await res.text();

// חיפוש כותרות
const matches = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/g)];

const items = [];
const seen = new Set();

for (const m of matches) {
  let link = m[1];
  let title = m[2].replace(/<[^>]+>/g, '').trim();

  if (!link.includes('/article/')) continue;
  if (title.length < 20) continue;

  if (link.startsWith('/')) {
    link = 'https://www.calcalist.co.il' + link;
  }

  if (seen.has(link)) continue;

  seen.add(link);
  items.push({ title, link });

  if (items.length >= 5) break;
}

const result = {
  updatedAt: new Date().toISOString(),
  items
};

await Actor.setValue('calcalist', result);
await Actor.pushData(result);

console.log(`Saved ${items.length} articles`);

await Actor.exit();
