import { connectDB } from './lib/mongodb.ts';
import SubjectModel from './models/Subject.ts';
import QuestionModel from './models/Question.ts';

async function check() {
  await connectDB();
  const subjects = await SubjectModel.find({}).lean();
  console.log('All subjects in DB:');
  subjects.forEach(s => console.log(`_id: ${s._id}, name: ${s.name}`));

  const questions = await QuestionModel.find({}).limit(1).lean();
  console.log('\nSample question subjectId:', questions[0]?.subjectId);
  
  process.exit(0);
}

check().catch(console.error);
