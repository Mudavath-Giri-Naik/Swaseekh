import { connectDB } from './lib/mongodb';
import SubjectModel from './models/Subject';
import QuestionModel from './models/Question';

async function check() {
  await connectDB();
  const subjects = await SubjectModel.find({}).lean();
  console.log('All subjects in DB:');
  subjects.forEach(s => console.log(`_id: ${s._id}, name: ${s.name}`));

  const questions = await QuestionModel.find({}).limit(1).lean();
  console.log('\nSample question subject:', (questions[0] as any)?.meta?.subject);
  
  process.exit(0);
}

check().catch(console.error);
