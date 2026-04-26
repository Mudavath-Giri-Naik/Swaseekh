const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'swaseekh' });
  const Subject = mongoose.model('Subject', new mongoose.Schema({}, { strict: false }));
  
  const subjects = await Subject.find({});
  console.log('Total subjects:', subjects.length);
  if (subjects.length > 0) {
    console.log('First subject ID type:', typeof subjects[0]._id);
    console.log('First subject:', subjects[0]);
  }
  
  const targetId = 'sub_001';
  const specific = await Subject.findById(targetId);
  console.log('Lookup sub_001:', specific);
  
  mongoose.disconnect();
}
test();
