import mongoose from 'mongoose';
import Subject from './models/Subject';
import Question from './models/Question';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/swaseekh');
  const subjects = await Subject.find({});
  console.log("Subjects:", subjects.map(s => s.name));
  const dm = subjects.find(s => s.name === 'Discrete Mathematics');
  if (dm) {
     const pyqs = await Question.find({ 'meta.subject': dm.name }).limit(5);
     console.log("DM PYQ Example:", JSON.stringify(pyqs[0]?.meta, null, 2));
     const dist = await Question.aggregate([
       { $match: { 'meta.subject': dm.name } },
       { $group: { _id: '$meta.difficulty', count: { $sum: 1 } } }
     ]);
     console.log("Difficulty Distribution:", dist);
     const total = await Question.countDocuments();
     const dmTotal = await Question.countDocuments({ 'meta.subject': dm.name });
     console.log(`Total PYQs: ${total}, DM PYQs: ${dmTotal}, Weightage: ${(dmTotal/total)*100}%`);
  } else {
     console.log("Discrete Mathematics subject not found");
  }
  process.exit(0);
}

run();
