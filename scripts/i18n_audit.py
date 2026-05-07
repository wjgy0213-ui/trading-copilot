#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TSX_FILES = sorted(p for p in ROOT.rglob('*.tsx') if 'node_modules' not in p.parts)
USER_VISIBLE = [p for p in TSX_FILES if p.relative_to(ROOT).parts[0] in {'app', 'components'}]

VISIBLE_LITERAL_PATTERNS = [
    re.compile(r'>\s*([^<{]*[A-Za-z][^<{]*)<'),
    re.compile(r'placeholder=\{?(["\'])(.+?)\1\}?'),
]


def classify(text: str) -> str:
    if 'useI18n' in text:
        return 'client'
    if 'getServerT' in text or 'server-i18n' in text:
        return 'server'
    return 'none'


def visible_literals(text: str) -> list[str]:
    hits: list[str] = []
    for line in text.splitlines():
        s = line.strip()
        if not s or s.startswith('import ') or s.startswith('//'):
            continue
        if 'className=' in s or 'http' in s or 'stroke=' in s or 'fill=' in s:
            continue
        for pattern in VISIBLE_LITERAL_PATTERNS:
            m = pattern.search(s)
            if m:
                value = m.group(m.lastindex or 0).strip()
                if value and 't(' not in s:
                    hits.append(value)
                    break
    return hits[:5]


client = []
server = []
none = []
for path in USER_VISIBLE:
    text = path.read_text()
    bucket = classify(text)
    rel = path.relative_to(ROOT)
    if bucket == 'client':
        client.append(rel)
    elif bucket == 'server':
        server.append(rel)
    else:
        none.append((rel, visible_literals(text)))

print(f'total_tsx={len(TSX_FILES)}')
print(f'user_visible_tsx={len(USER_VISIBLE)}')
print(f'client_i18n={len(client)}')
print(f'server_i18n={len(server)}')
print(f'no_i18n={len(none)}')
print('\n[server_i18n_wrappers]')
for rel in server:
    print(rel)
print('\n[no_i18n_files]')
for rel, literals in none:
    suffix = f' :: literals={literals}' if literals else ''
    print(f'{rel}{suffix}')
