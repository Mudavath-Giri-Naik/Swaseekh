fetch('http://localhost:3000/api/questions')
  .then(res => res.json())
  .then(data => {
    const q = data.questions[0];
    console.log('subjectId:', q.subjectId);
    console.log('subjectName:', q.subjectName);
    console.log('topicId:', q.topicId);
    console.log('topicName:', q.topicName);
  })
  .catch(console.error);
