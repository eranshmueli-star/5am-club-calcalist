import { Actor } from 'apify';
import { chromium } from 'playwright';

const URL = 'https://www.calcalist.co.il/updates_news';

function normalizeUrl(href) {
  if (!href) return '';
  if (href.startsWith('//')) return 'https:' + href;
  if (href.startsWith('/')) return 'https://www.calcalist.co.il' + href;
  return href;
}

function isGoodLink(link) {
  if (!link) return false;
  if (!link.includes('calcalist.co.il')) return false;
  return /\/article\//i.test(link);
}

function isGoodTitle(title) {
  if (!title) return false;
  const t = title.trim().replace(/\s+/g, ' ');
  if (t.length < 15) return false;
  if (t.length > 220) return false;
  if (/Example Domain|Opt out|Do not sell|Privacy/i.test(t)) return false;
  return true;
}

await Actor.init();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  locale: 'he-IL',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
});

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const rawItems = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]')).map((a) => ({
      title: (a.textContent || '').trim().replace(/\s+/g, ' '),
      link: a.getAttribute('href') || ''
    }));
  });

  const items = [];
  const seen = new Set();

  for (const item of rawItems) {
    const title = item.title || '';
    const link = normalizeUrl(item.link || '');

    if (!isGoodTitle(title)) continue;
    if (!isGoodLink(link)) continue;
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
} finally {
  await browser.close();
  await Actor.exit();
}
