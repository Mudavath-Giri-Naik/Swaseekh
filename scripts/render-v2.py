# Render volume2 PDF pages to PNG (separate dir from volume1).
#   python scripts/render-v2.py            -> render all task pages from tasks-v2.json
#   python scripts/render-v2.py 7-100      -> render a specific range
# Output: scripts/data/pages-v2/page-0007.png ...
import sys, os, json
import fitz  # PyMuPDF

HERE = os.path.dirname(os.path.abspath(__file__))
PDF = os.path.join(HERE, 'data', 'volume2.pdf')
OUT = os.path.join(HERE, 'data', 'pages-v2')
TASKS = os.path.join(HERE, 'data', 'tasks-v2.json')
os.makedirs(OUT, exist_ok=True)

def parse(args):
    pages = set()
    for a in args:
        if '-' in a:
            lo, hi = a.split('-'); pages.update(range(int(lo), int(hi) + 1))
        else:
            pages.add(int(a))
    return sorted(pages)

def main():
    if len(sys.argv) > 1:
        pages = parse(sys.argv[1:])
    else:
        tasks = json.load(open(TASKS, encoding='utf-8'))
        ps = set()
        for t in tasks:
            ps.add(t['page'])
            ps.add(t['page'] + 1)  # next page in case a question continues
        pages = sorted(p for p in ps if p >= 1)
    doc = fitz.open(PDF)
    zoom = 2.2  # ~158 DPI
    mat = fitz.Matrix(zoom, zoom)
    written = 0; skipped = 0
    for p in pages:
        if p < 1 or p > doc.page_count:
            continue
        out = os.path.join(OUT, f'page-{p:04d}.png')
        if os.path.exists(out) and os.path.getsize(out) > 0:
            skipped += 1; continue
        pix = doc.load_page(p - 1).get_pixmap(matrix=mat)
        pix.save(out)
        written += 1
        if written % 50 == 0:
            print(f'  ...{written} rendered')
    print(f'doc {doc.page_count} pages; rendered {written}, skipped(existing) {skipped}; out={OUT}')

if __name__ == '__main__':
    main()
