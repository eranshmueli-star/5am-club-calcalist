import { Actor } from 'apify';

await Actor.init();

const res = await fetch('https://www.calcalist.co.il/updates_news');
const html = await res.text();

const titles = [...html.matchAll(/title="([^"]+)"/g)];

const items = [];

for (const t of titles) {
  const title = t[1];

  if (title.length < 20) continue;
  if (items.find(i => i.title === title)) continue;

  items.push({
    title,
    link: 'https://www.calcalist.co.il'
  });

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
