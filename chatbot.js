// document.addEventListener("DOMContentLoaded", () => {
//     const chatbotContainer = document.getElementById("chatbot-container");
//     const toggleChatbotButton = document.getElementById("toggle-chatbot");
//     const chatWindow = document.getElementById("chat-window");
//     const chatInput = document.getElementById("chat-input");
//     const sendMessageButton = document.getElementById("send-message");

//     // Toggle chatbot visibility
//     toggleChatbotButton.addEventListener("click", () => {
//         chatbotContainer.classList.toggle("chatbot-collapsed");
//         toggleChatbotButton.textContent = chatbotContainer.classList.contains("chatbot-collapsed") ? "⬆" : "⬇";
//     });

//     // Send message
//     const sendMessage = () => {
//         const userMessage = chatInput.value.trim();
//         if (!userMessage) return;

//         // Append user message
//         appendMessage("user", userMessage);

//         // Simulate bot reply
//         setTimeout(() => {
//             appendMessage("bot", "LLM coming soon");
//         }, 500);

//         chatInput.value = "";
//         chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll
//     };

//     // Append message to chat window
//     const appendMessage = (type, message) => {
//         const messageElem = document.createElement("div");
//         messageElem.classList.add("chat-message", type);
//         messageElem.textContent = message;
//         chatWindow.appendChild(messageElem);
//     };

//     // Attach event listeners
//     sendMessageButton.addEventListener("click", sendMessage);
//     chatInput.addEventListener("keydown", (e) => {
//         if (e.key === "Enter") sendMessage();
//     });
// });


document.addEventListener("DOMContentLoaded", () => {
    const chatbotContainer = document.getElementById("chatbot-container");
    const toggleChatbotButton = document.getElementById("toggle-chatbot");
    const chatWindow = document.getElementById("chat-window");
    const chatInput = document.getElementById("chat-input");
    const sendMessageButton = document.getElementById("send-message");
    let ws = null;

    // Initialize WebSocket connection
    function initializeWebSocket() {
        ws = new WebSocket('wss://nuocgpt-chat-bl9fc.ondigitalocean.app/ws/chat');
        
        ws.onopen = () => {
            appendMessage('system', 'Connected to the chatbot');
        };
        
        ws.onmessage = (event) => {
            appendMessage('bot', event.data);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        };
        
        ws.onclose = () => {
            appendMessage('system', 'Disconnected from the chatbot. Attempting to reconnect...');
            setTimeout(initializeWebSocket, 3000);
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            appendMessage('system', 'Error connecting to the chatbot');
        };
    }
    // Initialize WebSocket when the page loads
    initializeWebSocket();

    // Toggle chatbot visibility
    toggleChatbotButton.addEventListener("click", () => {
        chatbotContainer.classList.toggle("chatbot-collapsed");
        toggleChatbotButton.textContent = chatbotContainer.classList.contains("chatbot-collapsed") ? "⬆" : "⬇";
    });

    // Send message
    const sendMessage = () => {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Check if WebSocket is connected
        if (ws && ws.readyState === WebSocket.OPEN) {
            // Append user message
            appendMessage("user", userMessage);
            
            // Send message to server
            ws.send(userMessage);
            
            // Clear input and scroll to bottom
            chatInput.value = "";
            chatWindow.scrollTop = chatWindow.scrollHeight;
        } else {
            appendMessage('system', 'Not connected to the server. Attempting to reconnect...');
            initializeWebSocket();
        }
    };

    // Append message to chat window
    const appendMessage = (type, message) => {
        const messageElem = document.createElement("div");
        messageElem.classList.add("chat-message", type);
        
        // Add appropriate icon based on message type
        const icon = document.createElement("span");
        icon.classList.add("message-icon");
        
        switch(type) {
            case 'user':
                icon.textContent = '👤 ';
                break;
            case 'bot':
                icon.textContent = '🤖 ';
                break;
            case 'system':
                icon.textContent = '⚙️ ';
                break;
        }
        
        messageElem.appendChild(icon);
        
        const messageText = document.createElement("span");
        messageText.textContent = message;
        messageElem.appendChild(messageText);
        
        chatWindow.appendChild(messageElem);
    };

    // Attach event listeners
    sendMessageButton.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});