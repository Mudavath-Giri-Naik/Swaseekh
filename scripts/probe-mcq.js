const { connect, mongoose } = require('./db')
async function main() {
  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')
  // Sample a few MCQ docs
  const mcqs = await Q.find({ 'meta.type': 'MCQ' }).limit(3).toArray()
  mcqs.forEach((d, i) => {
    console.log(`\n===== MCQ SAMPLE ${i+1} (year ${d.meta?.year}, ${d.meta?.subject}) =====`)
    console.log('id:', d.id)
    console.log('keys:', Object.keys(d).join(', '))
    console.log('question:', (d.question||'').slice(0, 400))
    console.log('answer:', JSON.stringify(d.answer))
    console.log('options:', JSON.stringify(d.options))
  })
  // NAT sample
  const nat = await Q.findOne({ 'meta.type': 'NAT' })
  console.log('\n===== NAT SAMPLE =====')
  console.log('question:', (nat?.question||'').slice(0,300))
  console.log('answer:', JSON.stringify(nat?.answer))
  // distinct answer format check: how many answers look like single letter A-D or (A)
  const all = await Q.find({ 'meta.type': 'MCQ' }, { projection: { answer: 1 } }).toArray()
  let letterLike = 0, parenLike = 0, longish = 0
  for (const d of all) {
    const a = (d.answer||'').trim()
    if (/^[A-D]$/i.test(a)) letterLike++
    else if (/^\(?[A-D]\)?$/i.test(a)) parenLike++
    else if (a.length > 5) longish++
  }
  console.log(`\nMCQ answer formats — single letter: ${letterLike}, paren-letter: ${parenLike}, longer(>5 chars): ${longish}, total: ${all.length}`)
  await mongoose.disconnect()
}
main().catch(e=>{console.error(e.message);process.exit(1)})
