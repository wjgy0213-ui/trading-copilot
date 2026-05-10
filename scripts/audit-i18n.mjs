import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const includeDirs = ['app', 'components'];
const ignoreDirs = new Set(['node_modules', '.next', '.git']);
const localeAwarePatterns = ['useI18n(', 'useI18n()', 'getServerT(', 'getServerT()'];
const userVisibleStringPatterns = [
  />\s*([^<>{}\n]*[A-Za-z\u4e00-\u9fff][^<>{}\n]*)\s*</g,
  /(?:title|description|label|placeholder|aria-label)=\{?['"]([^'"\n]*[A-Za-z\u4e00-\u9fff][^'"\n]*)['"]\}?/g,
  /\b(?:title|description|label|placeholder|alt):\s*['"]([^'"\n]*[A-Za-z\u4e00-\u9fff][^'"\n]*)['"]/g,
];
const ignoreFragments = [
  'use client', 'next', 'react', 'application/ld+json', 'summary_large_image',
  'website', 'article', 'person', 'organization', 'USD', 'en_US', 'zh_CN', 'landing',
  'pricing', 'waitlist', 'practice', 'strategy', 'other', 'google-analytics',
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (ignoreDirs.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (full.endsWith('.tsx')) out.push(full);
  }
  return out;
}

function unique(values) {
  return [...new Set(values)];
}

function extractUserVisibleStrings(source) {
  const matches = [];
  for (const pattern of userVisibleStringPatterns) {
    for (const match of source.matchAll(pattern)) {
      const text = match[1]?.trim();
      if (!text) continue;
      if (ignoreFragments.some(fragment => text.includes(fragment))) continue;
      if (/^[A-Za-z0-9_./:-]+$/.test(text) && !text.includes(' ')) continue;
      matches.push(text);
    }
  }
  return unique(matches);
}

const files = includeDirs.flatMap(dir => walk(join(root, dir)));
const report = files.map(file => {
  const source = readFileSync(file, 'utf8');
  const hasLocaleSupport = localeAwarePatterns.some(pattern => source.includes(pattern));
  const strings = extractUserVisibleStrings(source);
  return {
    file: relative(root, file),
    hasLocaleSupport,
    strings,
  };
});

const missing = report.filter(item => !item.hasLocaleSupport);
const userVisibleMissing = missing.filter(item => item.strings.length > 0);

console.log(`i18n coverage audit`);
console.log(`- tsx files scanned: ${report.length}`);
console.log(`- locale-aware files: ${report.length - missing.length}`);
console.log(`- files missing useI18n/getServerT: ${missing.length}`);
console.log(`- files with likely user-visible hardcoded text: ${userVisibleMissing.length}`);
console.log('');

for (const item of userVisibleMissing) {
  console.log(item.file);
  item.strings.slice(0, 8).forEach(text => console.log(`  - ${text}`));
  if (item.strings.length > 8) console.log(`  - ... +${item.strings.length - 8} more`);
  console.log('');
}
