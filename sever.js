const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Utility function to shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// API endpoint to get quiz questions
app.get('/api/questions', (req, res) => {
  const questionsPath = path.join(__dirname, 'questions.json');
  fs.readFile(questionsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading questions file:', err);
      return res.status(500).json({ error: 'Failed to load questions' });
    }
    let questions = JSON.parse(data);
    shuffleArray(questions);
    res.json(questions);
  });
});

app.listen(port, () => {
  console.log(`Quiz app listening at http://localhost:${port}`);
});
