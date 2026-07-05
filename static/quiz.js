// ======================================
// QUIZ PAGE
// ======================================

// Quiz Questions
const questions = [

{
q:"Which Python data structure stores key-value pairs?",
opts:["List","Dictionary","Tuple","String"],
correct:1
},

{
q:"Which SQL keyword is used to retrieve data?",
opts:["GET","SELECT","FETCH","SHOW"],
correct:1
},

{
q:"Which HTML tag creates the largest heading?",
opts:["h6","h3","h1","head"],
correct:2
},

{
q:"Binary Search time complexity is?",
opts:["O(n)","O(log n)","O(n²)","O(1)"],
correct:1
},

{
q:"Which Flask decorator creates a route?",
opts:["@route","@app.route","@url","@path"],
correct:1
}

];

let currentQuestion=0;
let timer=45;
let interval;

// ================= LOAD QUESTION =================

function loadQuestion(){

const q=questions[currentQuestion];

document.getElementById("qNum").textContent=currentQuestion+1;

document.getElementById("qText").textContent=q.q;

const options=document.getElementById("qOptions");

options.innerHTML="";

const letters=["A","B","C","D"];

q.opts.forEach((option,index)=>{

const btn=document.createElement("button");

btn.className="quiz-opt";

btn.innerHTML=`
<span class="opt-letter">${letters[index]}</span>
<span>${option}</span>
`;

btn.onclick=()=>checkAnswer(btn,index);

options.appendChild(btn);

});

updateProgress();

resetTimer();

}

// ================= ANSWER =================

function checkAnswer(button,index){

const buttons=document.querySelectorAll(".quiz-opt");

buttons.forEach(btn=>btn.disabled=true);

if(index===questions[currentQuestion].correct){

button.classList.add("correct");

showToast("Correct!","Excellent Job 🎉");

}else{

button.classList.add("wrong");

buttons[questions[currentQuestion].correct]
.classList.add("correct");

showToast("Wrong","Try Again");

}

}

// ================= NEXT =================

function nextQuestion(){

currentQuestion++;

if(currentQuestion>=questions.length){

currentQuestion=0;

}

loadQuestion();

}

window.nextQuestion=nextQuestion;

// ================= TIMER =================

function resetTimer(){

clearInterval(interval);

timer=45;

updateTimer();

interval=setInterval(()=>{

timer--;

updateTimer();

if(timer<=0){

nextQuestion();

}

},1000);

}

function updateTimer(){

const min=String(Math.floor(timer/60)).padStart(2,"0");

const sec=String(timer%60).padStart(2,"0");

document.getElementById("qTimer").textContent=`${min}:${sec}`;

}

// ================= PROGRESS =================

function updateProgress(){

const percent=((currentQuestion+1)/questions.length)*100;

document.getElementById("qProgress").style.width=percent+"%";

document.getElementById("qProgressTxt").textContent=
Math.round(percent)+"% Complete";

}

// ================= TOAST =================

function showToast(title,msg){

const toast=document.getElementById("toast");

if(!toast) return;

document.getElementById("toastTitle").textContent=title;

document.getElementById("toastMsg").textContent=msg;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},3000);

}

// ================= START =================

loadQuestion();