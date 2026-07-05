// ======================================
// CHATBOT PAGE
// ======================================

const chatBody = document.getElementById("chatBody");
const chatInput = document.getElementById("chatInput");

// AI Demo Responses
const aiResponses = [

"Great question! Let me explain it step by step so it's easy to understand.",

"This concept is very important. Think of it as a process where each step builds on the previous one.",

"Excellent! Here's an example that will make it easier to understand.",

"Sure! Let me explain this with a practical example and simple language.",

"This topic is commonly asked in interviews and exams. Here's how it works."

];

// ===============================
// ADD MESSAGE
// ===============================

function appendMessage(text,sender){

const msg=document.createElement("div");

msg.className=`msg ${sender}`;

msg.innerHTML=`

<div class="msg-av">
<i class="fa-solid fa-${sender==="bot"?"robot":"user"}"></i>
</div>

<div class="msg-bubble">
${text}
</div>

`;

chatBody.appendChild(msg);

chatBody.scrollTop=chatBody.scrollHeight;

}

// ===============================
// TYPING EFFECT
// ===============================

function showTyping(){

const typing=document.createElement("div");

typing.className="msg bot";

typing.id="typingMsg";

typing.innerHTML=`

<div class="msg-av">

<i class="fa-solid fa-robot"></i>

</div>

<div class="msg-bubble">

Typing...

</div>

`;

chatBody.appendChild(typing);

chatBody.scrollTop=chatBody.scrollHeight;

}

function hideTyping(){

const typing=document.getElementById("typingMsg");

if(typing){

typing.remove();

}

}

// ===============================
// SEND MESSAGE
// ===============================

function sendChat(){

const text=chatInput.value.trim();

if(text==="") return;

appendMessage(text,"user");

chatInput.value="";

showTyping();

setTimeout(()=>{

hideTyping();

const randomReply=

aiResponses[Math.floor(Math.random()*aiResponses.length)];

appendMessage(randomReply,"bot");

},1200);

}

// Button Click

window.sendChat=sendChat;

// Press Enter

chatInput.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

sendChat();

}

});

// ===============================
// AUTO FOCUS
// ===============================

window.addEventListener("load",()=>{

chatInput.focus();

});