// ======================================
// CHATBOT PAGE
// ======================================

const chatBody = document.getElementById("chatBody");
const chatInput = document.getElementById("chatInput");

// ===============================
// ADD MESSAGE
// ===============================

function appendMessage(text, sender) {

    const msg = document.createElement("div");

    msg.className = `msg ${sender}`;

    msg.innerHTML = `
        <div class="msg-av">
            <i class="fa-solid fa-${sender === "bot" ? "robot" : "user"}"></i>
        </div>
        <div class="msg-bubble">
            ${text}
        </div>
    `;

    chatBody.appendChild(msg);

    chatBody.scrollTop = chatBody.scrollHeight;
}

// ===============================
// TYPING EFFECT
// ===============================

function showTyping() {

    const typing = document.createElement("div");

    typing.className = "msg bot";

    typing.id = "typingMsg";

    typing.innerHTML = `
        <div class="msg-av">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="msg-bubble">
            Typing...
        </div>
    `;

    chatBody.appendChild(typing);

    chatBody.scrollTop = chatBody.scrollHeight;
}

function hideTyping() {

    const typing = document.getElementById("typingMsg");

    if (typing) {
        typing.remove();
    }
}

// ===============================
// SEND MESSAGE
// ===============================

async function sendChat() {

    const text = chatInput.value.trim();

    if (text === "") return;

    appendMessage(text, "user");

    chatInput.value = "";

    showTyping();

    try {

        const res = await fetch("/chatbot/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: text })
        });

        const data = await res.json();

        hideTyping();

        if (!res.ok) {
            appendMessage(`Sorry, something went wrong: ${data.error || "unknown error"}`, "bot");
            return;
        }

        appendMessage(data.answer, "bot");

    } catch (err) {

        hideTyping();

        appendMessage("Sorry, I couldn't reach the AI service. Please try again.", "bot");
    }
}

// Button Click

window.sendChat = sendChat;

// Press Enter

chatInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {
        sendChat();
    }
});

// ===============================
// AUTO FOCUS
// ===============================

window.addEventListener("load", () => {

    chatInput.focus();
});
