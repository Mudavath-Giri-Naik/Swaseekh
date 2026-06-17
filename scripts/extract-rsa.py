# -*- coding: utf-8 -*-
"""Extract RS Aggarwal Quantitative Aptitude into per-chapter text files."""
import fitz, json, re, os

SRC = r'C:\Users\SRINUVASRAO\Downloads\dokumen.pub_quantitative-aptitude-for-competitive-examinations-by-rs-aggarwal-reprint-2017nbsped-9352534026-9789352534029_1769142935.pdf'
OUT = r'e:\Swaseekh-main\Swaseekh-main\scripts\data\rsa'
os.makedirs(OUT, exist_ok=True)

# Canonical chapters in order: (num, CANON HEADER substring, slug, name)
CHAPTERS = [
    (1,  'NUMBER SYSTEM',                'number-system',            'Number System'),
    (2,  'H.C.F. AND L.C.M',             'hcf-and-lcm',              'H.C.F. and L.C.M. of Numbers'),
    (3,  'DECIMAL FRACTIONS',            'decimal-fractions',        'Decimal Fractions'),
    (4,  'SIMPLIFICATION',               'simplification',           'Simplification'),
    (5,  'SQUARE ROOTS AND CUBE ROOTS',  'square-roots-cube-roots',  'Square Roots and Cube Roots'),
    (6,  'AVERAGE',                      'average',                  'Average'),
    (7,  'PROBLEMS ON NUMBERS',          'problems-on-numbers',      'Problems on Numbers'),
    (8,  'PROBLEMS ON AGES',             'problems-on-ages',         'Problems on Ages'),
    (9,  'SURDS AND INDICES',            'surds-and-indices',        'Surds and Indices'),
    (10, 'LOGARITHMS',                   'logarithms',               'Logarithms'),
    (11, 'PERCENTAGE',                   'percentage',               'Percentage'),
    (12, 'PROFIT AND LOSS',              'profit-and-loss',          'Profit and Loss'),
    (13, 'RATIO AND PROPORTION',         'ratio-and-proportion',     'Ratio and Proportion'),
    (14, 'PARTNERSHIP',                  'partnership',              'Partnership'),
    (15, 'CHAIN RULE',                   'chain-rule',               'Chain Rule'),
    (16, 'PIPES AND CISTERNS',           'pipes-and-cisterns',       'Pipes and Cisterns'),
    (17, 'TIME AND WORK',                'time-and-work',            'Time and Work'),
    (18, 'TIME AND DISTANCE',            'time-and-distance',        'Time and Distance'),
    (19, 'BOATS AND STREAMS',            'boats-and-streams',        'Boats and Streams'),
    (20, 'PROBLEMS ON TRAINS',           'problems-on-trains',       'Problems on Trains'),
    (21, 'ALLIGATION OR MIXTURE',        'alligation-or-mixture',    'Alligation or Mixture'),
    (22, 'SIMPLE INTEREST',              'simple-interest',          'Simple Interest'),
    (23, 'COMPOUND INTEREST',            'compound-interest',        'Compound Interest'),
    (24, 'AREA',                         'area',                     'Area'),
    (25, 'VOLUME AND SURFACE AREA',      'volume-and-surface-area',  'Volume and Surface Area'),
    (26, 'RACES AND GAMES OF SKILL',     'races-and-games-of-skill', 'Races and Games of Skill'),
    (27, 'CALENDAR',                     'calendar',                 'Calendar'),
    (28, 'CLOCKS',                       'clocks',                   'Clocks'),
    (29, 'STOCKS AND SHARES',            'stocks-and-shares',        'Stocks and Shares'),
    (30, 'PERMUTATIONS AND COMBINATIONS','permutations-combinations','Permutations and Combinations'),
    (31, 'PROBABILITY',                  'probability',              'Probability'),
    (32, 'TRUE DISCOUNT',                'true-discount',            'True Discount'),
    (33, "BANKER'S DISCOUNT",            'bankers-discount',         "Banker's Discount"),
    (34, 'HEIGHTS AND DISTANCES',        'heights-and-distances',    'Heights and Distances'),
    (35, 'ODD MAN OUT AND SERIES',       'odd-man-out-and-series',   'Odd Man Out and Series'),
    (36, 'TABULATION',                   'tabulation',               'Tabulation (Data Interpretation)'),
    (37, 'BAR GRAPH',                    'bar-graphs',               'Bar Graphs (Data Interpretation)'),
    (38, 'PIE CHART',                    'pie-chart',                'Pie Chart (Data Interpretation)'),
    (39, 'LINE GRAPH',                   'line-graphs',              'Line Graphs (Data Interpretation)'),
]

def norm(s):
    return re.sub(r'[^A-Z]', '', s.upper())

# Extra alias patterns (normalized) -> chapter num, for title pages that differ from running header
ALIASES = {
    'FINDTHEODDMANOUT': 35,
    'ODDMANOUT': 35,
}

# Build normalized lookup, longest-first so "SQUARE ROOTS AND CUBE ROOTS" matches before "AREA"
CANON = sorted(CHAPTERS, key=lambda c: -len(norm(c[1])))

def detect_chapter(page_text):
    """Return chapter num if a chapter running-header is found on this page."""
    lines = [l.strip() for l in page_text.split('\n') if l.strip()]
    head = lines[:5]
    for ln in head:
        u = ln.upper()
        if 'QUANTITATIVE APTITUDE' in u:
            continue
        nu = norm(ln)
        if len(nu) < 4:
            continue
        # alias check
        for ali, num in ALIASES.items():
            if ali in nu:
                return num
        # prefix match against canonical headers (longest-first)
        for num, sub, slug, name in CANON:
            ns = norm(sub)
            if nu.startswith(ns) and len(nu) <= len(ns) + 12:
                return num
    return None

d = fitz.open(SRC)
pages = [d[i].get_text() for i in range(d.page_count)]

# Assign chapter per page with forward-fill
assigned = [None]*len(pages)
cur = None
for i, t in enumerate(pages):
    ch = detect_chapter(t)
    if ch is not None:
        cur = ch
    assigned[i] = cur

# Collect exact page lists per chapter (handles non-contiguity / overlap)
page_lists = {}
for i, ch in enumerate(assigned):
    if ch is None:
        continue
    page_lists.setdefault(ch, []).append(i)

# Write per-chapter files from exact page assignment
manifest = []
for num, sub, slug, name in CHAPTERS:
    if num not in page_lists:
        continue
    plist = page_lists[num]
    text = '\n'.join(pages[i] for i in plist)
    n_sol = len(re.findall(r'\bSol\.', text))
    n_ans = len(re.findall(r'\bAns(?:wers)?\b', text))
    fname = os.path.join(OUT, f'ch{num:02d}-{slug}.txt')
    with open(fname, 'w', encoding='utf-8') as f:
        f.write(text)
    manifest.append({
        'chapter': num, 'slug': slug, 'name': name,
        'physPageStart': plist[0], 'physPageEnd': plist[-1], 'pages': len(plist),
        'chars': len(text), 'solMarkers': n_sol, 'ansMarkers': n_ans,
        'file': fname,
    })

with open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

print('Chapters extracted:', len(manifest))
for m in manifest:
    print(f"  ch{m['chapter']:02d} {m['name'][:34]:34s} pp{m['physPageStart']:>3}-{m['physPageEnd']:>3} ({m['pages']:>3}p) {m['chars']:>7}ch sol={m['solMarkers']:>3}")
