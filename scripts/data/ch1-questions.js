// Chapter 1 (Combinatorics) — the 14 questions missing from the live DB.
// 6 Generating Functions, 7 Recurrence Relation, 1 Combinatorics (pennant).
// Authored to match the 36 gold-standard docs exactly:
//   - ASCII math in formula_raw/apply/result (asciiMathToTeX renders it as LaTeX)
//   - full understand{plain,keywords,visual_svg,visual_alt}, given{aim,terms,plan},
//     solution{steps,result}, formula_ids_used, formula_note
//   - meta.subject "Discrete Mathematics", topic "Combinatorics", subtopic per syllabus map
//   - exam "GATE <year>", type in {NAT,MCQ,MSQ}, difficulty in {easy,medium,hard}

// Shared SVG style block — identical palette/classes to the gold-standard docs.
const STYLE =
  "<style>.bg{fill:var(--cell-bg,#F1EFE8);stroke:var(--cell-line,#B4B2A9);stroke-width:2;}" +
  ".hi{fill:var(--hi-bg,#CECBF6);stroke:var(--hi-line,#7F77DD);stroke-width:3;}" +
  ".ok{fill:var(--ok,#1D9E75);}.no{fill:var(--no,#D85A30);}" +
  ".ink{fill:var(--color-text-primary,#2C2C2A);}.mut{fill:var(--mut,#5F5E5A);}" +
  ".big{font-size:26px;font-weight:700;}.lbl{font-size:18px;font-weight:600;}" +
  ".sub{font-size:14px;}.tag{font-size:14px;font-weight:600;}.op{font-size:24px;font-weight:700;}" +
  "text{font-family:system-ui,-apple-system,Segoe UI,sans-serif;}</style>"

function svg(vb, label, desc, inner) {
  return (
    `<svg viewBox='0 0 ${vb}' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='${label}'>` +
    `<title>${label}</title><desc>${desc}</desc>${STYLE}${inner}</svg>`
  )
}
// row helper: a labelled rounded box of math text
function row(y, text, w) {
  w = w || 500
  return (
    `<rect x='30' y='${y}' width='${w}' height='36' rx='8' class='bg'/>` +
    `<text x='${30 + w / 2}' y='${y + 25}' text-anchor='middle' class='lbl ink'>${text}</text>`
  )
}

module.exports = [
  /* ───────────── Generating Functions (6) ───────────── */
  {
    meta: { exam: 'GATE 1987', year: 1987, marks: 2, difficulty: 'medium', type: 'NAT', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Generating Functions' },
    question: 'What is the generating function G(z) for the sequence of Fibonacci numbers 0, 1, 1, 2, 3, 5, 8, ... defined by F_0 = 0, F_1 = 1 and F_n = F_{n-1} + F_{n-2}?',
    answer: 'G(z) = z/(1 - z - z^2)',
    understand: {
      plain: 'Write G(z) = sum F_n z^n. Multiply the recurrence by z^n and sum: F_n = F_{n-1} + F_{n-2} turns into a single linear equation in G(z), because a shift in the index is just a multiplication by z. Solve for G(z).',
      keywords: [
        { term: 'generating function', explain: 'a power series whose coefficients ARE the sequence', example: 'G(z) = F_0 + F_1 z + F_2 z^2 + ...' },
        { term: 'shift = multiply by z', explain: 'replacing F_n by F_{n-1} multiplies the series by z', example: 'sum F_{n-1} z^n = z G(z)' },
      ],
      visual_svg: svg('560 196', 'Fibonacci generating function', 'The recurrence becomes G(z)(1 - z - z^2) = z, so G(z) = z/(1 - z - z^2).',
        row(28, 'G(z) = sum F_n z^n') + row(74, 'G(z) - z = z G(z) + z^2 G(z)') + row(120, 'G(z)(1 - z - z^2) = z') +
        "<text x='280' y='184' text-anchor='middle' class='tag ink'>G(z) = z/(1 - z - z^2)</text>"),
      visual_alt: 'Multiplying the Fibonacci recurrence by z^n and summing gives G(z)(1 - z - z^2) = z, so G(z) = z/(1 - z - z^2).',
    },
    given: {
      aim: 'Find a closed-form generating function for the Fibonacci numbers.',
      terms: [
        { term: 'G(z)', meaning: 'the generating function', example: 'sum_{n>=0} F_n z^n', connects: 'the object we solve for' },
        { term: 'recurrence', meaning: 'F_n = F_{n-1} + F_{n-2}', example: 'F_2 = F_1 + F_0', connects: 'becomes 1 - z - z^2 in the denominator' },
        { term: 'initial terms', meaning: 'F_0 = 0, F_1 = 1', example: 'fix the numerator', connects: 'give the numerator z' },
      ],
      plan: 'Define G(z) as the power series, multiply the recurrence by z^n and sum, replace the shifted sums by z G(z) and z^2 G(z), then solve the resulting linear equation for G(z).',
    },
    to_find: 'The closed-form generating function G(z).',
    solution: {
      steps: [
        { step: 1, title: 'Set up the generating function', formula_id: 'gen-func-definition', formula_raw: 'G(z) = sum_{n>=0} a_n z^n', apply: 'G(z) = sum_{n>=0} F_n z^n,  F_0 = 0, F_1 = 1', note: 'coefficients are the Fibonacci numbers' },
        { step: 2, title: 'Turn the recurrence into an equation', formula_id: 'gen-func-fibonacci', formula_raw: 'sum F_{n-1} z^n = z G(z),  sum F_{n-2} z^n = z^2 G(z)', apply: 'G(z) - z = z G(z) + z^2 G(z) -> G(z)(1 - z - z^2) = z', note: 'the F_1 z = z term is the only leftover' },
        { step: 3, title: 'Solve for G(z)', formula_id: 'gen-func-fibonacci', formula_raw: 'G(z)(1 - z - z^2) = z', apply: 'G(z) = z/(1 - z - z^2)', note: 'denominator mirrors the recurrence' },
      ],
      result: 'G(z) = z/(1 - z - z^2)',
    },
    formula_ids_used: ['gen-func-definition', 'gen-func-fibonacci'],
    formula_note: 'Standard OGF of Fibonacci: denominator 1 - z - z^2 comes from the recurrence, numerator z from F_0 = 0, F_1 = 1.',
  },
  {
    meta: { exam: 'GATE 2005', year: 2005, marks: 2, difficulty: 'easy', type: 'MCQ', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Generating Functions' },
    question: 'Let G(x) = 1/(1-x)^2 = sum_{i=0}^{inf} g(i) x^i, where |x| < 1. What is g(i)?  A. i   B. i+1   C. 2i   D. 2^i',
    answer: 'B. i+1',
    understand: {
      plain: '1/(1-x)^2 is the k = 2 case of the extended-binomial series 1/(1-x)^k = sum C(i+k-1, k-1) x^i. With k = 2 the coefficient is C(i+1, 1) = i+1.',
      keywords: [
        { term: 'extended binomial', explain: '1/(1-x)^k = sum C(i+k-1, k-1) x^i', example: 'k = 2 gives C(i+1, 1)' },
        { term: 'differentiate trick', explain: 'd/dx of 1/(1-x) gives 1/(1-x)^2', example: 'sum (i+1) x^i' },
      ],
      visual_svg: svg('560 196', 'Coefficients of 1/(1-x)^2', 'The k=2 extended binomial gives coefficient C(i+1,1) = i+1: 1, 2, 3, 4, ...',
        row(28, '1/(1-x)^2 = sum C(i+1, 1) x^i') + row(74, 'C(i+1, 1) = i+1') +
        "<text x='280' y='150' text-anchor='middle' class='tag ink'>g(0)=1, g(1)=2, g(2)=3, g(3)=4, ...</text>" +
        "<text x='280' y='180' text-anchor='middle' class='tag ok'>g(i) = i + 1  (Option B)</text>"),
      visual_alt: 'The series 1/(1-x)^2 has coefficients 1, 2, 3, 4, ..., i.e. g(i) = i+1.',
    },
    given: {
      aim: 'Find the coefficient g(i) in the expansion of 1/(1-x)^2.',
      terms: [
        { term: 'k', meaning: 'the power of 1/(1-x)', example: 'k = 2 here', connects: 'sets which binomial coefficient appears' },
        { term: 'g(i)', meaning: 'coefficient of x^i', example: 'g(0)=1, g(1)=2, g(2)=3', connects: 'the answer i+1' },
        { term: 'C(i+1, 1)', meaning: 'the extended-binomial coefficient', example: '= i+1', connects: 'matches option B' },
      ],
      plan: 'Recognise 1/(1-x)^2 as the k = 2 extended-binomial series, read off the coefficient C(i+k-1, k-1) = C(i+1, 1), and simplify to i+1.',
    },
    to_find: 'The coefficient g(i).',
    solution: {
      steps: [
        { step: 1, title: 'Extended-binomial series', formula_id: 'gen-func-1-minus-x-pow-k', formula_raw: '1/(1-x)^k = sum C(i+k-1, k-1) x^i', apply: 'k = 2: 1/(1-x)^2 = sum C(i+1, 1) x^i', note: 'k - 1 = 1' },
        { step: 2, title: 'Simplify the coefficient', formula_id: 'r-combination-no-rep', formula_raw: 'C(i+1, 1) = (i+1)!/(1! i!) = i+1', apply: 'g(i) = i + 1', note: 'matches option B' },
      ],
      result: 'g(i) = i + 1  (Option B)',
    },
    formula_ids_used: ['gen-func-1-minus-x-pow-k', 'r-combination-no-rep'],
    formula_note: '1/(1-x)^k has coefficients C(i+k-1, k-1); for k = 2 that is i+1.',
  },
  {
    meta: { exam: 'GATE 2016', year: 2016, marks: 2, difficulty: 'medium', type: 'NAT', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Generating Functions' },
    question: 'The coefficient of x^12 in (x^3 + x^4 + x^5 + x^6 + ...)^3 is ______.',
    answer: '10',
    understand: {
      plain: 'Each bracket starts at x^3, so factor x^3 out of every one: (x^3(1 + x + x^2 + ...))^3 = x^9/(1-x)^3. The coefficient of x^12 there equals the coefficient of x^3 in 1/(1-x)^3, which is C(5, 2) = 10.',
      keywords: [
        { term: 'factor the lowest power', explain: 'each bracket starts at x^3, so pull out x^3', example: 'x^3 + x^4 + ... = x^3/(1-x)' },
        { term: 'index shift', explain: 'x^9 * series shifts which coefficient you read', example: 'x^12 in x^9 S = x^3 in S' },
      ],
      visual_svg: svg('560 196', 'Coefficient extraction by factoring', 'Pull x^9 out of the cube to get x^9/(1-x)^3; the coefficient of x^3 in 1/(1-x)^3 is C(5,2)=10.',
        row(28, '(x^3 + x^4 + ...)^3 = x^9/(1-x)^3') + row(74, '[x^12] x^9 S(x) = [x^3] 1/(1-x)^3') +
        "<text x='280' y='150' text-anchor='middle' class='tag ink'>[x^3] 1/(1-x)^3 = C(3+2, 2) = C(5, 2)</text>" +
        "<text x='280' y='180' text-anchor='middle' class='tag ok'>= 10</text>"),
      visual_alt: 'Factoring x^9 from the cube turns the problem into the coefficient of x^3 in 1/(1-x)^3, which is C(5,2) = 10.',
    },
    given: {
      aim: 'Find the coefficient of x^12 in the cube of x^3 + x^4 + x^5 + ...',
      terms: [
        { term: 'each factor', meaning: 'x^3 + x^4 + ... = x^3/(1-x)', example: 'geometric series from x^3', connects: 'cube gives x^9/(1-x)^3' },
        { term: 'x^9', meaning: 'pulled-out power', example: 'shifts the target to x^3', connects: 'read [x^3] 1/(1-x)^3' },
        { term: '1/(1-x)^3', meaning: 'k = 3 extended binomial', example: 'coeff of x^3 = C(5, 2)', connects: 'the count 10' },
      ],
      plan: 'Rewrite each bracket as x^3/(1-x), cube it to x^9/(1-x)^3, shift the target from x^12 to x^3, then read the coefficient C(3+3-1, 3-1) = C(5, 2) = 10.',
    },
    to_find: 'The coefficient of x^12.',
    solution: {
      steps: [
        { step: 1, title: 'Factor out the lowest power', formula_id: 'gen-func-geometric', formula_raw: 'x^3 + x^4 + x^5 + ... = x^3(1 + x + x^2 + ...) = x^3/(1-x)', apply: '(x^3 + x^4 + ...)^3 = x^9/(1-x)^3', note: 'geometric series starting at x^3' },
        { step: 2, title: 'Shift the target exponent', formula_id: 'gen-func-coeff-extraction', formula_raw: '[x^12] x^9 S(x) = [x^3] S(x)', apply: 'need [x^3] of 1/(1-x)^3', note: 'x^9 absorbs 9 of the 12' },
        { step: 3, title: 'Extended-binomial coefficient', formula_id: 'gen-func-1-minus-x-pow-k', formula_raw: '[x^n] 1/(1-x)^k = C(n+k-1, k-1)', apply: 'n = 3, k = 3: C(5, 2) = 10', note: 'the answer' },
      ],
      result: '10',
    },
    formula_ids_used: ['gen-func-geometric', 'gen-func-coeff-extraction', 'gen-func-1-minus-x-pow-k'],
    formula_note: 'Pull x^3 from each bracket -> x^9/(1-x)^3; coefficient of x^3 in 1/(1-x)^3 is C(5, 2) = 10.',
  },
  {
    meta: { exam: 'GATE 2017', year: 2017, marks: 2, difficulty: 'medium', type: 'NAT', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Generating Functions' },
    question: 'If the ordinary generating function of a sequence {a_n}_{n>=0} is (1 + z)/(1 - z)^3, then a_3 - a_0 is equal to ______.',
    answer: '15',
    understand: {
      plain: '1/(1-z)^3 has coefficients b_n = C(n+2, 2). Multiplying by (1 + z) adds the series to its shift-by-one, so a_n = b_n + b_{n-1}. Compute a_0 = 1 and a_3 = b_3 + b_2 = 10 + 6 = 16; the difference is 15.',
      keywords: [
        { term: '1/(1-z)^3', explain: 'coefficients C(n+2, 2)', example: '1, 3, 6, 10, ...' },
        { term: 'multiply by (1+z)', explain: 'adds the series and its shift-by-1', example: 'a_n = b_n + b_{n-1}' },
      ],
      visual_svg: svg('560 196', 'Coefficients of (1+z)/(1-z)^3', 'b_n = C(n+2,2) gives 1,3,6,10; the (1+z) factor makes a_n = b_n + b_{n-1}, so a_3 - a_0 = 16 - 1 = 15.',
        row(28, 'b_n = [z^n] 1/(1-z)^3 = C(n+2, 2)') + row(74, 'a_n = b_n + b_{n-1}   (from the 1+z factor)') +
        "<text x='280' y='150' text-anchor='middle' class='tag ink'>a_0 = 1,  a_3 = 10 + 6 = 16</text>" +
        "<text x='280' y='180' text-anchor='middle' class='tag ok'>a_3 - a_0 = 16 - 1 = 15</text>"),
      visual_alt: 'With b_n = C(n+2,2) = 1,3,6,10,... the factor (1+z) gives a_n = b_n + b_{n-1}; a_3 - a_0 = 16 - 1 = 15.',
    },
    given: {
      aim: 'Find a_3 - a_0 for the sequence whose OGF is (1+z)/(1-z)^3.',
      terms: [
        { term: 'b_n', meaning: 'coeff of 1/(1-z)^3 = C(n+2, 2)', example: 'b_0 = 1, b_3 = 10', connects: 'the base sequence' },
        { term: '(1+z) factor', meaning: 'a_n = b_n + b_{n-1}', example: 'a_3 = b_3 + b_2', connects: 'adds a shifted copy' },
        { term: 'a_3 - a_0', meaning: 'the quantity asked', example: '16 - 1', connects: 'the answer 15' },
      ],
      plan: 'Read b_n = C(n+2, 2) from 1/(1-z)^3, apply the (1+z) factor as a_n = b_n + b_{n-1}, compute a_0 and a_3, then subtract.',
    },
    to_find: 'The value of a_3 - a_0.',
    solution: {
      steps: [
        { step: 1, title: 'Coefficients of 1/(1-z)^3', formula_id: 'gen-func-1-minus-x-pow-k', formula_raw: '[z^n] 1/(1-z)^3 = C(n+2, 2)', apply: 'b_0 = C(2,2) = 1, b_2 = C(4,2) = 6, b_3 = C(5,2) = 10', note: 'k = 3 -> C(n+2, 2)' },
        { step: 2, title: 'Apply the (1+z) factor and subtract', formula_id: 'gen-func-coeff-extraction', formula_raw: 'a_n = [z^n](1+z) S(z) = b_n + b_{n-1}', apply: 'a_0 = b_0 = 1; a_3 = b_3 + b_2 = 16; a_3 - a_0 = 16 - 1 = 15', note: 'b_{-1} = 0' },
      ],
      result: '15',
    },
    formula_ids_used: ['gen-func-1-minus-x-pow-k', 'gen-func-coeff-extraction'],
    formula_note: 'Coeffs of 1/(1-z)^3 are C(n+2,2); the (1+z) factor gives a_n = C(n+2,2) + C(n+1,2); a_3 - a_0 = 16 - 1 = 15.',
  },
  {
    meta: { exam: 'GATE 2018', year: 2018, marks: 1, difficulty: 'medium', type: 'MCQ', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Generating Functions' },
    question: 'Which one of the following is a closed-form expression for the generating function of the sequence {a_n}, where a_n = 2n + 3 for all n = 0, 1, 2, ...?  A. 3/(1-x)^2   B. 3x/(1-x)^2   C. (2-x)/(1-x)^2   D. (3-x)/(1-x)^2',
    answer: 'D. (3 - x)/(1 - x)^2',
    understand: {
      plain: 'Split a_n = 2n + 3 into a linear part 2n and a constant 3. Use sum n x^n = x/(1-x)^2 and sum x^n = 1/(1-x). Adding and combining over the common denominator (1-x)^2 gives (3 - x)/(1-x)^2.',
      keywords: [
        { term: 'linearity', explain: 'GF of (2n+3) = 2 GF(n) + 3 GF(1)', example: 'split the sequence' },
        { term: 'sum n x^n', explain: '= x/(1-x)^2', example: 'the arithmetic part' },
      ],
      visual_svg: svg('560 196', 'Generating function of 2n+3', 'Split into 2 sum n x^n + 3 sum x^n = 2x/(1-x)^2 + 3/(1-x) = (3-x)/(1-x)^2.',
        row(28, 'G(x) = 2 sum n x^n + 3 sum x^n') + row(74, '= 2x/(1-x)^2 + 3/(1-x)') +
        "<text x='280' y='150' text-anchor='middle' class='tag ink'>= (2x + 3(1-x))/(1-x)^2</text>" +
        "<text x='280' y='180' text-anchor='middle' class='tag ok'>= (3 - x)/(1-x)^2  (Option D)</text>"),
      visual_alt: 'Splitting 2n+3 by linearity gives 2x/(1-x)^2 + 3/(1-x), which combines to (3-x)/(1-x)^2.',
    },
    given: {
      aim: 'Find the closed-form generating function of a_n = 2n + 3.',
      terms: [
        { term: '3 sum x^n', meaning: 'the constant part', example: '3/(1-x)', connects: 'first piece' },
        { term: '2 sum n x^n', meaning: 'the linear part', example: '2x/(1-x)^2', connects: 'second piece' },
        { term: 'common denominator', meaning: '(1-x)^2', example: 'combine the two pieces', connects: 'gives (3-x)/(1-x)^2' },
      ],
      plan: 'Write G = 2 sum n x^n + 3 sum x^n = 2x/(1-x)^2 + 3/(1-x), put both over (1-x)^2, and simplify the numerator to 3 - x.',
    },
    to_find: 'The closed-form generating function.',
    solution: {
      steps: [
        { step: 1, title: 'Split by linearity', formula_id: 'gen-func-geometric', formula_raw: 'sum (2n+3) x^n = 2 sum n x^n + 3 sum x^n', apply: 'G(x) = 2 sum n x^n + 3/(1-x)', note: '3/(1-x) is the constant part' },
        { step: 2, title: 'Insert the linear series and combine', formula_id: 'gen-func-n-x-n', formula_raw: 'sum n x^n = x/(1-x)^2', apply: 'G(x) = 2x/(1-x)^2 + 3(1-x)/(1-x)^2 = (2x + 3 - 3x)/(1-x)^2 = (3 - x)/(1-x)^2', note: 'matches option D' },
      ],
      result: '(3 - x)/(1-x)^2  (Option D)',
    },
    formula_ids_used: ['gen-func-geometric', 'gen-func-n-x-n'],
    formula_note: 'Linearity: GF(2n+3) = 2 x/(1-x)^2 + 3/(1-x) = (3 - x)/(1-x)^2.',
  },
  {
    meta: { exam: 'GATE 2022', year: 2022, marks: 2, difficulty: 'hard', type: 'MCQ', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Generating Functions' },
    question: 'Which one of the following is the closed form for the generating function of the sequence {a_n}_{n>=0} defined below?  a_n = n + 1 if n is odd, and a_n = 1 otherwise.  A. x(1+x^2)/(1-x^2)^2 + 1/(1-x)   B. x(3-x^2)/(1-x^2)^2 + 1/(1-x)   C. x(1+x^2)/(1-x^2)^2 + 1/(1-x^2)   D. x(3-x^2)/(1-x^2)^2 + 1/(1-x^2)',
    answer: 'A. x(1+x^2)/(1-x^2)^2 + 1/(1-x)',
    understand: {
      plain: 'Every term is at least 1, and for odd n there is an extra n (since n+1 = 1 + n). So G(x) = sum 1*x^n + sum_{n odd} n x^n. The baseline is 1/(1-x); the odd-weighted sum, after substituting y = x^2, equals x(1+x^2)/(1-x^2)^2.',
      keywords: [
        { term: 'baseline 1', explain: 'every term is at least 1', example: 'sum x^n = 1/(1-x)' },
        { term: 'odd-only weighted sum', explain: 'sum_{k>=0} (2k+1) x^{2k+1}', example: 'x + 3x^3 + 5x^5 + ...' },
      ],
      visual_svg: svg('560 220', 'Generating function of a split sequence', 'a_n = 1 + n on odd indices; baseline 1/(1-x) plus odd part x(1+x^2)/(1-x^2)^2.',
        row(28, 'a_n = 1 + n * [n is odd]') + row(74, 'baseline: sum x^n = 1/(1-x)') + row(120, 'odd part: sum (2k+1) x^{2k+1}, y = x^2') +
        "<text x='280' y='178' text-anchor='middle' class='tag ink'>odd part = x(1+x^2)/(1-x^2)^2</text>" +
        "<text x='280' y='206' text-anchor='middle' class='tag ok'>G(x) = x(1+x^2)/(1-x^2)^2 + 1/(1-x)  (A)</text>"),
      visual_alt: 'Decomposing a_n into a baseline 1 plus n on odd indices gives 1/(1-x) plus x(1+x^2)/(1-x^2)^2.',
    },
    given: {
      aim: 'Find the closed-form generating function of the split sequence a_n.',
      terms: [
        { term: 'split a_n', meaning: 'a_n = 1 + n*[n odd]', example: 'a_3 = 1 + 3 = 4', connects: 'two separate sums' },
        { term: 'baseline', meaning: 'sum x^n = 1/(1-x)', example: 'the +1 in every term', connects: 'second piece of the answer' },
        { term: 'odd sum', meaning: 'sum_k (2k+1) x^{2k+1}', example: '= x(1+x^2)/(1-x^2)^2', connects: 'first piece of the answer' },
      ],
      plan: 'Decompose a_n into a constant 1 plus n on odd indices; sum the constant as 1/(1-x); sum the odd part with y = x^2 to get x(1+x^2)/(1-x^2)^2; add the two pieces.',
    },
    to_find: 'The closed-form generating function.',
    solution: {
      steps: [
        { step: 1, title: 'Decompose the sequence', formula_id: 'gen-func-geometric', formula_raw: 'a_n = 1 + n*[n odd];  sum 1*x^n = 1/(1-x)', apply: 'G(x) = 1/(1-x) + sum_{n odd} n x^n', note: 'even terms contribute only the baseline 1' },
        { step: 2, title: 'Sum the odd-weighted part', formula_id: 'gen-func-n-x-n', formula_raw: 'sum_{k>=0} (2k+1) y^k = (1+y)/(1-y)^2', apply: 'with y = x^2 and an extra factor x: sum_{n odd} n x^n = x(1+x^2)/(1-x^2)^2', note: 'factor x out of the odd powers, set y = x^2' },
        { step: 3, title: 'Add the two pieces', formula_id: 'gen-func-geometric', formula_raw: 'G(x) = (odd part) + 1/(1-x)', apply: 'G(x) = x(1+x^2)/(1-x^2)^2 + 1/(1-x)', note: 'matches option A' },
      ],
      result: 'x(1+x^2)/(1-x^2)^2 + 1/(1-x)  (Option A)',
    },
    formula_ids_used: ['gen-func-geometric', 'gen-func-n-x-n'],
    formula_note: 'Baseline 1 -> 1/(1-x); odd part sum(2k+1)x^{2k+1} = x(1+x^2)/(1-x^2)^2 via y = x^2.',
  },

  /* ───────────── Recurrence Relation (7) ───────────── */
  {
    meta: { exam: 'GATE 1996', year: 1996, marks: 2, difficulty: 'medium', type: 'NAT', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Recurrence Relation' },
    question: 'The Fibonacci sequence {f_1, f_2, f_3, ...} is defined by f_{n+2} = f_{n+1} + f_n for n >= 1, with f_1 = 1 and f_2 = 1. Prove by induction that every third element of the sequence (f_3, f_6, f_9, ...) is even.',
    answer: 'f_{3k} is even for every k >= 1 (the parities repeat as odd, odd, even with period 3).',
    understand: {
      plain: 'List the parities: f_1, f_2 are odd; f_3 = odd + odd = even; f_4 = odd + even = odd; f_5 = even + odd = odd; f_6 = odd + odd = even. The block odd, odd, even repeats every 3 terms. Prove the even position f_{3k} stays even by induction on k.',
      keywords: [
        { term: 'parity', explain: 'whether a number is odd or even', example: 'odd + odd = even' },
        { term: 'induction on k', explain: 'prove f_{3k} even assuming f_{3(k-1)} even', example: 'base f_3 = 2' },
      ],
      visual_svg: svg('560 196', 'Fibonacci parity pattern', 'Parities of f_1..f_9 are O O E O O E O O E; every third term f_3, f_6, f_9 is even.',
        "<text x='280' y='44' text-anchor='middle' class='tag mut'>parity of f_1, f_2, ..., f_9</text>" +
        [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i, idx) => {
          const x = 40 + idx * 56
          const even = i % 3 === 0
          return `<rect x='${x}' y='64' width='44' height='44' rx='8' class='${even ? 'hi' : 'bg'}'/>` +
            `<text x='${x + 22}' y='92' text-anchor='middle' class='lbl ink'>${even ? 'E' : 'O'}</text>` +
            `<text x='${x + 22}' y='128' text-anchor='middle' class='sub mut'>f${i}</text>`
        }).join('') +
        "<text x='280' y='172' text-anchor='middle' class='tag ok'>f_3 = 2, f_6 = 8, f_9 = 34 are even</text>"),
      visual_alt: 'The parities of the Fibonacci numbers cycle as odd, odd, even, so every third term (f_3, f_6, f_9, ...) is even.',
    },
    given: {
      aim: 'Prove that f_{3k} is even for all k >= 1.',
      terms: [
        { term: 'recurrence', meaning: 'f_{n+2} = f_{n+1} + f_n', example: 'f_3 = f_2 + f_1', connects: 'drives the parity pattern' },
        { term: 'base case', meaning: 'f_3 = 2 is even', example: 'k = 1', connects: 'starts the induction' },
        { term: 'inductive step', meaning: 'f_{3k+3} = 2 f_{3k+1} + f_{3k}', example: 'even + even', connects: 'keeps f_{3k} even' },
      ],
      plan: 'Establish the parity pattern from the recurrence; prove by induction that f_{3k} is even — base f_3 = 2, step expresses f_{3(k+1)} as 2 f_{3k+1} + f_{3k}, which is even because f_{3k} is even by hypothesis.',
    },
    to_find: 'A proof that f_{3k} is even for all k >= 1.',
    solution: {
      steps: [
        { step: 1, title: 'Base case', formula_id: 'fibonacci-recurrence', formula_raw: 'f_{n+2} = f_{n+1} + f_n', apply: 'f_3 = f_2 + f_1 = 1 + 1 = 2, which is even', note: 'k = 1 holds' },
        { step: 2, title: 'Inductive step: expand two levels', formula_id: 'fibonacci-recurrence', formula_raw: 'f_{3k+3} = f_{3k+2} + f_{3k+1},  f_{3k+2} = f_{3k+1} + f_{3k}', apply: 'f_{3k+3} = (f_{3k+1} + f_{3k}) + f_{3k+1} = 2 f_{3k+1} + f_{3k}', note: 'substitute the inner recurrence' },
        { step: 3, title: 'Conclude parity', formula_id: 'fibonacci-recurrence', formula_raw: 'even + even = even', apply: '2 f_{3k+1} is even; f_{3k} is even by hypothesis -> f_{3k+3} is even', note: 'induction completes: every f_{3k} is even' },
      ],
      result: 'Every third Fibonacci number f_{3k} is even (proved by induction).',
    },
    formula_ids_used: ['fibonacci-recurrence'],
    formula_note: 'Induction using f_{3k+3} = 2 f_{3k+1} + f_{3k}; base case f_3 = 2.',
  },
  {
    meta: { exam: 'GATE 2016', year: 2016, marks: 1, difficulty: 'easy', type: 'MCQ', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Recurrence Relation' },
    question: 'Let a_n be the number of bit strings of length n that do NOT contain two consecutive 1s. Which one of the following is the correct recurrence relation for a_n?  A. a_n = a_{n-1} + 2 a_{n-2}   B. a_n = a_{n-1} + a_{n-2}   C. a_n = 2 a_{n-1} + a_{n-2}   D. a_n = 2 a_{n-1} + 2 a_{n-2}',
    answer: 'B. a_n = a_{n-1} + a_{n-2}',
    understand: {
      plain: 'Classify a valid string by its last bit. If it ends in 0, the first n-1 bits are any valid string: a_{n-1} of them. If it ends in 1, the bit before it must be 0 (otherwise two 1s), so it ends in 01 and the first n-2 bits are any valid string: a_{n-2}. Add the two cases.',
      keywords: [
        { term: 'condition on the last bit', explain: 'split valid strings by ending in 0 or 1', example: '...0 vs ...01' },
        { term: 'Fibonacci recurrence', explain: 'a_n = a_{n-1} + a_{n-2}', example: 'same shape as Fibonacci' },
      ],
      visual_svg: svg('560 200', 'Strings with no two consecutive 1s', 'A valid string ends in 0 (a_{n-1} ways) or 01 (a_{n-2} ways), giving a_n = a_{n-1} + a_{n-2}.',
        "<rect x='200' y='28' width='160' height='40' rx='8' class='hi'/><text x='280' y='54' text-anchor='middle' class='lbl ink'>valid string, length n</text>" +
        "<rect x='70' y='110' width='180' height='40' rx='8' class='bg'/><text x='160' y='136' text-anchor='middle' class='lbl ink'>ends in 0 : a_{n-1}</text>" +
        "<rect x='310' y='110' width='180' height='40' rx='8' class='bg'/><text x='400' y='136' text-anchor='middle' class='lbl ink'>ends in 01 : a_{n-2}</text>" +
        "<line x1='280' y1='68' x2='160' y2='110' class='mut' stroke='#5F5E5A' stroke-width='2'/>" +
        "<line x1='280' y1='68' x2='400' y2='110' class='mut' stroke='#5F5E5A' stroke-width='2'/>" +
        "<text x='280' y='186' text-anchor='middle' class='tag ok'>a_n = a_{n-1} + a_{n-2}  (Option B)</text>"),
      visual_alt: 'Valid strings split into those ending in 0 (a_{n-1}) and those ending in 01 (a_{n-2}), giving a_n = a_{n-1} + a_{n-2}.',
    },
    given: {
      aim: 'Find the recurrence relation for the count of length-n strings with no two consecutive 1s.',
      terms: [
        { term: 'ends in 0', meaning: 'free valid prefix of length n-1', example: 'a_{n-1} strings', connects: 'first term' },
        { term: 'ends in 1', meaning: 'must be ...01', example: 'a_{n-2} strings', connects: 'second term' },
        { term: 'no-11 constraint', meaning: 'a 1 forces a preceding 0', example: '...01', connects: 'why the prefix shrinks by 2' },
      ],
      plan: 'Partition valid length-n strings by their last bit; count each case as a smaller valid string (a_{n-1} for ending 0, a_{n-2} for ending 01); add them by the sum rule.',
    },
    to_find: 'The recurrence relation for a_n.',
    solution: {
      steps: [
        { step: 1, title: 'Case: string ends in 0', formula_id: 'fibonacci-recurrence', formula_raw: 'valid(...0) <-> valid string of length n-1', apply: 'count = a_{n-1}', note: 'any valid prefix works' },
        { step: 2, title: 'Case: string ends in 1', formula_id: 'fibonacci-recurrence', formula_raw: 'no 11 -> the last 1 follows a 0, so the string ends in 01', apply: 'count = a_{n-2}', note: 'first n-2 bits are any valid string' },
        { step: 3, title: 'Combine by the sum rule', formula_id: 'sum-rule', formula_raw: 'a_n = (ends in 0) + (ends in 1)', apply: 'a_n = a_{n-1} + a_{n-2}', note: 'Fibonacci recurrence -> option B' },
      ],
      result: 'a_n = a_{n-1} + a_{n-2}  (Option B)',
    },
    formula_ids_used: ['fibonacci-recurrence', 'sum-rule'],
    formula_note: 'Condition on the last bit: ...0 gives a_{n-1}, ...01 gives a_{n-2}; the sum is the Fibonacci recurrence.',
  },
  {
    meta: { exam: 'GATE 2016', year: 2016, marks: 2, difficulty: 'medium', type: 'NAT', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Recurrence Relation' },
    question: 'Consider the recurrence relation a_1 = 8, a_n = 6 n^2 + 2 n + a_{n-1} for n >= 2. Let a_99 = K * 10^4. The value of K is ______.',
    answer: '198',
    understand: {
      plain: 'Each step adds 6n^2 + 2n to the previous term. Unfolding gives a_n = sum_{j=1}^{n} (6 j^2 + 2 j), since a_1 = 8 already equals 6(1)^2 + 2(1). Apply the sum-of-squares and sum-of-integers formulas; everything collapses to a_n = 2 n (n+1)^2.',
      keywords: [
        { term: 'unfolding', explain: 'a_n = a_1 + sum of the amounts added each step', example: 'a_n = sum (6j^2 + 2j)' },
        { term: 'closed form', explain: 'a_n = 2 n (n+1)^2', example: 'a_99 = 2 * 99 * 100^2' },
      ],
      visual_svg: svg('560 200', 'Unfolding a recurrence to a sum', 'a_n = sum(6j^2+2j) = 2n(n+1)^2; at n=99 this is 1,980,000 = 198 x 10^4.',
        row(28, 'a_n = sum_{j=1}^{n} (6 j^2 + 2 j)') + row(74, '= 6 * n(n+1)(2n+1)/6 + 2 * n(n+1)/2') + row(120, '= n(n+1)(2n+1) + n(n+1) = 2 n (n+1)^2') +
        "<text x='280' y='186' text-anchor='middle' class='tag ok'>a_99 = 2*99*100^2 = 1,980,000 = 198 x 10^4</text>"),
      visual_alt: 'Unfolding the recurrence into a summation and applying standard sum formulas yields a_n = 2n(n+1)^2, so a_99 = 198 x 10^4 and K = 198.',
    },
    given: {
      aim: 'Find K, where a_99 = K * 10^4.',
      terms: [
        { term: 'added term', meaning: '6 n^2 + 2 n at step n', example: 'matches a_1 = 8 at n = 1', connects: 'sum starts at j = 1' },
        { term: 'sum of squares', meaning: 'sum j^2 = n(n+1)(2n+1)/6', example: 'the factor 6 cancels', connects: 'first piece' },
        { term: 'closed form', meaning: 'a_n = 2 n (n+1)^2', example: 'a_99 = 1,980,000', connects: 'K = 198' },
      ],
      plan: 'Unfold the recurrence into sum_{j=1}^{n} (6 j^2 + 2 j); apply the sum-of-squares and sum-of-first-n formulas; simplify to 2 n (n+1)^2; evaluate at n = 99 and read K.',
    },
    to_find: 'The value of K where a_99 = K * 10^4.',
    solution: {
      steps: [
        { step: 1, title: 'Unfold into a summation', formula_id: 'recurrence-unfolding', formula_raw: 'a_n = a_0 + sum_{j=1}^{n} g(j)', apply: 'a_n = sum_{j=1}^{n} (6 j^2 + 2 j)', note: 'a_1 = 8 = 6(1)^2 + 2(1), so the sum starts at j = 1' },
        { step: 2, title: 'Apply the summation formulas', formula_id: 'sum-of-squares', formula_raw: 'sum j^2 = n(n+1)(2n+1)/6,  sum j = n(n+1)/2', apply: 'a_n = 6 * n(n+1)(2n+1)/6 + 2 * n(n+1)/2 = n(n+1)(2n+1) + n(n+1)', note: 'the 6 and 2 cancel the denominators' },
        { step: 3, title: 'Simplify and evaluate', formula_id: 'sum-first-n', formula_raw: 'a_n = n(n+1)(2n+2) = 2 n (n+1)^2', apply: 'a_99 = 2 * 99 * 100^2 = 1,980,000 = 198 * 10^4 -> K = 198', note: 'factor 2n+1+1 = 2(n+1)' },
      ],
      result: 'K = 198',
    },
    formula_ids_used: ['recurrence-unfolding', 'sum-of-squares', 'sum-first-n'],
    formula_note: 'Unfold to sum(6 j^2 + 2 j) = 2 n (n+1)^2; at n = 99 this is 1.98 x 10^6 = 198 x 10^4.',
  },
  {
    meta: { exam: 'GATE 2022', year: 2022, marks: 2, difficulty: 'hard', type: 'MSQ', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Recurrence Relation' },
    question: 'Consider the recurrence relation f(1) = 1; f(2n) = 2 f(n) - 1 for n >= 1; f(2n+1) = 2 f(n) + 1 for n >= 1. Which of the following statement(s) is/are TRUE?  A. f(2^n - 1) = 2^n - 1   B. f(2^n) = 1   C. f(5 * 2^n) = 2^{n+1} + 1   D. f(2^n + 1) = 2^n + 1',
    answer: 'A, B and C',
    understand: {
      plain: 'The rule depends on the last binary digit of the argument: even -> 2 f(n) - 1, odd -> 2 f(n) + 1. Compute small values to see the pattern, then verify each claim by unfolding. A, B and C hold; D fails at n = 2 because f(5) = 3, not 5.',
      keywords: [
        { term: 'binary recurrence', explain: 'the rule depends on whether the argument is even or odd', example: 'even -> 2f(n)-1, odd -> 2f(n)+1' },
        { term: 'check by small cases', explain: 'compute f(1..10) to test each option', example: 'f(5) = 3 kills D' },
      ],
      visual_svg: svg('560 200', 'Small values of f', 'f(1..8) = 1,1,3,1,3,5,7,1; this disproves D (f(5)=3) and confirms A,B,C.',
        "<text x='280' y='44' text-anchor='middle' class='tag mut'>f(n) for n = 1..8</text>" +
        [1, 2, 3, 4, 5, 6, 7, 8].map((n, idx) => {
          const vals = { 1: 1, 2: 1, 3: 3, 4: 1, 5: 3, 6: 5, 7: 7, 8: 1 }
          const x = 40 + idx * 64
          return `<rect x='${x}' y='64' width='52' height='52' rx='8' class='bg'/>` +
            `<text x='${x + 26}' y='96' text-anchor='middle' class='lbl ink'>${vals[n]}</text>` +
            `<text x='${x + 26}' y='134' text-anchor='middle' class='sub mut'>n=${n}</text>`
        }).join('') +
        "<text x='280' y='180' text-anchor='middle' class='tag ok'>f(2^n)=1, f(2^n-1)=2^n-1; f(5)=3 != 5 kills D</text>"),
      visual_alt: 'The first values f(1..8) = 1,1,3,1,3,5,7,1 confirm statements A, B, C and disprove D since f(5) = 3.',
    },
    given: {
      aim: 'Determine which of the four statements about f are true.',
      terms: [
        { term: 'f(2n) = 2 f(n) - 1', meaning: 'even-argument rule', example: 'f(4) = 2 f(2) - 1 = 1', connects: 'gives f(2^n) = 1' },
        { term: 'f(2n+1) = 2 f(n) + 1', meaning: 'odd-argument rule', example: 'f(3) = 2 f(1) + 1 = 3', connects: 'gives f(2^n - 1) = 2^n - 1' },
        { term: 'counterexample', meaning: 'one failing case disproves a claim', example: 'f(5) = 3 but 2^2 + 1 = 5', connects: 'option D is false' },
      ],
      plan: 'Unfold each family: f(2^n) repeatedly applies the even rule from f(1) = 1 giving 1; f(2^n - 1) (all-ones in binary) gives 2^n - 1; f(5 * 2^n) reduces to f(5) = 3 then even rule; test D at n = 2.',
    },
    to_find: 'Which of the four statements are TRUE.',
    solution: {
      steps: [
        { step: 1, title: 'B: f(2^n) = 1', formula_id: 'recurrence-unfolding', formula_raw: 'f(2n) = 2 f(n) - 1, with fixed point at 1', apply: 'f(2) = 2 f(1) - 1 = 1, f(4) = 1, ..., f(2^n) = 1', note: '1 is a fixed point of x -> 2x - 1; TRUE' },
        { step: 2, title: 'A: f(2^n - 1) = 2^n - 1', formula_id: 'recurrence-unfolding', formula_raw: 'f(2n+1) = 2 f(n) + 1 applied to all-ones binary', apply: 'f(1) = 1, f(3) = 3, f(7) = 7, ..., f(2^n - 1) = 2^n - 1', note: '2^n - 1 is 111...1 in binary; TRUE' },
        { step: 3, title: 'C: f(5 * 2^n) = 2^{n+1} + 1', formula_id: 'recurrence-unfolding', formula_raw: 'even rule repeated down to f(5)', apply: 'f(5) = 3, f(10) = 5, f(20) = 9, ...: f(5 * 2^n) = 2^{n+1} + 1', note: 'n=0->3, n=1->5, n=2->9; TRUE' },
        { step: 4, title: 'D: f(2^n + 1) = 2^n + 1 ?', formula_id: 'recurrence-unfolding', formula_raw: 'test the claim at a small n', apply: 'n = 2: f(5) = 3 but 2^2 + 1 = 5; 3 != 5 -> FALSE', note: 'one counterexample disproves D' },
      ],
      result: 'Statements A, B and C are TRUE; D is FALSE.',
    },
    formula_ids_used: ['recurrence-unfolding'],
    formula_note: 'Unfold each family from f(1) = 1; D fails at n = 2 since f(5) = 3, not 5.',
  },
  {
    meta: { exam: 'GATE 2023', year: 2023, marks: 1, difficulty: 'medium', type: 'MCQ', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Recurrence Relation' },
    question: 'The Lucas sequence L_n is defined by the recurrence L_n = L_{n-1} + L_{n-2} for n >= 3, with L_1 = 1 and L_2 = 3. Which one of the following is TRUE?  A. L_n = ((1+sqrt5)/2)^n + ((1-sqrt5)/2)^n   B. L_n = ((1+sqrt5)/2)^n - ((1-sqrt5)/2)^n   C. L_n = ((1+sqrt5)/2)^n   D. L_n = ((1+sqrt5)/2)^{n+1} + ((1-sqrt5)/2)^{n+1}',
    answer: 'A. L_n = ((1+sqrt5)/2)^n + ((1-sqrt5)/2)^n',
    understand: {
      plain: 'The recurrence L_n = L_{n-1} + L_{n-2} has characteristic equation r^2 = r + 1, with roots phi = (1+sqrt5)/2 and psi = (1-sqrt5)/2. So L_n = A phi^n + B psi^n. Fitting L_1 = 1 and L_2 = 3 gives A = B = 1, i.e. L_n = phi^n + psi^n.',
      keywords: [
        { term: 'characteristic equation', explain: 'r^2 = r + 1 for this recurrence', example: 'roots phi, psi' },
        { term: 'golden ratio', explain: 'phi = (1+sqrt5)/2', example: 'phi^2 = phi + 1' },
      ],
      visual_svg: svg('560 196', 'Lucas closed form', 'Char. eqn r^2 = r + 1 gives roots phi, psi; fitting L_1=1, L_2=3 gives L_n = phi^n + psi^n.',
        row(28, 'L_n = L_{n-1} + L_{n-2}  ->  r^2 = r + 1') + row(74, 'roots: phi = (1+sqrt5)/2,  psi = (1-sqrt5)/2') +
        "<text x='280' y='150' text-anchor='middle' class='tag ink'>L_n = A phi^n + B psi^n; L_1=1, L_2=3 -> A=B=1</text>" +
        "<text x='280' y='180' text-anchor='middle' class='tag ok'>L_n = phi^n + psi^n  (Option A)</text>"),
      visual_alt: 'The characteristic equation r^2 = r + 1 has roots phi and psi; fitting the initial conditions gives L_n = phi^n + psi^n.',
    },
    given: {
      aim: 'Find the closed form of the Lucas sequence.',
      terms: [
        { term: 'roots', meaning: 'phi = (1+sqrt5)/2, psi = (1-sqrt5)/2', example: 'of r^2 = r + 1', connects: 'building blocks of L_n' },
        { term: 'L_n = A phi^n + B psi^n', meaning: 'general solution', example: 'fit A, B from L_1, L_2', connects: 'determine the constants' },
        { term: 'L_1 = 1, L_2 = 3', meaning: 'initial conditions', example: 'give A = B = 1', connects: 'final closed form' },
      ],
      plan: 'Form the characteristic equation r^2 = r + 1, find roots phi and psi, write L_n = A phi^n + B psi^n, use L_1 = 1 and L_2 = 3 to solve A = B = 1, giving L_n = phi^n + psi^n.',
    },
    to_find: 'The closed form of L_n.',
    solution: {
      steps: [
        { step: 1, title: 'Characteristic equation', formula_id: 'linear-homog-char-eq', formula_raw: 'L_n = L_{n-1} + L_{n-2} -> r^2 = r + 1', apply: 'roots r = (1 +/- sqrt5)/2 = phi, psi', note: 'same roots as Fibonacci' },
        { step: 2, title: 'General solution + initial conditions', formula_id: 'lucas-closed-form', formula_raw: 'L_n = A phi^n + B psi^n', apply: 'L_1 = A phi + B psi = 1, L_2 = A phi^2 + B psi^2 = 3 -> A = B = 1', note: 'phi + psi = 1, phi^2 + psi^2 = 3' },
        { step: 3, title: 'Closed form', formula_id: 'lucas-closed-form', formula_raw: 'L_n = phi^n + psi^n', apply: 'L_n = ((1+sqrt5)/2)^n + ((1-sqrt5)/2)^n', note: 'Option A' },
      ],
      result: 'L_n = ((1+sqrt5)/2)^n + ((1-sqrt5)/2)^n  (Option A)',
    },
    formula_ids_used: ['linear-homog-char-eq', 'lucas-closed-form'],
    formula_note: 'Char. eqn r^2 = r + 1 -> roots phi, psi; L_1 = 1, L_2 = 3 give A = B = 1, so L_n = phi^n + psi^n.',
  },
  {
    meta: { exam: 'GATE 2004', year: 2004, marks: 2, difficulty: 'medium', type: 'MCQ', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Recurrence Relation' },
    question: 'Let H_1, H_2, H_3, ... be harmonic numbers, where H_n = sum_{k=1}^{n} 1/k. Then, for n a positive integer, sum_{j=1}^{n} H_j can be expressed as:  A. n H_{n+1} - (n+1)   B. (n+1) H_n - n   C. n H_n - n   D. (n+1) H_{n+1} - (n+1)',
    answer: 'B. (n+1) H_n - n',
    understand: {
      plain: 'Swap the order of summation. In sum_{j=1}^{n} H_j each term 1/k appears in H_k, H_{k+1}, ..., H_n, i.e. (n - k + 1) times. So the double sum becomes sum_{k=1}^{n} (n - k + 1)/k = (n+1) sum 1/k - sum 1 = (n+1) H_n - n.',
      keywords: [
        { term: 'swap summation order', explain: 'count how many H_j each 1/k appears in', example: '1/k appears n - k + 1 times' },
        { term: 'harmonic number', explain: 'H_n = 1 + 1/2 + ... + 1/n', example: 'H_2 = 1.5' },
      ],
      visual_svg: svg('560 196', 'Sum of harmonic numbers', 'Swapping order, 1/k appears (n-k+1) times, giving (n+1)H_n - n.',
        row(28, 'sum_{j=1}^{n} H_j = sum_{k=1}^{n} (1/k)(n - k + 1)') + row(74, '= (n+1) sum 1/k - sum_{k=1}^{n} 1') +
        "<text x='280' y='150' text-anchor='middle' class='tag ink'>= (n+1) H_n - n</text>" +
        "<text x='280' y='180' text-anchor='middle' class='tag ok'>check n=2: 1 + 1.5 = 2.5 = 3(1.5) - 2  (B)</text>"),
      visual_alt: 'Swapping the order of summation, each 1/k is counted (n-k+1) times, giving sum H_j = (n+1)H_n - n.',
    },
    given: {
      aim: 'Find a closed form for the running total of harmonic numbers.',
      terms: [
        { term: '1/k count', meaning: 'appears in H_k, ..., H_n', example: 'n - k + 1 times', connects: 'reorders the double sum' },
        { term: '(n+1) sum 1/k', meaning: '= (n+1) H_n', example: 'pull out n + 1', connects: 'first part of B' },
        { term: 'sum_{k=1}^{n} 1', meaning: '= n', example: 'the -k/k = -1 terms', connects: 'the -n in B' },
      ],
      plan: 'Write the double sum, swap the order so each 1/k is counted (n - k + 1) times, separate into (n+1) H_n minus a sum of 1s (= n), matching option B; verify at n = 2.',
    },
    to_find: 'A closed form for sum_{j=1}^{n} H_j.',
    solution: {
      steps: [
        { step: 1, title: 'Expand and swap order', formula_id: 'harmonic-number', formula_raw: 'sum_{j=1}^{n} H_j = sum_{j=1}^{n} sum_{k=1}^{j} 1/k = sum_{k=1}^{n} (1/k)(n - k + 1)', apply: '1/k occurs in H_k, H_{k+1}, ..., H_n -> (n - k + 1) times', note: 'reorder the double sum' },
        { step: 2, title: 'Split the sum', formula_id: 'sum-harmonic-identity', formula_raw: 'sum (n - k + 1)/k = (n+1) sum 1/k - sum 1', apply: '= (n+1) H_n - n', note: 'sum_{k=1}^{n} 1 = n' },
        { step: 3, title: 'Verify', formula_id: 'sum-harmonic-identity', formula_raw: 'check n = 2', apply: 'H_1 + H_2 = 1 + 1.5 = 2.5;  (n+1) H_n - n = 3(1.5) - 2 = 2.5', note: 'matches option B' },
      ],
      result: '(n+1) H_n - n  (Option B)',
    },
    formula_ids_used: ['harmonic-number', 'sum-harmonic-identity'],
    formula_note: 'Swap summation order: 1/k is counted (n - k + 1) times -> (n+1) H_n - n.',
  },
  {
    meta: { exam: 'GATE 2007', year: 2007, marks: 2, difficulty: 'hard', type: 'MCQ', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Recurrence Relation' },
    question: 'Consider the sequence <x_n>, n >= 0, defined by the recurrence relation x_{n+1} = c * x_n^2 - 2, where c > 0. Suppose there exists a non-empty open interval (a, b) such that for all x_0 satisfying a < x_0 < b, the sequence converges to a limit. The sequence converges to:  A. (1 + sqrt(1+8c))/(2c)   B. (1 - sqrt(1+8c))/(2c)   C. 2   D. 2/(2c - 1)',
    answer: 'B. (1 - sqrt(1+8c))/(2c)',
    understand: {
      plain: 'If the sequence converges to L, taking limits in x_{n+1} = c x_n^2 - 2 gives the fixed-point equation L = c L^2 - 2. Rearrange to c L^2 - L - 2 = 0 and solve. Two roots appear; the one the sequence actually approaches is the stable (smaller-magnitude) root, L = (1 - sqrt(1+8c))/(2c).',
      keywords: [
        { term: 'fixed point', explain: 'the limit satisfies L = f(L)', example: 'L = c L^2 - 2' },
        { term: 'stability', explain: 'a limit is attracting only if |f\'(L)| < 1', example: 'picks the smaller root' },
      ],
      visual_svg: svg('560 196', 'Fixed point of a quadratic recurrence', 'Limit solves c L^2 - L - 2 = 0; the stable root is (1 - sqrt(1+8c))/(2c).',
        row(28, 'x_n -> L  =>  L = c L^2 - 2') + row(74, 'c L^2 - L - 2 = 0') +
        "<text x='280' y='150' text-anchor='middle' class='tag ink'>L = (1 +/- sqrt(1 + 8c))/(2c)</text>" +
        "<text x='280' y='180' text-anchor='middle' class='tag ok'>stable root: (1 - sqrt(1+8c))/(2c)  (B)</text>"),
      visual_alt: 'Taking limits gives the quadratic cL^2 - L - 2 = 0; the convergent (stable) root is (1 - sqrt(1+8c))/(2c).',
    },
    given: {
      aim: 'Find the limit of the converging quadratic recurrence.',
      terms: [
        { term: 'L = c L^2 - 2', meaning: 'fixed-point equation', example: 'from taking n -> inf', connects: 'a quadratic in L' },
        { term: 'c L^2 - L - 2 = 0', meaning: 'standard quadratic form', example: 'a = c, b = -1, c0 = -2', connects: 'use the quadratic formula' },
        { term: 'stable root', meaning: 'the one the sequence approaches', example: '|f\'(L)| < 1', connects: 'choose the minus sign' },
      ],
      plan: 'Take limits to get L = c L^2 - 2; rearrange to c L^2 - L - 2 = 0; solve by the quadratic formula to get L = (1 +/- sqrt(1+8c))/(2c); select the stable root (minus sign), matching option B.',
    },
    to_find: 'The limit the sequence converges to.',
    solution: {
      steps: [
        { step: 1, title: 'Fixed-point equation', formula_id: 'fixed-point-recurrence', formula_raw: 'x_n -> L => L = c L^2 - 2', apply: 'c L^2 - L - 2 = 0', note: 'take n -> infinity on both sides' },
        { step: 2, title: 'Solve the quadratic', formula_id: 'quadratic-formula', formula_raw: 'L = (-b +/- sqrt(b^2 - 4ac))/(2a)', apply: 'a = c, b = -1, c0 = -2: L = (1 +/- sqrt(1 + 8c))/(2c)', note: 'discriminant 1 + 8c' },
        { step: 3, title: 'Pick the convergent root', formula_id: 'fixed-point-recurrence', formula_raw: 'a stable fixed point has |f\'(L)| = |2 c L| < 1', apply: 'the smaller-magnitude root L = (1 - sqrt(1+8c))/(2c) is stable', note: 'Option B' },
      ],
      result: '(1 - sqrt(1+8c))/(2c)  (Option B)',
    },
    formula_ids_used: ['fixed-point-recurrence', 'quadratic-formula'],
    formula_note: 'Limit solves L = c L^2 - 2; the stable root is (1 - sqrt(1+8c))/(2c).',
  },

  /* ───────────── Combinatorics (1) — the pennant ───────────── */
  {
    meta: { exam: 'GATE 2014', year: 2014, marks: 2, difficulty: 'medium', type: 'NAT', subject: 'Discrete Mathematics', topic: 'Combinatorics', subtopic: 'Combinatorics' },
    question: 'A pennant is a sequence of numbers, each number being 1 or 2. An n-pennant is a sequence of numbers that sum to n. For example, (1,1,2) is a 4-pennant; the set of all 3-pennants is {(2,1), (1,1,1), (1,2)}; the set of all 4-pennants is {(2,2), (1,1,2), (2,1,1), (1,2,1), (1,1,1,1)}. The number of 10-pennants is ______.',
    answer: '89',
    understand: {
      plain: 'Let p(n) be the number of n-pennants. The first entry is either 1 (leaving an (n-1)-pennant) or 2 (leaving an (n-2)-pennant), so p(n) = p(n-1) + p(n-2). With p(1) = 1 and p(2) = 2 this is the Fibonacci sequence; iterating gives p(10) = 89.',
      keywords: [
        { term: 'composition into 1s and 2s', explain: 'ordered sums of n using parts 1 and 2', example: '(1,2) and (2,1) are different' },
        { term: 'Fibonacci count', explain: 'p(n) = p(n-1) + p(n-2)', example: '1, 2, 3, 5, 8, ...' },
      ],
      visual_svg: svg('560 200', 'Counting pennants with a recurrence', 'p(n) = p(n-1) + p(n-2) with p(1)=1, p(2)=2 gives 1,2,3,5,8,13,21,34,55,89.',
        "<text x='280' y='44' text-anchor='middle' class='tag mut'>p(1), p(2), ..., p(10)</text>" +
        [1, 2, 3, 5, 8, 13, 21, 34, 55, 89].map((v, idx) => {
          const x = 26 + idx * 52
          const last = idx === 9
          return `<rect x='${x}' y='64' width='44' height='40' rx='7' class='${last ? 'hi' : 'bg'}'/>` +
            `<text x='${x + 22}' y='90' text-anchor='middle' class='sub ink'>${v}</text>`
        }).join('') +
        "<text x='280' y='150' text-anchor='middle' class='tag ink'>first entry 1 -> p(n-1); first entry 2 -> p(n-2)</text>" +
        "<text x='280' y='184' text-anchor='middle' class='tag ok'>p(10) = 89</text>"),
      visual_alt: 'The number of n-pennants satisfies p(n) = p(n-1) + p(n-2) with p(1)=1, p(2)=2, giving the Fibonacci values up to p(10) = 89.',
    },
    given: {
      aim: 'Count the number of 10-pennants (sequences of 1s and 2s summing to 10).',
      terms: [
        { term: 'first entry = 1', meaning: 'remaining sum is n - 1', example: 'p(n-1) pennants', connects: 'first term of the recurrence' },
        { term: 'first entry = 2', meaning: 'remaining sum is n - 2', example: 'p(n-2) pennants', connects: 'second term of the recurrence' },
        { term: 'base cases', meaning: 'p(1) = 1, p(2) = 2', example: '{(1)} and {(2),(1,1)}', connects: 'start the Fibonacci chain' },
      ],
      plan: 'Set up p(n) by conditioning on the first entry (1 or 2): p(n) = p(n-1) + p(n-2); compute the base cases p(1) = 1, p(2) = 2; iterate up to p(10) = 89.',
    },
    to_find: 'The number of 10-pennants.',
    solution: {
      steps: [
        { step: 1, title: 'Condition on the first entry', formula_id: 'fibonacci-recurrence', formula_raw: 'p(n) = p(n-1) + p(n-2)', apply: 'first entry 1 -> p(n-1) pennants; first entry 2 -> p(n-2) pennants', note: 'every pennant starts with a 1 or a 2' },
        { step: 2, title: 'Base cases', formula_id: 'fibonacci-recurrence', formula_raw: 'p(1) = 1, p(2) = 2', apply: 'p(1): {(1)};  p(2): {(2), (1,1)}', note: 'seeds for the recurrence' },
        { step: 3, title: 'Iterate up to n = 10', formula_id: 'fibonacci-recurrence', formula_raw: 'p(n) = p(n-1) + p(n-2)', apply: '3, 5, 8, 13, 21, 34, 55, 89 -> p(10) = 89', note: 'p(3) through p(10)' },
      ],
      result: '89',
    },
    formula_ids_used: ['fibonacci-recurrence'],
    formula_note: 'Compositions of n into parts {1,2} satisfy p(n) = p(n-1) + p(n-2); p(1) = 1, p(2) = 2 -> p(10) = 89.',
  },
]
