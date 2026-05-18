import { connectDB } from './lib/mongodb.ts';
import QuestionModel from './models/Question.ts';
import SubjectModel from './models/Subject.ts';
import TopicModel from './models/Topic.ts';
import ConceptModel from './models/Concept.ts';

async function test() {
  await connectDB();
  console.log('Connected to DB');

  try {
    const question = await QuestionModel.findOne({ _id: 'pyq_03' }).lean().exec();
    console.log('Question:', question);

    const q = question as any;

    const subject = await SubjectModel.findOne({ _id: q.subjectId }).lean().exec();
    console.log('Subject:', subject);

    const topic = await TopicModel.findOne({ _id: q.topicId }).lean().exec();
    console.log('Topic:', topic);

    const concept = await ConceptModel.findOne({ _id: q.conceptId }).select('_id title').lean().exec();
    console.log('Concept:', concept);
  } catch (e) {
    console.error('Error:', e);
  }
}

test().catch(console.error);
