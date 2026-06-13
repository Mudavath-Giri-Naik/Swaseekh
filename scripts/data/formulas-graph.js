// Graph Theory foundational formulas — new content doc con_020.
// Synced via scripts/sync-formulas.js (which reads scripts/data/formulas-add.js),
// so this file is consumed by a small wrapper below when run directly, OR merged
// into the master list. We export the same shape the syncer expects.
module.exports = [
  {
    conceptId: 'con_020',
    conceptTitle: 'Graph Theory — Foundations',
    reference: 'Rosen, Discrete Mathematics, Chapter 10',
    groups: [
      {
        groupId: 'gt-counting',
        groupTitle: 'Counting Graphs, Edges & Cycles',
        formulas: [
          {
            formulaId: 'edges-complete-graph',
            name: 'Edges in a Complete Graph K_n',
            latex: '|E(K_n)| = \\binom{n}{2} = \\frac{n(n-1)}{2}',
            plain: '|E(K_n)| = C(n,2) = n(n-1)/2',
            whenToUse: 'The maximum possible number of edges on n labelled vertices.',
            terms: [{ symbol: 'n', means: 'number of vertices' }],
            trap: 'This is the cap on edges; any simple graph on n vertices has between 0 and C(n,2) edges.',
            reference: 'Section 10.2',
          },
          {
            formulaId: 'num-labeled-graphs',
            name: 'Number of Labelled Simple Graphs on n Vertices',
            latex: '2^{\\binom{n}{2}} = 2^{\\,n(n-1)/2}',
            plain: '2^(C(n,2)) = 2^(n(n-1)/2)',
            whenToUse: 'Counting all simple graphs (each possible edge is independently present or absent).',
            terms: [{ symbol: 'C(n,2)', means: 'number of possible edges, each a yes/no choice' }],
            trap: 'Every one of the C(n,2) potential edges is an independent 2-way choice, giving 2^(C(n,2)).',
            reference: 'Product rule over potential edges',
          },
          {
            formulaId: 'count-k-cycles-complete',
            name: 'Number of k-Cycles in a Complete Graph K_n',
            latex: '\\binom{n}{k}\\cdot\\frac{(k-1)!}{2}',
            plain: 'C(n,k) * (k-1)!/2',
            whenToUse: 'Counting distinct cycles of a fixed length k in a complete graph on labelled vertices.',
            terms: [
              { symbol: 'C(n,k)', means: 'ways to choose the k vertices on the cycle' },
              { symbol: '(k-1)!/2', means: 'distinct cyclic orderings of k vertices (rotations and reflection identified)' },
            ],
            trap: 'A cycle on k chosen vertices has (k-1)!/2 arrangements, not k!; divide out k rotations and 2 directions.',
            reference: 'Circular permutations applied to chosen vertex sets',
          },
        ],
      },
      {
        groupId: 'gt-degree',
        groupTitle: 'Degree, Handshaking & Bounds',
        formulas: [
          {
            formulaId: 'handshaking-lemma',
            name: 'Handshaking Lemma',
            latex: '\\sum_{v \\in V} \\deg(v) = 2|E|',
            plain: 'sum of deg(v) over all v = 2|E|',
            whenToUse: 'Any time degrees and edge counts must be related; the workhorse of degree problems.',
            terms: [
              { symbol: 'deg(v)', means: 'the degree (number of incident edges) of vertex v' },
              { symbol: '|E|', means: 'the number of edges' },
            ],
            trap: 'Each edge contributes 2 to the degree sum (one per endpoint), so the total is always even.',
            reference: 'Theorem 1, Section 10.2',
          },
          {
            formulaId: 'odd-degree-vertices-even',
            name: 'Even Number of Odd-Degree Vertices',
            latex: '\\big|\\{\\,v : \\deg(v)\\text{ is odd}\\,\\}\\big| \\text{ is even}',
            plain: 'the number of odd-degree vertices is even',
            whenToUse: 'Proving parity facts about degrees; a direct corollary of the handshaking lemma.',
            terms: [{ symbol: 'deg(v)', means: 'degree of vertex v' }],
            trap: 'Because the total degree sum is even, the odd-degree vertices must pair up.',
            reference: 'Corollary, Section 10.2',
          },
          {
            formulaId: 'planar-edge-bound',
            name: 'Edge Bound for Simple Planar Graphs',
            latex: '|E| \\leq 3|V| - 6 \\quad (|V| \\geq 3)',
            plain: '|E| <= 3|V| - 6 for a simple connected planar graph with |V| >= 3',
            whenToUse: 'Testing planarity or bounding degrees/edges of planar graphs.',
            terms: [
              { symbol: '|V|', means: 'number of vertices' },
              { symbol: '|E|', means: 'number of edges' },
            ],
            trap: 'If girth is g, the sharper bound |E| <= g/(g-2) (|V|-2) applies (e.g. 2|V|-4 for triangle-free).',
            reference: 'Corollary of Euler\'s formula, Section 10.7',
          },
          {
            formulaId: 'degree-sum-bound-mindeg',
            name: 'Minimum-Degree Bound from the Degree Sum',
            latex: '\\delta(G)\\cdot|V| \\leq \\sum_{v} \\deg(v) = 2|E|',
            plain: 'delta(G) * |V| <= sum deg(v) = 2|E|',
            whenToUse: 'Bounding the minimum degree when the number of edges is limited.',
            terms: [
              { symbol: '\\delta(G)', means: 'the minimum degree over all vertices' },
              { symbol: '2|E|', means: 'the total degree (handshaking)' },
            ],
            trap: 'Min degree times vertex count cannot exceed the degree sum; combine with edge bounds to cap it.',
            reference: 'Averaging argument',
          },
        ],
      },
    ],
  },
]
