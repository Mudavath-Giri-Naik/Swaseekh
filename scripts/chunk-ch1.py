# -*- coding: utf-8 -*-
"""Chunk ONLY Chapter 1 (Number System), appending with chunk IDs starting at 276
   so existing chunks/out files are untouched. Writes ch1-chunk-manifest.json."""
import re, os, json

RSA = r'e:\Swaseekh-main\Swaseekh-main\scripts\data\rsa'
OUT = os.path.join(RSA, 'chunks')
manifest = json.load(open(os.path.join(RSA, 'manifest.json'), encoding='utf-8'))
ch1 = next(m for m in manifest if m['chapter'] == 1)

SOLVED_PER_CHUNK = 24
EXERCISE_PER_CHUNK = 45
START_ID = 276

def clean(t):
    t = t.replace('\x95', ' × ').replace('�', ' × ')
    t = t.replace('\x96', ' - ').replace('\x97', ' - ').replace('\xa0', ' ')
    return t

def split_numbered(block):
    parts = re.split(r'(?m)^\s*(\d{1,3})\s*\.\s', block)
    out = []
    for i in range(1, len(parts)-1, 2):
        try: num = int(parts[i])
        except ValueError: continue
        out.append((num, parts[i+1]))
    return out

def split_solved(block):
    parts = re.split(r'(?m)(Ex\.?\s*\d+\s*\.?)', block)
    return [(parts[i].strip(), parts[i+1]) for i in range(1, len(parts)-1, 2)]

t = clean(open(ch1['file'], encoding='utf-8', errors='replace').read())
slug, name = 'number-system', 'Number System'
exPos = t.find('EXERCISE')
if exPos < 0: exPos = t.find('OBJECTIVE TYPE')
if exPos < 0: exPos = len(t)
solved_region, exercise_region = t[:exPos], t[exPos:]

akey = {}
for mt in re.finditer(r'(\d{1,3})\s*\.\s*\(([a-eA-E])\)', exercise_region):
    n = int(mt.group(1));
    if n not in akey: akey[n] = mt.group(2).lower()

solHead = re.search(r'(?m)^\s*SOLUTIONS', exercise_region)
if solHead:
    B, C = exercise_region[:solHead.start()], exercise_region[solHead.start():]
else:
    B, C = exercise_region, ''
questions = split_numbered(B)
solmap = dict(split_numbered(C))

chunks = []
cid = START_ID
solved = split_solved(solved_region)
for i in range(0, len(solved), SOLVED_PER_CHUNK):
    grp = solved[i:i+SOLVED_PER_CHUNK]
    body = '\n\n'.join(f'{mk} {bd.strip()}' for mk, bd in grp)
    fn = os.path.join(OUT, f'c{cid:03d}-ch01-solved-{i//SOLVED_PER_CHUNK}.txt')
    open(fn, 'w', encoding='utf-8').write(f'CHAPTER 1: {name}\nSECTION: SOLVED EXAMPLES (inline "Sol.")\n\n{body}')
    chunks.append({'chunkId': cid, 'chapter': 1, 'slug': slug, 'name': name, 'type': 'solved', 'count': len(grp), 'file': fn})
    cid += 1

for i in range(0, len(questions), EXERCISE_PER_CHUNK):
    grp = questions[i:i+EXERCISE_PER_CHUNK]
    nums = [n for n, _ in grp]
    qtext = '\n\n'.join(f'{n}. {qt.strip()}' for n, qt in grp)
    keyslice = '\n'.join(f'{n}. ({akey[n]})' for n in nums if n in akey)
    solslice = '\n\n'.join(f'{n}. {solmap[n].strip()}' for n in nums if n in solmap)
    fn = os.path.join(OUT, f'c{cid:03d}-ch01-ex-{i//EXERCISE_PER_CHUNK}.txt')
    open(fn, 'w', encoding='utf-8').write(
        f'CHAPTER 1: {name}\nSECTION: EXERCISE (objective MCQs)\nQuestions {nums[0]}-{nums[-1]}\n\n'
        f'===== QUESTIONS =====\n{qtext}\n\n===== ANSWER KEY =====\n{keyslice}\n\n===== DETAILED SOLUTIONS =====\n{solslice}\n')
    chunks.append({'chunkId': cid, 'chapter': 1, 'slug': slug, 'name': name, 'type': 'exercise', 'count': len(grp), 'file': fn})
    cid += 1

json.dump(chunks, open(os.path.join(RSA, 'ch1-chunk-manifest.json'), 'w', encoding='utf-8'), indent=1)
print(f'Chapter 1 chunks: {len(chunks)} (ids {START_ID}..{cid-1})')
print(f'  solved chunks + exercise chunks | total numbered questions targeted: {sum(c["count"] for c in chunks)}')
