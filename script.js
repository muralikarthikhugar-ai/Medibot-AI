const chatBox = document.getElementById('chat-box');
const form = document.getElementById('message-form');
const input = document.getElementById('message-input');

// We will replace this URL in the final step
const BACKEND_URL = 'http://127.0.0.1:5000'; // For testing on your computer

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = input.value;
    addMessage(userMessage, 'user-message');
    input.value = '';

    const response = await fetch(`${BACKEND_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
    });
    const data = await response.json();
    addMessage(data.answer, 'bot-message');
});

function addMessage(message, type) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = type;
    const messageBubble = document.createElement('div');
    messageBubble.textContent = message;
    messageWrapper.appendChild(messageBubble);
    chatBox.appendChild(messageWrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
}