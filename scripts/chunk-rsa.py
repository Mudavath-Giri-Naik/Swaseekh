# -*- coding: utf-8 -*-
"""Split each RS Aggarwal chapter into self-contained chunks:
   each chunk = questions + their answer-key letters + their detailed solutions.
   Solved-example chunks are inherently self-contained (inline Sol.)."""
import re, glob, os, json

RSA = r'e:\Swaseekh-main\Swaseekh-main\scripts\data\rsa'
OUT = os.path.join(RSA, 'chunks')
os.makedirs(OUT, exist_ok=True)

manifest = json.load(open(os.path.join(RSA, 'manifest.json'), encoding='utf-8'))
chmeta = {m['chapter']: m for m in manifest}

SOLVED_PER_CHUNK = 24
EXERCISE_PER_CHUNK = 45

def clean(t):
    # normalise common PDF artifacts
    t = t.replace('\x95', ' × ').replace('�', ' × ')
    t = t.replace('\x96', ' - ').replace('\x97', ' - ')
    t = t.replace('\xa0', ' ')
    return t

def split_numbered(block):
    """Split a text block into (num, text) by leading 'N.' markers."""
    # boundaries: start-of-line optional ws, digits, dot
    parts = re.split(r'(?m)^\s*(\d{1,3})\s*\.\s', block)
    # parts = [pre, num1, body1, num2, body2, ...]
    out = []
    for i in range(1, len(parts)-1, 2):
        try:
            num = int(parts[i])
        except ValueError:
            continue
        out.append((num, parts[i+1]))
    return out

def split_solved(block):
    """Split solved region into example blocks by 'Ex.' markers."""
    parts = re.split(r'(?m)(Ex\.?\s*\d+\s*\.?)', block)
    out = []
    # parts[0] is theory/preamble; then alternating marker, body
    for i in range(1, len(parts)-1, 2):
        out.append((parts[i].strip(), parts[i+1]))
    return out

chunks = []
cid = 0
for ch in sorted(chmeta):
    if ch == 1:
        continue  # Number System already in DB
    m = chmeta[ch]
    t = clean(open(m['file'], encoding='utf-8', errors='replace').read())
    slug, name = m['slug'], m['name']

    exPos = t.find('EXERCISE')
    if exPos < 0:
        exPos = t.find('OBJECTIVE TYPE')
    if exPos < 0:
        exPos = len(t)
    solved_region = t[:exPos]
    exercise_region = t[exPos:]

    # answer-key map from exercise region: 'N. (x)' (flexible whitespace incl newlines)
    akey = {}
    for mt in re.finditer(r'(\d{1,3})\s*\.\s*\(([a-eA-E])\)', exercise_region):
        n = int(mt.group(1)); let = mt.group(2).lower()
        if n not in akey:
            akey[n] = let

    # split exercise into questions (B) and solutions (C) at first SOLUTIONS heading
    solHead = re.search(r'(?m)^\s*SOLUTIONS', exercise_region)
    if solHead:
        B = exercise_region[:solHead.start()]
        C = exercise_region[solHead.start():]
    else:
        B = exercise_region; C = ''
    questions = split_numbered(B)
    solmap = dict(split_numbered(C))

    # ---- SOLVED chunks ----
    solved = split_solved(solved_region)
    for i in range(0, len(solved), SOLVED_PER_CHUNK):
        grp = solved[i:i+SOLVED_PER_CHUNK]
        body = '\n\n'.join(f'{mk} {bd.strip()}' for mk, bd in grp)
        fn = os.path.join(OUT, f'c{cid:03d}-ch{ch:02d}-solved-{i//SOLVED_PER_CHUNK}.txt')
        open(fn, 'w', encoding='utf-8').write(
            f'CHAPTER {ch}: {name}\nSECTION: SOLVED EXAMPLES (each has an inline solution "Sol.")\n\n{body}')
        chunks.append({'chunkId': cid, 'chapter': ch, 'slug': slug, 'name': name,
                       'type': 'solved', 'count': len(grp), 'file': fn})
        cid += 1

    # ---- EXERCISE chunks ----
    for i in range(0, len(questions), EXERCISE_PER_CHUNK):
        grp = questions[i:i+EXERCISE_PER_CHUNK]
        nums = [n for n, _ in grp]
        qtext = '\n\n'.join(f'{n}. {qt.strip()}' for n, qt in grp)
        keyslice = '\n'.join(f'{n}. ({akey[n]})' for n in nums if n in akey)
        solslice = '\n\n'.join(f'{n}. {solmap[n].strip()}' for n in nums if n in solmap)
        fn = os.path.join(OUT, f'c{cid:03d}-ch{ch:02d}-ex-{i//EXERCISE_PER_CHUNK}.txt')
        open(fn, 'w', encoding='utf-8').write(
            f'CHAPTER {ch}: {name}\nSECTION: EXERCISE (objective MCQs)\n'
            f'Questions {nums[0]}-{nums[-1]}\n\n'
            f'===== QUESTIONS =====\n{qtext}\n\n'
            f'===== ANSWER KEY (correct option letter) =====\n{keyslice}\n\n'
            f'===== DETAILED SOLUTIONS =====\n{solslice}\n')
        chunks.append({'chunkId': cid, 'chapter': ch, 'slug': slug, 'name': name,
                       'type': 'exercise', 'count': len(grp),
                       'qStart': nums[0], 'qEnd': nums[-1],
                       'keyCount': sum(1 for n in nums if n in akey),
                       'solCount': sum(1 for n in nums if n in solmap), 'file': fn})
        cid += 1

json.dump(chunks, open(os.path.join(RSA, 'chunk-manifest.json'), 'w', encoding='utf-8'), indent=1)

# summary
from collections import defaultdict
bych = defaultdict(lambda: {'solved':0,'ex':0,'chunks':0,'qs':0})
for c in chunks:
    bych[c['chapter']]['chunks'] += 1
    bych[c['chapter']]['qs'] += c['count']
    bych[c['chapter']]['solved' if c['type']=='solved' else 'ex'] += c['count']
print(f'Total chunks: {len(chunks)} | Total questions targeted: {sum(c["count"] for c in chunks)}')
print('ch | chunks | solvedQ | exerciseQ')
for ch in sorted(bych):
    b=bych[ch]
    print(f'{ch:>2} | {b["chunks"]:>3} chunks | solved={b["solved"]:>3} | ex={b["ex"]:>4}')
