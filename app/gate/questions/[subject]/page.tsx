import { redirect } from 'next/navigation'

// Redirect bare /gate/questions/[subject] to the main questions page
export default function SubjectQuestionsRedirect() {
  redirect('/gate/questions')
}
