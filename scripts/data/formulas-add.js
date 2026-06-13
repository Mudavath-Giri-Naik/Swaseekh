// New formula content docs to sync into the `content` collection.
// Structure mirrors the existing con_010 doc exactly:
//   { conceptId, conceptTitle, reference, groups:[{ groupId, groupTitle, formulas:[ ... ] }] }
// Each formula: { formulaId, name, latex (real LaTeX), plain (unicode), whenToUse, terms:[{symbol,means}], trap, reference }
// The /api/formulas/info route flattens groups[].formulas[] across ALL content docs by formulaId,
// so a formula id only needs to exist in SOME content doc to render in hover-previews.

module.exports = [
  {
    conceptId: 'con_011',
    conceptTitle: 'Generating Functions',
    reference: 'Rosen, Discrete Mathematics, Section 8.4',
    groups: [
      {
        groupId: 'gf-basics',
        groupTitle: 'Generating Functions — Definitions & Standard Series',
        formulas: [
          {
            formulaId: 'gen-func-definition',
            name: 'Ordinary Generating Function (OGF)',
            latex: 'G(x) = \\sum_{n=0}^{\\infty} a_n\\, x^n = a_0 + a_1 x + a_2 x^2 + \\cdots',
            plain: 'G(x) = a0 + a1 x + a2 x^2 + ...',
            whenToUse: 'Encode a whole sequence {a_n} as the coefficients of one power series, then manipulate the series.',
            terms: [
              { symbol: 'a_n', means: 'the n-th term of the sequence' },
              { symbol: 'x', means: 'a formal bookkeeping variable (its value is never plugged in)' },
            ],
            trap: 'The variable x is formal — convergence does not matter; only the coefficients carry the information.',
            reference: 'Section 8.4',
          },
          {
            formulaId: 'gen-func-geometric',
            name: 'Geometric Series',
            latex: '\\frac{1}{1-x} = \\sum_{n=0}^{\\infty} x^n = 1 + x + x^2 + \\cdots',
            plain: '1/(1-x) = 1 + x + x^2 + ... = sum x^n',
            whenToUse: 'The most-used building block: turns 1/(1-x) into the all-ones sequence and back.',
            terms: [
              { symbol: '1/(1-x)', means: 'closed form whose coefficients are all 1' },
            ],
            trap: 'Replacing x by ax gives 1/(1-ax) = sum a^n x^n; replacing x by x^k gives 1/(1-x^k).',
            reference: 'Table 1, Section 8.4',
          },
          {
            formulaId: 'gen-func-n-x-n',
            name: 'Series for sum of n·xⁿ',
            latex: '\\sum_{n=0}^{\\infty} n\\, x^n = \\frac{x}{(1-x)^2}',
            plain: 'sum n x^n = x/(1-x)^2',
            whenToUse: 'Whenever a coefficient grows linearly in n (arithmetic part of a sequence).',
            terms: [
              { symbol: 'n', means: 'the index, which appears as a weight on x^n' },
            ],
            trap: 'Differentiate 1/(1-x) and multiply by x to derive it; do not confuse with 1/(1-x)^2 = sum (n+1)x^n.',
            reference: 'Derived from the geometric series',
          },
          {
            formulaId: 'gen-func-1-minus-x-pow-k',
            name: 'Extended Binomial: 1/(1-x)^k',
            latex: '\\frac{1}{(1-x)^k} = \\sum_{n=0}^{\\infty} \\binom{n+k-1}{\\,k-1\\,}\\, x^n',
            plain: '1/(1-x)^k = sum C(n+k-1, k-1) x^n',
            whenToUse: 'Coefficients of any power of 1/(1-x); the engine behind stars-and-bars counting.',
            terms: [
              { symbol: 'k', means: 'the (positive integer) power of 1/(1-x)' },
              { symbol: 'n', means: 'the exponent whose coefficient you want' },
            ],
            trap: 'k = 2 gives C(n+1,1) = n+1; k = 3 gives C(n+2,2). Read off the coefficient, do not expand by hand.',
            reference: 'Table 1, Section 8.4',
          },
          {
            formulaId: 'gen-func-coeff-extraction',
            name: 'Coefficient Extraction',
            latex: '[x^n]\\, G(x) = a_n',
            plain: '[x^n] G(x) = a_n (the coefficient of x^n)',
            whenToUse: 'The final read-off step: the answer is the coefficient of the right power of x.',
            terms: [
              { symbol: '[x^n]', means: 'the operator "coefficient of x^n in"' },
            ],
            trap: 'Factor out lower powers of x first (e.g. x^9 · series), then shift the index you read off.',
            reference: 'Section 8.4',
          },
          {
            formulaId: 'gen-func-fibonacci',
            name: 'Generating Function of the Fibonacci Numbers',
            latex: 'G(x) = \\sum_{n=0}^{\\infty} F_n x^n = \\frac{x}{1 - x - x^2} \\quad (F_0=0,\\,F_1=1)',
            plain: 'G(x) = x/(1 - x - x^2) for F0=0, F1=1',
            whenToUse: 'Closed-form generating function for any Fibonacci-type recurrence a_n = a_{n-1} + a_{n-2}.',
            terms: [
              { symbol: 'F_n', means: 'the n-th Fibonacci number' },
              { symbol: '1 - x - x^2', means: 'comes straight from the recurrence F_n - F_{n-1} - F_{n-2} = 0' },
            ],
            trap: 'The denominator 1 - x - x^2 always mirrors the recurrence coefficients; the numerator is fixed by the initial terms.',
            reference: 'Example 9, Section 8.4',
          },
        ],
      },
    ],
  },
  {
    conceptId: 'con_012',
    conceptTitle: 'Recurrence Relations',
    reference: 'Rosen, Discrete Mathematics, Sections 8.1–8.2',
    groups: [
      {
        groupId: 'rr-solving',
        groupTitle: 'Solving Recurrence Relations',
        formulas: [
          {
            formulaId: 'recurrence-unfolding',
            name: 'Unfolding / Iteration (a_n = a_{n-1} + g(n))',
            latex: 'a_n = a_0 + \\sum_{j=1}^{n} g(j)',
            plain: 'a_n = a_0 + sum_{j=1..n} g(j)',
            whenToUse: 'First-order recurrences where each step ADDS a known amount g(n) to the previous term.',
            terms: [
              { symbol: 'g(j)', means: 'the amount added at step j' },
              { symbol: 'a_0', means: 'the base/initial value' },
            ],
            trap: 'Sum g(j) over the correct range; an off-by-one in the lower limit is the classic slip.',
            reference: 'Section 8.1',
          },
          {
            formulaId: 'linear-homog-char-eq',
            name: 'Characteristic Equation (linear homogeneous, degree 2)',
            latex: 'a_n = c_1 a_{n-1} + c_2 a_{n-2} \\;\\Longrightarrow\\; r^2 = c_1 r + c_2',
            plain: 'a_n = c1 a_{n-1} + c2 a_{n-2} => r^2 = c1 r + c2',
            whenToUse: 'Constant-coefficient linear homogeneous recurrences; the roots build the closed form.',
            terms: [
              { symbol: 'r', means: 'a root of the characteristic equation' },
              { symbol: 'c_1, c_2', means: 'the recurrence coefficients' },
            ],
            trap: 'Distinct roots give a_n = A r1^n + B r2^n; a repeated root r gives (A + Bn) r^n.',
            reference: 'Theorem 1, Section 8.2',
          },
          {
            formulaId: 'fibonacci-recurrence',
            name: 'Fibonacci Recurrence',
            latex: 'F_n = F_{n-1} + F_{n-2}, \\quad F_1 = F_2 = 1',
            plain: 'F_n = F_{n-1} + F_{n-2}, F1 = F2 = 1',
            whenToUse: 'Counting problems whose count for size n is the sum of the counts for n-1 and n-2.',
            terms: [
              { symbol: 'F_n', means: 'the n-th term (1, 1, 2, 3, 5, 8, 13, ...)' },
            ],
            trap: 'Watch the indexing convention (F_0 = 0 vs F_1 = 1) — it shifts every later value.',
            reference: 'Section 8.1, Example 3',
          },
          {
            formulaId: 'binet-formula',
            name: "Binet's Formula (Fibonacci closed form)",
            latex: 'F_n = \\frac{1}{\\sqrt5}\\left(\\left(\\tfrac{1+\\sqrt5}{2}\\right)^n - \\left(\\tfrac{1-\\sqrt5}{2}\\right)^n\\right)',
            plain: 'F_n = (phi^n - psi^n)/sqrt(5), phi=(1+sqrt5)/2, psi=(1-sqrt5)/2',
            whenToUse: 'Closed form for Fibonacci using the golden-ratio roots of r^2 = r + 1.',
            terms: [
              { symbol: 'phi', means: 'the golden ratio (1+√5)/2' },
              { symbol: 'psi', means: 'its conjugate (1-√5)/2' },
            ],
            trap: 'The two roots come from r^2 = r + 1; the prefactor differs for Fibonacci vs Lucas.',
            reference: 'Section 8.2',
          },
          {
            formulaId: 'lucas-closed-form',
            name: 'Lucas Numbers (closed form)',
            latex: 'L_n = \\left(\\tfrac{1+\\sqrt5}{2}\\right)^n + \\left(\\tfrac{1-\\sqrt5}{2}\\right)^n',
            plain: 'L_n = phi^n + psi^n, phi=(1+sqrt5)/2, psi=(1-sqrt5)/2',
            whenToUse: 'Same recurrence as Fibonacci (r^2 = r + 1) but with the SUM of n-th powers of the roots.',
            terms: [
              { symbol: 'L_n', means: 'the n-th Lucas number (with L1 = 1, L2 = 3)' },
            ],
            trap: 'Lucas adds the two root-powers (coefficients 1, 1); Fibonacci subtracts and scales by 1/√5.',
            reference: 'Section 8.2',
          },
          {
            formulaId: 'fixed-point-recurrence',
            name: 'Fixed Point of a Recurrence (limit)',
            latex: 'x_{n+1} = f(x_n),\\;\\; x_n \\to L \\;\\Longrightarrow\\; L = f(L)',
            plain: 'If x_{n+1} = f(x_n) and x_n -> L, then L = f(L)',
            whenToUse: 'Finding the limit of a converging recurrence: solve L = f(L) for the fixed point.',
            terms: [
              { symbol: 'L', means: 'the limit the sequence converges to' },
              { symbol: 'f', means: 'the iteration map' },
            ],
            trap: 'A recurrence can have several fixed points; the stable (attracting) one needs |f\'(L)| < 1.',
            reference: 'Fixed-point / stability analysis',
          },
        ],
      },
      {
        groupId: 'rr-summation-helpers',
        groupTitle: 'Summation Helpers (used while solving recurrences)',
        formulas: [
          {
            formulaId: 'sum-first-n',
            name: 'Sum of the First n Positive Integers',
            latex: '\\sum_{j=1}^{n} j = \\frac{n(n+1)}{2}',
            plain: 'sum_{j=1..n} j = n(n+1)/2',
            whenToUse: 'Closing an arithmetic sum that appears after unfolding a recurrence.',
            terms: [
              { symbol: 'n', means: 'the upper limit of the sum' },
            ],
            trap: 'Mind whether the sum starts at j = 0 or j = 1; the j = 0 term is 0 here so it does not matter.',
            reference: 'Standard summation',
          },
          {
            formulaId: 'sum-of-squares',
            name: 'Sum of the First n Squares',
            latex: '\\sum_{j=1}^{n} j^2 = \\frac{n(n+1)(2n+1)}{6}',
            plain: 'sum_{j=1..n} j^2 = n(n+1)(2n+1)/6',
            whenToUse: 'Closing a quadratic sum after unfolding a recurrence with a j^2 term.',
            terms: [
              { symbol: 'n', means: 'the upper limit of the sum' },
            ],
            trap: 'Keep the three factors n, (n+1), (2n+1) together before dividing by 6 to avoid rounding errors.',
            reference: 'Standard summation',
          },
          {
            formulaId: 'harmonic-number',
            name: 'Harmonic Number',
            latex: 'H_n = \\sum_{k=1}^{n} \\frac{1}{k} = 1 + \\frac{1}{2} + \\cdots + \\frac{1}{n}',
            plain: 'H_n = 1 + 1/2 + ... + 1/n = sum_{k=1..n} 1/k',
            whenToUse: 'Any expression involving the partial sums of 1/k.',
            terms: [
              { symbol: 'H_n', means: 'the n-th harmonic number' },
            ],
            trap: 'H_n has no simple closed form; manipulate it symbolically rather than evaluating.',
            reference: 'Standard definition',
          },
          {
            formulaId: 'sum-harmonic-identity',
            name: 'Sum of Harmonic Numbers',
            latex: '\\sum_{j=1}^{n} H_j = (n+1)H_n - n',
            plain: 'sum_{j=1..n} H_j = (n+1) H_n - n',
            whenToUse: 'Telescoping/swap-order identity for the running total of harmonic numbers.',
            terms: [
              { symbol: 'H_j', means: 'the j-th harmonic number' },
              { symbol: 'n', means: 'the upper limit of the sum' },
            ],
            trap: 'Derive it by swapping the order of summation (count how many H_j each 1/k appears in).',
            reference: 'Summation-by-parts identity',
          },
          {
            formulaId: 'quadratic-formula',
            name: 'Quadratic Formula',
            latex: 'ax^2 + bx + c = 0 \\;\\Longrightarrow\\; x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
            plain: 'x = (-b +/- sqrt(b^2 - 4ac)) / (2a)',
            whenToUse: 'Solving for the fixed point / characteristic roots when they come from a quadratic.',
            terms: [
              { symbol: 'a, b, c', means: 'coefficients of the quadratic' },
            ],
            trap: 'Two roots appear; pick the one demanded by the problem (e.g. the stable / smaller-magnitude one).',
            reference: 'Standard algebra',
          },
        ],
      },
    ],
  },
]
