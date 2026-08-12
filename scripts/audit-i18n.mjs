import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const includeDirs = ['app', 'components'];
const ignoreDirs = new Set(['node_modules', '.next', '.git']);
const clientLocalePatterns = ['useI18n(', 'useI18n()'];
const serverLocalePatterns = ['getServerT(', 'getServerT()'];
const userVisibleStringPatterns = [
  />\s*([^<>{}\n]*[A-Za-z\u4e00-\u9fff][^<>{}\n]*)\s*</g,
  /(?:title|description|label|placeholder|aria-label)=\{?['"]([^'"\n]*[A-Za-z\u4e00-\u9fff][^'"\n]*)['"]\}?/g,
  /\b(?:title|description|label|placeholder|alt):\s*['"]([^'"\n]*[A-Za-z\u4e00-\u9fff][^'"\n]*)['"]/g,
];
const translationCallPattern = /\b(?:t|tr)\(\s*['"]([^'"]+)['"]/g;
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

function readLocale(name) {
  return JSON.parse(readFileSync(join(root, 'locales', `${name}.json`), 'utf8'));
}

const files = includeDirs.flatMap(dir => walk(join(root, dir)));
const report = files.map(file => {
  const source = readFileSync(file, 'utf8');
  const hasClientLocale = clientLocalePatterns.some(pattern => source.includes(pattern));
  const hasServerLocale = serverLocalePatterns.some(pattern => source.includes(pattern));
  const strings = extractUserVisibleStrings(source);
  const translationKeys = [...source.matchAll(translationCallPattern)].map(match => match[1]);
  return {
    file: relative(root, file),
    hasClientLocale,
    hasServerLocale,
    strings,
    translationKeys,
  };
});

const en = readLocale('en');
const zh = readLocale('zh');
const enKeys = new Set(Object.keys(en));
const zhKeys = new Set(Object.keys(zh));
const usedKeys = new Set(report.flatMap(item => item.translationKeys));
const enOnlyKeys = [...enKeys].filter(key => !zhKeys.has(key)).sort();
const zhOnlyKeys = [...zhKeys].filter(key => !enKeys.has(key)).sort();
const missingEnKeys = [...usedKeys].filter(key => !enKeys.has(key)).sort();
const missingZhKeys = [...usedKeys].filter(key => !zhKeys.has(key)).sort();
const fullyMissing = report.filter(item => !item.hasClientLocale && !item.hasServerLocale);
const userVisibleMissing = fullyMissing.filter(item => item.strings.length > 0);
const clientCovered = report.filter(item => item.hasClientLocale);
const serverCovered = report.filter(item => !item.hasClientLocale && item.hasServerLocale);
const coveredCount = report.length - fullyMissing.length;
const coveragePct = report.length === 0 ? 0 : ((coveredCount / report.length) * 100).toFixed(1);
const hasErrors = fullyMissing.length > 0 || enOnlyKeys.length > 0 || zhOnlyKeys.length > 0 || missingEnKeys.length > 0 || missingZhKeys.length > 0;

console.log('i18n coverage audit');
console.log(`- tsx files scanned: ${report.length}`);
console.log(`- total covered files: ${coveredCount} (${coveragePct}%)`);
console.log(`- client useI18n files: ${clientCovered.length}`);
console.log(`- server getServerT files: ${serverCovered.length}`);
console.log(`- files missing i18n hooks/helpers: ${fullyMissing.length}`);
console.log(`- files with likely user-visible hardcoded text: ${userVisibleMissing.length}`);
console.log(`- literal translation keys used: ${usedKeys.size}`);
console.log(`- locale keys: en ${enKeys.size}, zh ${zhKeys.size}`);
console.log(`- used keys missing from en/zh: ${missingEnKeys.length}/${missingZhKeys.length}`);
console.log(`- locale parity gaps (en-only/zh-only): ${enOnlyKeys.length}/${zhOnlyKeys.length}`);
if (!hasErrors) {
  console.log('- status: full i18n coverage across app/ + components/ ✅');
}
console.log('');

if (serverCovered.length > 0) {
  console.log('server-localized files (getServerT):');
  serverCovered.forEach(item => console.log(`  - ${item.file}`));
  console.log('');
}

for (const item of userVisibleMissing) {
  console.log(item.file);
  item.strings.slice(0, 8).forEach(text => console.log(`  - ${text}`));
  if (item.strings.length > 8) console.log(`  - ... +${item.strings.length - 8} more`);
  console.log('');
}

const keyProblems = [
  ['used keys missing from en', missingEnKeys],
  ['used keys missing from zh', missingZhKeys],
  ['keys present only in en', enOnlyKeys],
  ['keys present only in zh', zhOnlyKeys],
];
for (const [label, keys] of keyProblems) {
  if (keys.length === 0) continue;
  console.log(`${label}:`);
  keys.forEach(key => console.log(`  - ${key}`));
  console.log('');
}

if (hasErrors) process.exitCode = 1;
