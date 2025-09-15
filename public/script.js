const questionContainer = document.getElementById('question-container');
const questionNumberElem = document.getElementById('question-number');
const questionTextElem = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const timerElem = document.getElementById('timer');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const resultContainer = document.getElementById('result-container');
const scoreElem = document.getElementById('score');
const reviewContainer = document.getElementById('review-container');
const restartBtn2 = document.getElementById('restart-btn-2');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timePerQuestion = 15; // seconds
let timeLeft = timePerQuestion;
let selectedOptionIndex = null;
let answersReview = [];

async function fetchQuestions() {
  try {
    const res = await fetch('/api/questions');
    questions = await res.json();
    startQuiz();
  } catch (error) {
    questionTextElem.textContent = 'Failed to load questions.';
    console.error('Error fetching questions:', error);
  }
}

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  answersReview = [];
  resultContainer.style.display = 'none';
  questionContainer.style.display = 'block';
  restartBtn.style.display = 'none';
  nextBtn.disabled = true;
  showQuestion();
}

function showQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  questionNumberElem.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  questionTextElem.textContent = currentQuestion.question;

  currentQuestion.options.forEach((option, index) => {
    const optionDiv = document.createElement('div');
    optionDiv.classList.add('option');
    optionDiv.textContent = option;
    optionDiv.addEventListener('click', () => selectOption(index));
    optionsContainer.appendChild(optionDiv);
  });

  timeLeft = timePerQuestion;
  timerElem.textContent = `Time Left: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timerElem.textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      lockOptions();
      saveAnswer(null); // no answer selected
      nextBtn.disabled = false;
    }
  }, 1000);
}

function resetState() {
  clearInterval(timer);
  selectedOptionIndex = null;
  nextBtn.disabled = true;
  timerElem.textContent = '';
  while (optionsContainer.firstChild) {
    optionsContainer.removeChild(optionsContainer.firstChild);
  }
}

function selectOption(index) {
  if (selectedOptionIndex !== null) return; // prevent changing answer
  selectedOptionIndex = index;
  const optionDivs = optionsContainer.querySelectorAll('.option');
  optionDivs.forEach((optionDiv, i) => {
    optionDiv.classList.remove('selected');
    if (i === index) optionDiv.classList.add('selected');
  });
  nextBtn.disabled = false;
  clearInterval(timer);
}

function lockOptions() {
  const optionDivs = optionsContainer.querySelectorAll('.option');
  optionDivs.forEach(optionDiv => {
    optionDiv.style.pointerEvents = 'none';
  });
}

function saveAnswer(selectedIndex) {
  const currentQuestion = questions[currentQuestionIndex];
  const correctIndex = currentQuestion.answer;
  let isCorrect = false;

  if (selectedIndex === correctIndex) {
    score += 10;
    isCorrect = true;
  }

  answersReview.push({
    question: currentQuestion.question,
    selected: selectedIndex,
    correct: correctIndex,
    options: currentQuestion.options,
    isCorrect
  });

  // Show correct/incorrect colors
  const optionDivs = optionsContainer.querySelectorAll('.option');
  optionDivs.forEach((optionDiv, i) => {
    optionDiv.classList.remove('selected');
    if (i === correctIndex) {
      optionDiv.classList.add('correct');
    } else if (i === selectedIndex && selectedIndex !== correctIndex) {
      optionDiv.classList.add('incorrect');
    }
  });
  lockOptions();
}

nextBtn.addEventListener('click', () => {
  saveAnswer(selectedOptionIndex);
  nextBtn.disabled = true;
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    setTimeout(() => {
      showQuestion();
    }, 1000);
  } else {
    setTimeout(() => {
      showResults();
    }, 1000);
  }
});

function showResults() {
  questionContainer.style.display = 'none';
  resultContainer.style.display = 'block';
  scoreElem.textContent = `Your Score: ${score} / ${questions.length * 10}`;
  reviewContainer.innerHTML = '';

  answersReview.forEach((item, index) => {
    const reviewDiv = document.createElement('div');
    reviewDiv.classList.add('review-item');
    reviewDiv.classList.add(item.isCorrect ? 'correct' : 'incorrect');

    const questionP = document.createElement('p');
    questionP.classList.add('review-question');
    questionP.textContent = `Q${index + 1}: ${item.question}`;
    reviewDiv.appendChild(questionP);

    const answerP = document.createElement('p');
    answerP.classList.add('review-answer');
    answerP.innerHTML = `Your answer: <strong>${item.selected !== null ? item.options[item.selected] : 'No answer'}</strong>`;
    reviewDiv.appendChild(answerP);

    if (!item.isCorrect) {
      const correctP = document.createElement('p');
      correctP.classList.add('review-answer');
      correctP.innerHTML = `Correct answer: <strong>${item.options[item.correct]}</strong>`;
      reviewDiv.appendChild(correctP);
    }

    reviewContainer.appendChild(reviewDiv);
  });
  restartBtn2.style.display = 'inline-block';
}

restartBtn.addEventListener('click', () => {
  startQuiz();
});

restartBtn2.addEventListener('click', () => {
  startQuiz();
});

// Start fetching questions and quiz
fetchQuestions();
