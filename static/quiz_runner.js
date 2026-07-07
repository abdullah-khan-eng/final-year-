// ======================================
// QUIZ RUNNER
// One question at a time, 45s per question
// ======================================

const TIME_PER_QUESTION = 45;

let currentIndex = 0;
let timerInterval = null;
let timeLeft = TIME_PER_QUESTION;

const questionArea = document.getElementById("quizQuestionArea");
const progressText = document.getElementById("quizProgressText");
const progressFill = document.getElementById("quizProgressFill");
const quizTimer = document.getElementById("quizTimer");
const timerText = document.getElementById("quizTimerText");
const quizForm = document.getElementById("quizForm");

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function renderQuestion() {

    const total = QUIZ_QUESTIONS.length;
    const q = QUIZ_QUESTIONS[currentIndex];

    progressText.textContent = `Question ${currentIndex + 1} of ${total}`;
    progressFill.style.width = `${(currentIndex / total) * 100}%`;

    const existingAnswer = document.getElementById(`answer_${currentIndex}`).value;

    const letters = ["A", "B", "C", "D"];
    const optionsHtml = letters.map(letter => {
        const optionText = q["option_" + letter.toLowerCase()];
        const isSelected = existingAnswer === letter;
        return `
            <div class="quiz-option ${isSelected ? "selected" : ""}" data-letter="${letter}">
                <span class="quiz-option-letter">${letter}</span>
                <span class="quiz-option-text">${escapeHtml(optionText)}</span>
            </div>
        `;
    }).join("");

    const isLast = currentIndex === total - 1;

    questionArea.innerHTML = `
        <h3 class="quiz-question">${escapeHtml(q.question)}</h3>
        <div class="quiz-options">${optionsHtml}</div>
        <button type="button" class="btn-primary quiz-next-btn" id="quizNextBtn">
            ${isLast ? "Submit Quiz" : "Next Question"}
        </button>
    `;

    questionArea.querySelectorAll(".quiz-option").forEach(opt => {
        opt.addEventListener("click", () => selectOption(opt));
    });

    document.getElementById("quizNextBtn").addEventListener("click", nextQuestion);

    startTimer();
}

function selectOption(optionEl) {
    questionArea.querySelectorAll(".quiz-option").forEach(o => o.classList.remove("selected"));
    optionEl.classList.add("selected");
    document.getElementById(`answer_${currentIndex}`).value = optionEl.dataset.letter;
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_PER_QUESTION;
    timerText.textContent = timeLeft;
    quizTimer.classList.remove("danger");

    timerInterval = setInterval(() => {
        timeLeft--;
        timerText.textContent = timeLeft;

        if (timeLeft <= 10) {
            quizTimer.classList.add("danger");
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            nextQuestion();
        }
    }, 1000);
}

function nextQuestion() {
    clearInterval(timerInterval);

    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        progressFill.style.width = "100%";
        quizForm.submit();
    }
}

renderQuestion();
