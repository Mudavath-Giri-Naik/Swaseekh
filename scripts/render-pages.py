# Render specific PDF pages to PNG so they can be read as images.
#   python scripts/render-pages.py 15-23 30   (1-based page numbers/ranges)
# Output: scripts/data/pages/page-0015.png ...
import sys, os
import fitz  # PyMuPDF

HERE = os.path.dirname(os.path.abspath(__file__))
PDF = os.path.join(HERE, 'data', 'volume1.pdf')
OUT = os.path.join(HERE, 'data', 'pages')
os.makedirs(OUT, exist_ok=True)

def parse(args):
    pages = []
    for a in args:
        if '-' in a:
            lo, hi = a.split('-')
            pages.extend(range(int(lo), int(hi) + 1))
        else:
            pages.append(int(a))
    return pages

def main():
    pages = parse(sys.argv[1:]) if len(sys.argv) > 1 else []
    if not pages:
        print('Usage: python render-pages.py 15-23 30')
        return
    doc = fitz.open(PDF)
    zoom = 2.2  # ~158 DPI, crisp enough for equations
    mat = fitz.Matrix(zoom, zoom)
    written = []
    for p in pages:
        if p < 1 or p > doc.page_count:
            print(f'  skip {p} (out of range 1..{doc.page_count})')
            continue
        page = doc.load_page(p - 1)
        pix = page.get_pixmap(matrix=mat)
        path = os.path.join(OUT, f'page-{p:04d}.png')
        pix.save(path)
        written.append(path)
    print(f'doc has {doc.page_count} pages; wrote {len(written)} png(s) to {OUT}')
    for w in written:
        print('  ', os.path.basename(w), f'{os.path.getsize(w)//1024}KB')

if __name__ == '__main__':
    main()
