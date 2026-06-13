// Chapter 2 — Graph Theory, batch 1: Counting (2.1.1-2.1.3) + Degree of Graph (2.2.1-2.2.4)
// Transcribed from volume1.pdf pages 15-16; answers from the Chapter-2 answer key (page 30).
const STYLE =
  "<style>.bg{fill:var(--cell-bg,#F1EFE8);stroke:var(--cell-line,#B4B2A9);stroke-width:2;}" +
  ".hi{fill:var(--hi-bg,#CECBF6);stroke:var(--hi-line,#7F77DD);stroke-width:3;}" +
  ".ok{fill:var(--ok,#1D9E75);}.no{fill:var(--no,#D85A30);}" +
  ".ink{fill:var(--color-text-primary,#2C2C2A);}.mut{fill:var(--mut,#5F5E5A);}" +
  ".big{font-size:26px;font-weight:700;}.lbl{font-size:18px;font-weight:600;}" +
  ".sub{font-size:14px;}.tag{font-size:14px;font-weight:600;}.op{font-size:24px;font-weight:700;}" +
  ".edge{stroke:var(--cell-line,#B4B2A9);stroke-width:2.5;}.eon{stroke:var(--hi-line,#7F77DD);stroke-width:3.5;}" +
  "text{font-family:system-ui,-apple-system,Segoe UI,sans-serif;}</style>"
function svg(vb, label, desc, inner) {
  return `<svg viewBox='0 0 ${vb}' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='${label}'><title>${label}</title><desc>${desc}</desc>${STYLE}${inner}</svg>`
}
function row(y, text, w) { w = w || 500; return `<rect x='30' y='${y}' width='${w}' height='36' rx='8' class='bg'/><text x='${30 + w / 2}' y='${y + 25}' text-anchor='middle' class='lbl ink'>${text}</text>` }
function node(cx, cy, label, cls) { return `<circle cx='${cx}' cy='${cy}' r='15' class='${cls || 'bg'}'/><text x='${cx}' y='${cy + 5}' text-anchor='middle' class='sub ink'>${label}</text>` }

module.exports = [
  {
    meta: { exam: 'GATE 2001', year: 2001, marks: 2, difficulty: 'easy', type: 'MCQ', subject: 'Discrete Mathematics', topic: 'Graph Theory', subtopic: 'Counting' },
    question: 'How many undirected graphs (not necessarily connected) can be constructed out of a given set V = {v_1, v_2, ..., v_n} of n vertices?  A. n(n-1)/2   B. 2^n   C. n!   D. 2^(n(n-1)/2)',
    answer: 'D. 2^(n(n-1)/2)',
    understand: {
      plain: 'A simple undirected graph on these n labelled vertices is decided edge by edge. There are C(n,2) = n(n-1)/2 possible vertex-pairs, and each pair is independently either an edge or not — a yes/no choice. By the product rule the number of graphs is 2^(n(n-1)/2).',
      keywords: [
        { term: 'possible edges', explain: 'pairs of distinct vertices = C(n,2)', example: 'n=3 gives 3 possible edges' },
        { term: 'independent choice', explain: 'each possible edge is present or absent', example: '2 choices per edge' },
      ],
      visual_svg: svg('520 220', 'Each possible edge is an independent on/off choice', 'With C(n,2) possible edges, each present or absent, the count is 2^(C(n,2)).',
        node(110, 80, 'v1') + node(250, 60, 'v2') + node(200, 170, 'v3') +
        "<line x1='110' y1='80' x2='250' y2='60' class='eon'/><line x1='250' y1='60' x2='200' y2='170' class='edge' stroke-dasharray='6 5'/><line x1='110' y1='80' x2='200' y2='170' class='eon'/>" +
        "<text x='370' y='70' class='tag ink'>each pair:</text><text x='370' y='98' class='tag ok'>edge (on)</text><text x='370' y='126' class='tag mut'>or no edge (off)</text>" +
        "<text x='260' y='205' text-anchor='middle' class='tag ink'>graphs = 2^(C(n,2)) = 2^(n(n-1)/2)</text>"),
      visual_alt: 'Each of the C(n,2) possible edges is independently present or absent, giving 2^(n(n-1)/2) graphs.',
    },
    given: {
      aim: 'Count all simple undirected graphs on n labelled vertices.',
      terms: [
        { term: 'n', meaning: 'number of labelled vertices', example: 'V = {v_1, ..., v_n}', connects: 'fixes the number of possible edges' },
        { term: 'C(n,2)', meaning: 'number of possible edges', example: 'n(n-1)/2 vertex-pairs', connects: 'how many on/off choices there are' },
        { term: 'on/off per edge', meaning: 'each pair is an edge or not', example: '2 options each', connects: 'product rule gives 2^(C(n,2))' },
      ],
      plan: 'Count the possible edges as C(n,2), note each is an independent 2-way choice, and apply the product rule to get 2^(n(n-1)/2).',
    },
    to_find: 'The number of undirected graphs on n vertices.',
    solution: {
      steps: [
        { step: 1, title: 'Count the possible edges', formula_id: 'edges-complete-graph', formula_raw: '|E(K_n)| = C(n,2) = n(n-1)/2', apply: 'there are n(n-1)/2 candidate edges', note: 'every distinct pair of vertices is a potential edge' },
        { step: 2, title: 'Each edge is an independent choice', formula_id: 'num-labeled-graphs', formula_raw: '2^(C(n,2))', apply: 'each of the n(n-1)/2 edges is present or absent -> 2^(n(n-1)/2)', note: 'product rule over independent yes/no choices; matches option D' },
      ],
      result: '2^(n(n-1)/2)  (Option D)',
    },
    formula_ids_used: ['edges-complete-graph', 'num-labeled-graphs', 'product-rule'],
    formula_note: 'Possible edges = C(n,2); each is an independent on/off choice, so the count is 2^(n(n-1)/2).',
  },
  {
    meta: { exam: 'GATE 2004', year: 2004, marks: 2, difficulty: 'hard', type: 'MCQ', subject: 'Discrete Mathematics', topic: 'Graph Theory', subtopic: 'Counting' },
    question: 'How many graphs on n labelled vertices exist which have at least (n^2 - 3n)/2 edges?  A. C((n^2-n)/2, (n^2-3n)/2)   B. sum_{k=0}^{(n^2-3n)/2} C((n^2-n)/2, k)   C. C((n^2-n)/2, n)   D. sum_{k=0}^{n} C((n^2-n)/2, k)',
    answer: 'D. sum_{k=0}^{n} C((n^2-n)/2, k)',
    understand: {
      plain: 'The maximum number of edges is M = C(n,2) = (n^2-n)/2. The threshold (n^2-3n)/2 equals M - n. So "at least M - n edges present" is the same as "at most n edges missing". Counting graphs by how many of the M possible edges are omitted (0, 1, ..., up to n) gives the sum C(M,0) + C(M,1) + ... + C(M,n).',
      keywords: [
        { term: 'complementary counting', explain: 'count by missing edges instead of present edges', example: 'at least M-n present = at most n absent' },
        { term: 'M = C(n,2)', explain: 'maximum possible edges', example: '(n^2-n)/2' },
      ],
      visual_svg: svg('540 210', 'Count by the number of missing edges', 'At least M-n edges present means at most n of the M possible edges are missing; sum C(M,k) for k=0..n.',
        row(24, 'max edges M = C(n,2) = (n^2 - n)/2') + row(70, 'threshold (n^2 - 3n)/2 = M - n') +
        "<text x='270' y='140' text-anchor='middle' class='tag ink'>at least M - n present  =  at most n missing</text>" +
        "<text x='270' y='180' text-anchor='middle' class='tag ok'>count = sum_{k=0}^{n} C(M, k)</text>"),
      visual_alt: 'Since the threshold is M-n where M=C(n,2), graphs with at least that many edges are those missing at most n edges: sum of C(M,k) for k=0..n.',
    },
    given: {
      aim: 'Count labelled graphs on n vertices having at least (n^2-3n)/2 edges.',
      terms: [
        { term: 'M', meaning: 'maximum possible edges', example: 'M = C(n,2) = (n^2-n)/2', connects: 'total number of potential edges' },
        { term: 'threshold', meaning: '(n^2-3n)/2', example: 'equals M - n', connects: 'turns "at least" into "at most n missing"' },
        { term: 'missing edges', meaning: 'edges omitted from the complete graph', example: 'choose k of M to omit', connects: 'C(M,k) graphs for each k' },
      ],
      plan: 'Write the max edges as M = C(n,2), rewrite the threshold as M - n, switch to counting missing edges (0 to n), and sum C(M,k) over k = 0..n.',
    },
    to_find: 'The number of such graphs.',
    solution: {
      steps: [
        { step: 1, title: 'Maximum possible edges', formula_id: 'edges-complete-graph', formula_raw: 'M = C(n,2) = (n^2 - n)/2', apply: 'threshold (n^2 - 3n)/2 = M - n', note: 'rewrite the bound in terms of M' },
        { step: 2, title: 'Switch to missing edges', formula_id: 'complement-rule', formula_raw: 'at least (M - n) present  <=>  at most n absent', apply: 'count graphs missing 0, 1, ..., n of the M edges', note: 'complementary counting is easier here' },
        { step: 3, title: 'Sum the choices', formula_id: 'r-combination-no-rep', formula_raw: 'C(M, k) ways to choose the k missing edges', apply: 'total = sum_{k=0}^{n} C((n^2-n)/2, k)', note: 'sum rule over k = 0..n; matches option D' },
      ],
      result: 'sum_{k=0}^{n} C((n^2-n)/2, k)  (Option D)',
    },
    formula_ids_used: ['edges-complete-graph', 'complement-rule', 'r-combination-no-rep', 'sum-rule'],
    formula_note: 'M = C(n,2); "at least M-n edges" = "at most n missing", so the count is sum_{k=0}^{n} C(M,k).',
  },
  {
    meta: { exam: 'GATE 2012', year: 2012, marks: 2, difficulty: 'medium', type: 'NAT', subject: 'Discrete Mathematics', topic: 'Graph Theory', subtopic: 'Counting' },
    question: 'Let G be a complete undirected graph on 6 vertices. If vertices of G are labelled, then the number of distinct cycles of length 4 in G is equal to ______.  (The original options A. 15  B. 30  C. 90  D. 360 were all incorrect; the official answer key marks this question as excluded.)',
    answer: '45 (the four printed options 15/30/90/360 are all wrong, so the official key excludes this question)',
    understand: {
      plain: 'A 4-cycle uses 4 of the 6 vertices, chosen in C(6,4) = 15 ways. On a fixed set of 4 labelled vertices the number of distinct cycles is (4-1)!/2 = 3 (arrange in a circle: 3! rotations identified and 2 directions identified). So the count is 15 x 3 = 45 — which is not among the given options, so GATE excluded the question.',
      keywords: [
        { term: 'choose the vertices', explain: 'pick which 4 of 6 vertices form the cycle', example: 'C(6,4) = 15' },
        { term: 'cycles per 4 vertices', explain: '(4-1)!/2 = 3 distinct 4-cycles', example: 'circular arrangements up to rotation and reflection' },
      ],
      visual_svg: svg('520 230', 'Counting 4-cycles in K6', 'Choose 4 of 6 vertices (15 ways); each set of 4 yields (4-1)!/2 = 3 distinct cycles; total 45.',
        node(110, 60, '1') + node(220, 60, '2') + node(220, 170, '3') + node(110, 170, '4') +
        "<line x1='110' y1='60' x2='220' y2='60' class='eon'/><line x1='220' y1='60' x2='220' y2='170' class='eon'/><line x1='220' y1='170' x2='110' y2='170' class='eon'/><line x1='110' y1='170' x2='110' y2='60' class='eon'/>" +
        "<text x='370' y='70' class='tag ink'>C(6,4) = 15</text><text x='370' y='100' class='tag ink'>x (4-1)!/2 = 3</text><text x='370' y='140' class='tag ok'>= 45 distinct</text><text x='370' y='166' class='tag ok'>4-cycles</text>"),
      visual_alt: 'Choosing 4 of 6 vertices (15 ways) and forming (4-1)!/2 = 3 cycles each gives 45 distinct 4-cycles.',
    },
    given: {
      aim: 'Count the distinct 4-cycles in the complete graph K6 on labelled vertices.',
      terms: [
        { term: 'C(6,4)', meaning: 'ways to choose the 4 vertices of the cycle', example: '= 15', connects: 'which vertices take part' },
        { term: '(4-1)!/2', meaning: 'distinct cycles on 4 labelled vertices', example: '= 3', connects: 'circular orderings up to rotation/reflection' },
        { term: 'product', meaning: '15 x 3', example: '= 45', connects: 'the total count' },
      ],
      plan: 'Choose the 4 cycle vertices via C(6,4), multiply by the (4-1)!/2 distinct cyclic arrangements of 4 labelled vertices, and combine.',
    },
    to_find: 'The number of distinct length-4 cycles in K6.',
    solution: {
      steps: [
        { step: 1, title: 'Choose the cycle vertices', formula_id: 'r-combination-no-rep', formula_raw: 'C(6, 4)', apply: 'C(6,4) = 15 ways to pick the 4 vertices', note: 'a 4-cycle uses exactly 4 vertices' },
        { step: 2, title: 'Cycles per chosen set', formula_id: 'count-k-cycles-complete', formula_raw: 'distinct k-cycles in K_n = C(n,k) * (k-1)!/2', apply: '(4-1)!/2 = 3 cycles per 4-vertex set; total = 15 x 3 = 45', note: 'circular arrangements identify 4 rotations and 2 directions' },
      ],
      result: '45 (not among the printed options; question excluded by the official key)',
    },
    formula_ids_used: ['count-k-cycles-complete', 'r-combination-no-rep'],
    formula_note: 'Distinct k-cycles in K_n = C(n,k)*(k-1)!/2; for K6, k=4 gives 15*3 = 45. The printed options omit 45, so GATE excluded the question.',
  },
  {
    meta: { exam: 'GATE 1987', year: 1987, marks: 2, difficulty: 'easy', type: 'NAT', subject: 'Discrete Mathematics', topic: 'Graph Theory', subtopic: 'Degree of Graph' },
    question: 'Show that the number of vertices of odd degree in a finite graph is even.',
    answer: 'The number of odd-degree vertices is even (a direct consequence of the handshaking lemma).',
    understand: {
      plain: 'Every edge has two endpoints, so adding up all vertex degrees counts each edge twice: the total degree is 2|E|, an even number. Splitting the vertices into even-degree and odd-degree groups, the even-degree group contributes an even sum, so the odd-degree group must also sum to an even number — which forces an even count of odd-degree vertices.',
      keywords: [
        { term: 'handshaking lemma', explain: 'sum of all degrees = 2|E|', example: 'a triangle: 2+2+2 = 6 = 2x3' },
        { term: 'parity of a sum', explain: 'a sum of odd numbers is even only if there are evenly many', example: '3+5 = 8 (two odds)' },
      ],
      visual_svg: svg('540 190', 'Handshaking parity argument', 'Total degree = 2|E| is even; even-degree part is even, so the odd-degree part has an even number of vertices.',
        row(24, 'sum of all deg(v) = 2|E|   (even)') + row(70, '= [sum over even-deg v] + [sum over odd-deg v]') +
        "<text x='270' y='140' text-anchor='middle' class='tag ink'>even = even + (sum of odd degrees)</text>" +
        "<text x='270' y='176' text-anchor='middle' class='tag ok'>=> number of odd-degree vertices is even</text>"),
      visual_alt: 'Because the total degree 2|E| is even and the even-degree vertices contribute an even sum, the odd-degree vertices must be even in number.',
    },
    given: {
      aim: 'Prove the count of odd-degree vertices in any finite graph is even.',
      terms: [
        { term: 'deg(v)', meaning: 'degree of a vertex', example: 'edges meeting v', connects: 'summed across all vertices' },
        { term: '2|E|', meaning: 'total degree', example: 'each edge counted at both ends', connects: 'always even' },
        { term: 'odd-degree set', meaning: 'vertices with odd degree', example: 'their degree sum must be even', connects: 'forces an even count' },
      ],
      plan: 'Apply the handshaking lemma to get an even total degree, split the sum by parity, and conclude the odd-degree vertices number evenly.',
    },
    to_find: 'A proof that the number of odd-degree vertices is even.',
    solution: {
      steps: [
        { step: 1, title: 'Handshaking lemma', formula_id: 'handshaking-lemma', formula_raw: 'sum_{v} deg(v) = 2|E|', apply: 'the total of all degrees is 2|E|, which is even', note: 'each edge adds 1 to the degree of each of its 2 endpoints' },
        { step: 2, title: 'Split by parity and conclude', formula_id: 'odd-degree-vertices-even', formula_raw: 'even total = (even-degree sum) + (odd-degree sum)', apply: 'even-degree sum is even, so odd-degree sum is even -> an even number of odd terms', note: 'a sum of odd numbers is even only when there is an even count of them' },
      ],
      result: 'The number of odd-degree vertices is even.',
    },
    formula_ids_used: ['handshaking-lemma', 'odd-degree-vertices-even'],
    formula_note: 'Handshaking: total degree = 2|E| (even); the odd-degree vertices must therefore be even in number.',
  },
  {
    meta: { exam: 'GATE 1991', year: 1991, marks: 2, difficulty: 'medium', type: 'NAT', subject: 'Discrete Mathematics', topic: 'Graph Theory', subtopic: 'Degree of Graph' },
    question: 'Show that all the vertices in an undirected finite graph cannot have distinct degrees, if the graph has at least two vertices.',
    answer: 'Two vertices must share a degree (pigeonhole: n vertices but only n-1 attainable distinct degrees).',
    understand: {
      plain: 'In a simple graph on n vertices each degree lies between 0 and n-1, giving n possible values. But 0 and n-1 cannot both occur: a vertex of degree n-1 is joined to everyone, so no vertex can be isolated (degree 0). That leaves only n-1 usable degree values for n vertices, so by the pigeonhole principle two vertices share a degree.',
      keywords: [
        { term: 'degree range', explain: 'each degree is in {0, 1, ..., n-1}', example: 'n possible values' },
        { term: 'mutual exclusion', explain: 'degree 0 and degree n-1 cannot coexist', example: 'a full-degree vertex rules out isolated ones' },
      ],
      visual_svg: svg('540 200', 'Pigeonhole on degrees', 'Degrees lie in 0..n-1, but 0 and n-1 are mutually exclusive, leaving n-1 values for n vertices.',
        row(24, 'possible degrees: 0, 1, 2, ..., n-1   (n values)') +
        "<text x='270' y='96' text-anchor='middle' class='tag no'>degree 0 and degree n-1 cannot both occur</text>" +
        row(116, 'usable values = n - 1  for  n  vertices') +
        "<text x='270' y='184' text-anchor='middle' class='tag ok'>pigeonhole => two vertices share a degree</text>"),
      visual_alt: 'Degrees range over n values 0..n-1, but 0 and n-1 are mutually exclusive, so n vertices map into only n-1 values and two must coincide.',
    },
    given: {
      aim: 'Prove that not all vertices can have distinct degrees (n >= 2).',
      terms: [
        { term: 'n', meaning: 'number of vertices', example: 'n >= 2', connects: 'the count of pigeons' },
        { term: 'degree values', meaning: 'possible degrees 0..n-1', example: 'n candidate values', connects: 'the holes' },
        { term: '0 vs n-1', meaning: 'cannot both appear', example: 'full vertex forbids isolated vertex', connects: 'reduces holes to n-1' },
      ],
      plan: 'List the n candidate degrees 0..n-1, argue 0 and n-1 are mutually exclusive to drop one value, then apply the pigeonhole principle to n vertices over n-1 values.',
    },
    to_find: 'A proof that two vertices share a degree.',
    solution: {
      steps: [
        { step: 1, title: 'Range of degrees', formula_id: 'pigeonhole-basic', formula_raw: 'deg(v) in {0, 1, ..., n-1}', apply: 'n vertices, each degree among these n values', note: 'simple graph: no loops or multi-edges' },
        { step: 2, title: 'Exclude one value', formula_id: 'pigeonhole-basic', formula_raw: 'degree 0 and degree (n-1) are mutually exclusive', apply: 'a degree-(n-1) vertex is adjacent to all, so no degree-0 vertex; only n-1 values remain', note: 'cannot have both an isolated and a full-degree vertex' },
        { step: 3, title: 'Pigeonhole', formula_id: 'pigeonhole-basic', formula_raw: 'n objects into n-1 boxes => some box has >= 2', apply: 'n vertices into n-1 degree values -> two share a degree', note: 'so degrees cannot all be distinct' },
      ],
      result: 'Two vertices must have equal degree; the degrees cannot all be distinct.',
    },
    formula_ids_used: ['pigeonhole-basic'],
    formula_note: 'Degrees 0..n-1 give n values, but 0 and n-1 are mutually exclusive -> n-1 values for n vertices -> pigeonhole.',
  },
  {
    meta: { exam: 'GATE 1995', year: 1995, marks: 2, difficulty: 'easy', type: 'NAT', subject: 'Discrete Mathematics', topic: 'Graph Theory', subtopic: 'Degree of Graph' },
    question: 'Prove that in a finite graph, the number of vertices of odd degree is always even.',
    answer: 'The count of odd-degree vertices is always even (handshaking lemma).',
    understand: {
      plain: 'Sum all the vertex degrees. Since every edge is incident to exactly two vertices, it adds 2 to this total, so the degree sum equals 2|E| and is even. The even-degree vertices contribute an even amount; therefore the odd-degree vertices must also contribute an even amount, which can only happen if there is an even number of them.',
      keywords: [
        { term: 'degree sum', explain: 'sum of deg(v) = 2|E|', example: 'each edge counted twice' },
        { term: 'even count of odds', explain: 'odd numbers sum to even only in even quantity', example: '7+1 = 8' },
      ],
      visual_svg: svg('540 190', 'Odd-degree vertices come in even number', 'Degree sum 2|E| is even; subtracting the even-degree contribution leaves an even sum of odd degrees.',
        row(24, 'sum_{v} deg(v) = 2|E|   (even)') +
        "<text x='270' y='98' text-anchor='middle' class='tag ink'>even-degree vertices: even contribution</text>" +
        "<text x='270' y='134' text-anchor='middle' class='tag ink'>=> odd-degree vertices: even contribution</text>" +
        "<text x='270' y='172' text-anchor='middle' class='tag ok'>=> their count is even</text>"),
      visual_alt: 'The degree sum 2|E| is even, so the odd-degree vertices must occur an even number of times.',
    },
    given: {
      aim: 'Prove the number of odd-degree vertices is even.',
      terms: [
        { term: 'deg(v)', meaning: 'vertex degree', example: 'count of incident edges', connects: 'summed over all vertices' },
        { term: '2|E|', meaning: 'twice the edge count', example: 'the total degree', connects: 'is even' },
        { term: 'odd-degree vertices', meaning: 'vertices with odd degree', example: 'must pair up', connects: 'even count' },
      ],
      plan: 'Use the handshaking lemma for an even degree sum, remove the even-degree contribution, and argue the remaining odd contributions force an even count.',
    },
    to_find: 'A proof that the odd-degree vertex count is even.',
    solution: {
      steps: [
        { step: 1, title: 'Handshaking lemma', formula_id: 'handshaking-lemma', formula_raw: 'sum_{v} deg(v) = 2|E|', apply: 'the degree sum is even', note: 'each edge contributes 2 to the total' },
        { step: 2, title: 'Parity conclusion', formula_id: 'odd-degree-vertices-even', formula_raw: '(sum of odd degrees) = 2|E| - (sum of even degrees) = even', apply: 'an even sum of odd numbers needs an even count of them', note: 'hence the number of odd-degree vertices is even' },
      ],
      result: 'The number of odd-degree vertices is even.',
    },
    formula_ids_used: ['handshaking-lemma', 'odd-degree-vertices-even'],
    formula_note: 'Handshaking lemma: degree sum 2|E| is even, forcing an even number of odd-degree vertices.',
  },
  {
    meta: { exam: 'GATE 2003', year: 2003, marks: 2, difficulty: 'medium', type: 'MCQ', subject: 'Discrete Mathematics', topic: 'Graph Theory', subtopic: 'Degree of Graph' },
    question: 'A graph G = (V, E) satisfies |E| <= 3|V| - 6. The min-degree of G is defined as min_{v in V} {degree(v)}. Therefore, min-degree of G cannot be:  A. 3   B. 4   C. 5   D. 6',
    answer: 'D. 6',
    understand: {
      plain: 'If every vertex had degree at least 6, then the degree sum would be at least 6|V|. But the degree sum is exactly 2|E|, and 2|E| <= 2(3|V| - 6) = 6|V| - 12, which is strictly less than 6|V|. That is a contradiction, so the minimum degree cannot be 6 (it must be at most 5).',
      keywords: [
        { term: 'degree-sum bound', explain: 'min-degree x |V| <= sum of degrees = 2|E|', example: 'delta*|V| <= 2|E|' },
        { term: 'edge bound', explain: '|E| <= 3|V| - 6', example: 'so 2|E| <= 6|V| - 12' },
      ],
      visual_svg: svg('540 200', 'Why minimum degree cannot be 6', 'delta*|V| <= 2|E| <= 6|V|-12 < 6|V| forces delta < 6.',
        row(24, 'if min-degree delta:  delta * |V| <= sum deg = 2|E|') + row(70, '2|E| <= 2(3|V| - 6) = 6|V| - 12') +
        "<text x='270' y='140' text-anchor='middle' class='tag ink'>delta * |V| <= 6|V| - 12 < 6|V|  =>  delta < 6</text>" +
        "<text x='270' y='178' text-anchor='middle' class='tag ok'>min-degree cannot be 6  (Option D)</text>"),
      visual_alt: 'Combining the degree-sum bound with |E| <= 3|V|-6 gives delta < 6, so the minimum degree cannot be 6.',
    },
    given: {
      aim: 'Determine which value the minimum degree cannot take.',
      terms: [
        { term: 'delta', meaning: 'the minimum degree of G', example: 'min over all vertices', connects: 'bounded by the degree sum' },
        { term: '|E| <= 3|V| - 6', meaning: 'the edge constraint', example: 'doubles to 2|E| <= 6|V| - 12', connects: 'caps the total degree' },
        { term: '2|E|', meaning: 'total degree (handshaking)', example: '>= delta * |V|', connects: 'links min-degree to edges' },
      ],
      plan: 'Bound the degree sum below by delta*|V| and above by 2(3|V|-6); combine to show delta < 6, so 6 is impossible.',
    },
    to_find: 'The value the minimum degree cannot equal.',
    solution: {
      steps: [
        { step: 1, title: 'Lower-bound the degree sum', formula_id: 'degree-sum-bound-mindeg', formula_raw: 'delta * |V| <= sum_{v} deg(v) = 2|E|', apply: 'every vertex has degree >= delta', note: 'minimum degree times vertex count' },
        { step: 2, title: 'Upper-bound via the edge constraint', formula_id: 'planar-edge-bound', formula_raw: '|E| <= 3|V| - 6  =>  2|E| <= 6|V| - 12', apply: 'delta * |V| <= 6|V| - 12 < 6|V|', note: 'substitute the given bound' },
        { step: 3, title: 'Conclude', formula_id: 'handshaking-lemma', formula_raw: 'delta * |V| < 6|V|  =>  delta < 6', apply: 'delta <= 5, so the minimum degree cannot be 6', note: 'option D is impossible' },
      ],
      result: 'Minimum degree cannot be 6  (Option D)',
    },
    formula_ids_used: ['degree-sum-bound-mindeg', 'planar-edge-bound', 'handshaking-lemma'],
    formula_note: 'delta*|V| <= 2|E| <= 6|V|-12 < 6|V| forces delta < 6, ruling out a minimum degree of 6.',
  },
]
