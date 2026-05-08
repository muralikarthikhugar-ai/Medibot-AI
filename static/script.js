document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Element Selection ---
    const form = document.getElementById("question-form");
    const input = document.getElementById("question-input");
    const chatLog = document.getElementById("chat-log");
    const sendBtn = document.getElementById("send-btn");
    const stopBtnContainer = document.getElementById("stop-btn-container");
    const stopBtn = document.getElementById("stop-btn");
    const newChatBtn = document.getElementById("new-chat-btn");
    const headerAvatarContainer = document.getElementById("header-avatar-container");

    // --- State Management (Short-Term Memory) ---
    let conversationHistory = [];
    let isBotTyping = false;
    let typingIntervalId = null;

    // --- Core Functions ---

    /**
     * Starts a new chat, clearing the UI and resetting the short-term history.
     */
    const startNewChat = () => {
        stopBotTyping();
        chatLog.innerHTML = '';
        const initialBotMessage = "Hello! I am MediBot. How can I help you with your medical questions today?";
        appendMessage(initialBotMessage, "bot-message", true);
        conversationHistory = [{ role: "assistant", content: initialBotMessage }];
    };

    /**
     * Stops the bot's typing animation and resets UI state.
     */
    const stopBotTyping = () => {
        if (typingIntervalId) {
            clearInterval(typingIntervalId);
        }
        isBotTyping = false;
        typingIntervalId = null;
        stopBtnContainer.style.display = "none";
        headerAvatarContainer.classList.remove("thinking");
        sendBtn.disabled = false;
        if (document.activeElement !== input) {
            input.focus();
        }
    };

    /**
     * Appends a message to the chat log.
     * @param {string} text - The message text.
     * @param {string} type - The message type ('bot-message' or 'user-message').
     * @param {boolean} instant - If true, display the message instantly without typing.
     * @returns {HTMLElement} - The created message wrapper element.
     */
    function appendMessage(text, type, instant = false) {
        const messageWrapper = document.createElement("div");
        messageWrapper.className = `message-wrapper ${type}`;

        const avatar = document.createElement("img");
        avatar.className = "avatar";

        const messageContent = document.createElement("div");
        messageContent.className = "message-content";

        const textContainer = document.createElement("div");
        textContainer.className = "text-container";
        
        messageContent.appendChild(textContainer);

        if (type === "bot-message") {
            avatar.src = "/static/images/bot.jpg";
            avatar.alt = "Bot Avatar";
            messageWrapper.appendChild(avatar);
            messageWrapper.appendChild(messageContent);
            
            const copyBtn = document.createElement("button");
            copyBtn.className = "copy-button";
            copyBtn.title = "Copy text";
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
            
            copyBtn.addEventListener("click", () => {
                navigator.clipboard.writeText(textContainer.innerText).then(() => {
                    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    setTimeout(() => {
                         copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
                    }, 2000);
                });
            });

            messageContent.appendChild(copyBtn);

        } else { // user-message
            avatar.src = "/static/images/user.jpg";
            avatar.alt = "User Avatar";
            messageWrapper.appendChild(messageContent);
            messageWrapper.appendChild(avatar);
        }

        chatLog.appendChild(messageWrapper);
        
        if (instant) {
            textContainer.innerHTML = marked.parse(text);
        } else if (type === 'bot-message') {
            typeMessage(textContainer, text);
        }

        chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
        return messageWrapper;
    }
    
    /**
     * Simulates a typing effect for the bot's message.
     * @param {HTMLElement} element - The HTML element to type into.
     * @param {string} text - The text to type.
     */
    function typeMessage(element, text) {
        let index = 0;
        element.innerHTML = "";
        isBotTyping = true;
        stopBtnContainer.style.display = "flex";
        headerAvatarContainer.classList.add("thinking");

        typingIntervalId = setInterval(() => {
            if (index < text.length) {
                const char = text[index];
                element.innerHTML += (char === '\n') ? '<br>' : char;
                index++;
                chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
            } else {
                element.innerHTML = marked.parse(element.innerHTML);
                stopBotTyping();
            }
        }, 10); // Typing speed
    }

    // --- Event Listeners ---
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isBotTyping) stopBotTyping();

        const userQuestion = input.value.trim();
        if (!userQuestion) return;

        appendMessage(userQuestion, "user-message", true);
        conversationHistory.push({ role: "user", content: userQuestion });
        
        input.value = "";
        sendBtn.disabled = true;
        
        const botMessageWrapper = appendMessage("", "bot-message");

        try {
            const response = await fetch("http://127.0.0.1:5000/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history: conversationHistory })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ answer: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.answer);
            }

            const data = await response.json();
            const botAnswer = (data.answer || "Sorry, I could not generate a response.").trim();
            
            typeMessage(botMessageWrapper.querySelector('.text-container'), botAnswer);
            conversationHistory.push({ role: "assistant", content: botAnswer });

        } catch (err) {
            stopBotTyping();
            const errorContainer = botMessageWrapper.querySelector('.text-container');
            errorContainer.innerHTML = `⚠️ Error: ${err.message}`;
        }
    });

    stopBtn.addEventListener("click", stopBotTyping);
    newChatBtn.addEventListener("click", startNewChat);

    // --- Initial Load ---
    startNewChat();
});

