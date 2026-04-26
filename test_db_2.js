const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'swaseekh' });
  const Subject = mongoose.model('Subject', new mongoose.Schema({}, { strict: false }));
  
  const subjects = await Subject.find({});
  console.log('Total subjects:', subjects.length);
  if (subjects.length > 0) {
    console.log('First subject ID:', subjects[0]._id);
  }
  
  mongoose.disconnect();
}
test();
