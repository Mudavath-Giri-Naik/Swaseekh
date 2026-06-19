/**
 * enrichQuestion — flattens the nested question document into a
 * backwards-compatible shape so existing list/sort/route code keeps working.
 *
 * Mapping: meta.subject → subjectName, meta.subtopic → topicName,
 * meta.topic → conceptName (matching the old subject > topic > concept hierarchy).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function enrichQuestion(q: any) {
  const meta = q.meta ?? {}
  const formulaIds: string[] = Array.isArray(q.formula_ids_used)
    ? q.formula_ids_used
    : []
  const primaryFormulaId =
    Array.isArray(q.solution?.steps) && q.solution.steps.length > 0
      ? q.solution.steps[0]?.formula_id ?? null
      : formulaIds[0] ?? null

  return {
    _id: q._id,
    // Backwards-compatible flattened fields
    year: meta.year,
    marks: meta.marks,
    difficulty: meta.difficulty,
    questionType: meta.type,
    questionText: q.question ?? `Question on ${meta.topic || meta.subtopic || meta.subject || 'GATE Exam'}`,
    correctAnswer: q.answer,
    formulaId: primaryFormulaId,
    formulaIds,
    // Display-name aliases — keep the same URL hierarchy as before:
    //   subject > topic > concept  ==  meta.subject > meta.subtopic > meta.topic
    subjectName: meta.subject ?? '',
    topicName: meta.subtopic ?? '',
    conceptName: meta.topic ?? '',
  }
}
