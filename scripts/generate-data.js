import fs from 'fs';
import path from 'path';

function deriveTitle(url, rawTitle) {
  if (rawTitle && rawTitle.trim()) return rawTitle.trim();
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, '');
    let pathname = decodeURIComponent(parsed.pathname).replace(/^\/|\/$/g, '');

    if (domain === 'github.com') {
      const parts = pathname.split('/');
      if (parts.length >= 2) {
        let repoName = `${parts[0]}/${parts[1]}`;
        if (parts.length > 2) {
          const sub = parts.slice(2).join(' / ').replace(/\.(md|ts|js|sh)$/i, '');
          return `${repoName} (${sub})`;
        }
        return repoName;
      }
    }
    if (domain.includes('wikipedia.org')) {
      const wikiPart = pathname.replace(/^wiki\//, '').replace(/_/g, ' ');
      if (wikiPart) return wikiPart;
    }
    if (domain.includes('reddit.com')) {
      const subMatch = pathname.match(/r\/([^/]+)/);
      const titleMatch = pathname.match(/comments\/[^/]+\/([^/]+)/);
      if (titleMatch) return titleMatch[1].replace(/_/g, ' ');
      if (subMatch) return `r/${subMatch[1]}`;
    }
    if (pathname) {
      const segments = pathname.split('/').filter(Boolean);
      const last = segments[segments.length - 1];
      const cleaned = last.replace(/\.(html|php|md|rst)$/i, '').replace(/[-_+]/g, ' ').trim();
      if (cleaned.length > 2) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return domain;
  } catch {
    return url;
  }
}

function parseBookmarks(readmePath) {
  const filePath = readmePath || path.join(process.cwd(), 'README.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let currentCategory = 'Uncategorized';
  const bookmarks = [];
  let index = 0;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      const heading = line.replace(/^#+\s*/, '').trim();
      if (heading.toLowerCase() !== 'lynx') {
        currentCategory = heading;
      }
      continue;
    }
    let url = '';
    let customTitle = undefined;
    const mdLinkMatch = line.match(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/);
    if (mdLinkMatch) {
      customTitle = mdLinkMatch[1];
      url = mdLinkMatch[2];
    } else {
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        url = urlMatch[1];
        const prefix = line.replace(url, '').replace(/^[-*]\s*/, '').trim();
        if (prefix.length > 2) customTitle = prefix;
      }
    }
    if (url) {
      try {
        const parsed = new URL(url);
        const domain = parsed.hostname.replace(/^www\./, '');
        const title = deriveTitle(url, customTitle);
        index++;
        bookmarks.push({
          id: `bm-${index}`,
          url,
          title,
          category: currentCategory,
          domain,
          pathname: parsed.pathname,
        });
      } catch {}
    }
  }

  const catMap = new Map();
  for (const b of bookmarks) {
    catMap.set(b.category, (catMap.get(b.category) || 0) + 1);
  }

  const categories = Array.from(catMap.entries())
    .map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { bookmarks, categories };
}

const data = parseBookmarks();
const outDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outDir, 'bookmarks.json'),
  JSON.stringify(data, null, 2),
  'utf-8'
);

console.log(`Generated data/bookmarks.json (${data.bookmarks.length} bookmarks, ${data.categories.length} categories)`);
