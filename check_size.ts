import { connectDB } from './lib/mongodb';
import QuestionModel from './models/Question';

async function run() {
  await connectDB();
  console.time('fetch');
  const docs = await QuestionModel.find()
    .select('_id meta question')
    .lean()
    .limit(10);
  console.timeEnd('fetch');
  console.log('10 docs size bytes:', JSON.stringify(docs).length);
  process.exit(0);
}

run();
