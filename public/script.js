/* =========================================================
   ANSH AI
   Complete Frontend Script
   =========================================================

   FEATURES
   ---------------------------------------------------------
   1. Chat system
   2. New Chat
   3. Clear Chat
   4. Chat history
   5. LocalStorage
   6. User messages
   7. AI messages
   8. Typing animation
   9. Copy answer
   10. Regenerate answer
   11. Voice input
   12. Text to speech
   13. Stop speaking
   14. Image selection
   15. Image preview
   16. Image removal
   17. Image to AI
   18. Enter to send
   19. Shift + Enter
   20. Auto scroll
   21. Loading animation
   22. API error handling
   23. Network error handling
   24. Hindi support
   25. English support
   26. Hinglish support
   27. Markdown-like formatting
   28. Code blocks
   29. Copy code
   30. Mobile support
   31. Sidebar support
   32. Theme support
   33. Character counter
   34. Stop generation
   35. Conversation persistence
   36. Message timestamps
   37. Welcome screen
   38. Image preview
   39. Drag/drop image support
   40. Paste image support
   ========================================================= */


/* =========================================================
   SECTION 1
   GLOBAL VARIABLES
   ========================================================= */

"use strict";

let conversations = [];
let currentConversationId = null;

let selectedImage = null;
let selectedImageName = "";
let selectedImageType = "";

let isGenerating = false;
let stopGenerationRequested = false;

let recognition = null;
let isListening = false;

let speechUtterance = null;
let isSpeaking = false;

let lastUserMessage = "";
let lastAIMessage = "";

let typingSpeed = 8;

const STORAGE_KEY = "ANSH_AI_CONVERSATIONS";
const CURRENT_CHAT_KEY = "ANSH_AI_CURRENT_CHAT";

const DEFAULT_SYSTEM_MESSAGE = `
You are ANSH AI, a helpful and intelligent AI assistant.

Language rules:
- If the user asks in Hindi, answer in Hindi.
- If the user asks in English, answer in English.
- If the user asks in Hinglish, answer in Hinglish.
- Understand Hindi written in Devanagari.
- Understand Hindi written using English letters.
- Be friendly and helpful.
- Explain things step by step when necessary.
- For programming questions, provide clear code.
- Never claim to see an image unless an image was actually provided.
`;


/* =========================================================
   SECTION 2
   DOM ELEMENTS
   ========================================================= */

let chatContainer = null;
let userInput = null;
let sendButton = null;

let newChatButton = null;
let clearChatButton = null;

let imageInput = null;
let imageButton = null;
let imagePreview = null;
let removeImageButton = null;

let voiceButton = null;
let stopSpeakingButton = null;

let sidebar = null;
let sidebarOverlay = null;
let menuButton = null;

let welcomeScreen = null;
let typingIndicator = null;

let characterCounter = null;


/* =========================================================
   SECTION 3
   INITIALIZE DOM
   ========================================================= */

function initializeElements() {

    chatContainer =
        document.getElementById("chat") ||
        document.getElementById("chatContainer") ||
        document.querySelector(".chat-container") ||
        document.querySelector(".messages");

    userInput =
        document.getElementById("userInput") ||
        document.getElementById("messageInput") ||
        document.getElementById("prompt") ||
        document.querySelector("textarea");

    sendButton =
        document.getElementById("sendBtn") ||
        document.getElementById("sendButton") ||
        document.querySelector(".send-btn");

    newChatButton =
        document.getElementById("newChat") ||
        document.getElementById("newChatBtn");

    clearChatButton =
        document.getElementById("clearChat") ||
        document.getElementById("clearChatBtn");

    imageInput =
        document.getElementById("imageInput") ||
        document.getElementById("fileInput");

    imageButton =
        document.getElementById("imageBtn") ||
        document.getElementById("imageButton") ||
        document.querySelector(".image-btn");

    imagePreview =
        document.getElementById("imagePreview");

    removeImageButton =
        document.getElementById("removeImage") ||
        document.getElementById("removeImageBtn");

    voiceButton =
        document.getElementById("voiceBtn") ||
        document.getElementById("voiceButton");

    stopSpeakingButton =
        document.getElementById("stopSpeaking");

    sidebar =
        document.getElementById("sidebar") ||
        document.querySelector(".sidebar");

    sidebarOverlay =
        document.getElementById("sidebarOverlay");

    menuButton =
        document.getElementById("menuBtn") ||
        document.getElementById("menuButton");

    welcomeScreen =
        document.getElementById("welcomeScreen");

    typingIndicator =
        document.getElementById("typingIndicator");

    characterCounter =
        document.getElementById("characterCounter");

}


/* =========================================================
   SECTION 4
   APPLICATION START
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeElements();

    loadConversations();

    initializeCurrentConversation();

    setupEventListeners();

    setupVoiceRecognition();

    setupDragAndDrop();

    setupPasteImage();

    updateCharacterCounter();

    console.log("ANSH AI initialized successfully.");

});


/* =========================================================
   SECTION 5
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {

    if (sendButton) {

        sendButton.addEventListener("click", function () {
            sendMessage();
        });

    }


    if (userInput) {

        userInput.addEventListener("keydown", function (event) {

            if (event.key === "Enter" && !event.shiftKey) {

                event.preventDefault();

                sendMessage();

            }

        });


        userInput.addEventListener("input", function () {

            autoResizeInput();

            updateCharacterCounter();

        });

    }


    if (newChatButton) {

        newChatButton.addEventListener("click", function () {

            createNewChat();

        });

    }


    if (clearChatButton) {

        clearChatButton.addEventListener("click", function () {

            clearCurrentChat();

        });

    }


    if (imageButton && imageInput) {

        imageButton.addEventListener("click", function () {

            imageInput.click();

        });

    }


    if (imageInput) {

        imageInput.addEventListener("change", function (event) {

            handleImageSelection(event);

        });

    }


    if (removeImageButton) {

        removeImageButton.addEventListener("click", function () {

            removeSelectedImage();

        });

    }


    if (voiceButton) {

        voiceButton.addEventListener("click", function () {

            toggleVoiceRecognition();

        });

    }


    if (stopSpeakingButton) {

        stopSpeakingButton.addEventListener("click", function () {

            stopSpeaking();

        });

    }


    if (menuButton) {

        menuButton.addEventListener("click", function () {

            toggleSidebar();

        });

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener("click", function () {

            closeSidebar();

        });

    }

}


/* =========================================================
   SECTION 6
   STORAGE
   ========================================================= */

function saveConversations() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(conversations)
        );

    } catch (error) {

        console.error(
            "Could not save conversations:",
            error
        );

    }

}


function loadConversations() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved) {

            conversations =
                JSON.parse(saved);

        }

    } catch (error) {

        console.error(
            "Could not load conversations:",
            error
        );

        conversations = [];

    }

}


function saveCurrentConversationId() {

    if (!currentConversationId) return;

    localStorage.setItem(
        CURRENT_CHAT_KEY,
        currentConversationId
    );

}


function loadCurrentConversationId() {

    return localStorage.getItem(
        CURRENT_CHAT_KEY
    );

}


/* =========================================================
   SECTION 7
   CONVERSATION INITIALIZATION
   ========================================================= */

function initializeCurrentConversation() {

    const savedId =
        loadCurrentConversationId();

    if (
        savedId &&
        conversations.some(
            chat => chat.id === savedId
        )
    ) {

        currentConversationId = savedId;

        renderCurrentConversation();

    } else if (conversations.length > 0) {

        currentConversationId =
            conversations[0].id;

        saveCurrentConversationId();

        renderCurrentConversation();

    } else {

        createNewChat();

    }

}


/* =========================================================
   SECTION 8
   CREATE NEW CHAT
   ========================================================= */

function createNewChat() {

    const newConversation = {

        id:
            "chat_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        title: "New Chat",

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        messages: []

    };


    conversations.unshift(
        newConversation
    );


    currentConversationId =
        newConversation.id;


    saveConversations();

    saveCurrentConversationId();

    renderCurrentConversation();

    renderChatHistory();

    clearInput();

    removeSelectedImage();

}


/* =========================================================
   SECTION 9
   GET CURRENT CHAT
   ========================================================= */

function getCurrentConversation() {

    return conversations.find(
        chat =>
            chat.id ===
            currentConversationId
    );

}


/* =========================================================
   SECTION 10
   RENDER CURRENT CHAT
   ========================================================= */

function renderCurrentConversation() {

    if (!chatContainer) return;

    const conversation =
        getCurrentConversation();

    chatContainer.innerHTML = "";

    if (
        !conversation ||
        conversation.messages.length === 0
    ) {

        showWelcomeScreen();

        renderChatHistory();

        return;

    }


    hideWelcomeScreen();


    conversation.messages.forEach(
        function (message) {

            renderMessage(
                message.role,
                message.content,
                message.image,
                false,
                message.id
            );

        }
    );


    renderChatHistory();

    scrollToBottom();

}


/* =========================================================
   SECTION 11
   WELCOME SCREEN
   ========================================================= */

function showWelcomeScreen() {

    if (!chatContainer) return;

    if (welcomeScreen) {

        welcomeScreen.style.display =
            "flex";

        return;

    }


    const welcome =
        document.createElement("div");

    welcome.className =
        "ansh-welcome-screen";


    welcome.innerHTML = `
        <div class="welcome-icon">🤖</div>

        <h1>ANSH AI</h1>

        <p>
            Hello! I am ANSH AI.
            How can I help you today?
        </p>

        <div class="suggestions">

            <button
                class="suggestion-btn"
                data-prompt="Explain artificial intelligence in simple words."
            >
                Explain AI
            </button>

            <button
                class="suggestion-btn"
                data-prompt="Write a simple Python program."
            >
                Write Code
            </button>

            <button
                class="suggestion-btn"
                data-prompt="Give me a cool Arduino project idea."
            >
                Arduino Idea
            </button>

            <button
                class="suggestion-btn"
                data-prompt="Tell me something interesting."
            >
                Surprise Me
            </button>

        </div>
    `;


    chatContainer.appendChild(welcome);


    const buttons =
        welcome.querySelectorAll(
            ".suggestion-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    if (userInput) {

                        userInput.value =
                            button.dataset.prompt;

                        autoResizeInput();

                        updateCharacterCounter();

                        sendMessage();

                    }

                }
            );

        }
    );

}


function hideWelcomeScreen() {

    if (welcomeScreen) {

        welcomeScreen.style.display =
            "none";

    }

    const dynamicWelcome =
        document.querySelector(
            ".ansh-welcome-screen"
        );

    if (dynamicWelcome) {

        dynamicWelcome.remove();

    }

}


/* =========================================================
   SECTION 12
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    if (isGenerating) {

        return;

    }


    if (!userInput) {

        console.error(
            "userInput element not found."
        );

        return;

    }


    const message =
        userInput.value.trim();


    if (!message && !selectedImage) {

        return;

    }


    const conversation =
        getCurrentConversation();


    if (!conversation) {

        createNewChat();

        return sendMessage();

    }


    hideWelcomeScreen();


    lastUserMessage = message;


    const imageData =
        selectedImage;


    const userMessage = {

        id:
            createMessageId(),

        role:
            "user",

        content:
            message,

        image:
            imageData,

        timestamp:
            new Date().toISOString()

    };


    conversation.messages.push(
        userMessage
    );


    conversation.updatedAt =
        new Date().toISOString();


    if (
        conversation.title ===
        "New Chat"
    ) {

        conversation.title =
            generateChatTitle(message);

    }


    saveConversations();


    renderMessage(
        "user",
        message,
        imageData,
        true,
        userMessage.id
    );


    clearInput();

    removeSelectedImage();

    renderChatHistory();

    scrollToBottom();


    isGenerating = true;

    stopGenerationRequested = false;

    updateSendButton();


    const loadingElement =
        createLoadingMessage();


    try {

        const response =
            await callAIAPI(
                message,
                imageData,
                conversation.messages
            );


        if (stopGenerationRequested) {

            removeLoadingMessage(
                loadingElement
            );

            return;

        }


        removeLoadingMessage(
            loadingElement
        );


        if (
            response &&
            response.success
        ) {

            const aiText =
                response.text ||
                "I could not generate a response.";


            lastAIMessage = aiText;


            const aiMessage = {

                id:
                    createMessageId(),

                role:
                    "assistant",

                content:
                    aiText,

                timestamp:
                    new Date().toISOString()

            };


            conversation.messages.push(
                aiMessage
            );


            conversation.updatedAt =
                new Date().toISOString();


            saveConversations();


            await renderAIMessageAnimated(
                aiText,
                aiMessage.id
            );


        } else {

            const errorMessage =
                response?.error ||
                "ANSH AI could not generate a response.";


            addErrorMessage(
                errorMessage
            );

        }

    } catch (error) {

        console.error(
            "sendMessage error:",
            error
        );


        removeLoadingMessage(
            loadingElement
        );


        addErrorMessage(
            getReadableError(error)
        );

    } finally {

        isGenerating = false;

        stopGenerationRequested = false;

        updateSendButton();

        scrollToBottom();

    }

}


/* =========================================================
   SECTION 13
   API CALL
   ========================================================= */

async function callAIAPI(
    message,
    imageData,
    messages
) {

    const conversationHistory =
        messages
            .slice(-20)
            .map(
                function (item) {

                    return {

                        role:
                            item.role ===
                            "assistant"
                                ? "assistant"
                                : "user",

                        content:
                            item.content || ""

                    };

                }
            );


    const requestBody = {

        message:
            message,

        messages:
            conversationHistory,

        system:
            DEFAULT_SYSTEM_MESSAGE

    };


    if (imageData) {

        requestBody.image =
            imageData;

    }


    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            function () {

                controller.abort();

            },
            120000
        );


    try {

        const response =
            await fetch(
                "/api/chat",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestBody
                        ),

                    signal:
                        controller.signal

                }
            );


        clearTimeout(timeout);


        let data = null;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            data = null;

        }


        if (!response.ok) {

            return {

                success:
                    false,

                error:
                    data?.error ||
                    data?.message ||
                    `HTTP Error ${response.status}`

            };

        }


        if (
            typeof data ===
            "string"
        ) {

            return {

                success:
                    true,

                text:
                    data

            };

        }


        const text =
            data?.text ||
            data?.response ||
            data?.answer ||
            data?.message ||
            data?.content ||
            data?.result;


        if (!text) {

            return {

                success:
                    false,

                error:
                    "AI ne koi response nahi diya."

            };

        }


        return {

            success:
                true,

            text:
                String(text)

        };


    } catch (error) {

        clearTimeout(timeout);

        throw error;

    }

}


/* =========================================================
   SECTION 14
   CREATE MESSAGE ID
   ========================================================= */

function createMessageId() {

    return (
        "msg_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );

}


/* =========================================================
   SECTION 15
   GENERATE CHAT TITLE
   ========================================================= */

function generateChatTitle(message) {

    if (!message) {

        return "New Chat";

    }


    let title =
        message
            .replace(/\s+/g, " ")
            .trim();


    if (title.length > 35) {

        title =
            title.substring(0, 35) +
            "...";

    }


    return title || "New Chat";

}


/* =========================================================
   SECTION 16
   RENDER MESSAGE
   ========================================================= */

function renderMessage(
    role,
    content,
    image,
    scroll = true,
    messageId = null
) {

    if (!chatContainer) return null;


    const messageWrapper =
        document.createElement("div");


    messageWrapper.className =
        `message-wrapper ${role}`;


    if (messageId) {

        messageWrapper.dataset.messageId =
            messageId;

    }


    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar";


    avatar.textContent =
        role === "user"
            ? "👤"
            : "🤖";


    const messageContent =
        document.createElement("div");


    messageContent.className =
        "message-content";


    if (image) {

        const imageElement =
            document.createElement("img");


        imageElement.className =
            "chat-image";


        imageElement.src =
            image;


        imageElement.alt =
            "Uploaded image";


        imageElement.addEventListener(
            "click",
            function () {

                openImageViewer(image);

            }
        );


        messageContent.appendChild(
            imageElement
        );

    }


    if (content) {

        const textElement =
            document.createElement("div");


        textElement.className =
            "message-text";


        if (role === "assistant") {

            textElement.innerHTML =
                formatAIText(content);

        } else {

            textElement.textContent =
                content;

        }


        messageContent.appendChild(
            textElement
        );

    }


    const actions =
        document.createElement("div");


    actions.className =
        "message-actions";


    if (role === "assistant") {

        actions.innerHTML = `

            <button
                class="message-action copy-btn"
                title="Copy"
            >
                📋
            </button>

            <button
                class="message-action speak-btn"
                title="Read aloud"
            >
                🔊
            </button>

            <button
                class="message-action regenerate-btn"
                title="Regenerate"
            >
                🔄
            </button>

        `;


        const copyButton =
            actions.querySelector(
                ".copy-btn"
            );


        copyButton.addEventListener(
            "click",
            function () {

                copyText(content);

            }
        );


        const speakButton =
            actions.querySelector(
                ".speak-btn"
            );


        speakButton.addEventListener(
            "click",
            function () {

                speakText(
                    stripMarkdown(content)
                );

            }
        );


        const regenerateButton =
            actions.querySelector(
                ".regenerate-btn"
            );


        regenerateButton.addEventListener(
            "click",
            function () {

                regenerateMessage();

            }
        );

    } else {

        actions.innerHTML = `

            <button
                class="message-action copy-btn"
                title="Copy"
            >
                📋
            </button>

        `;


        const copyButton =
            actions.querySelector(
                ".copy-btn"
            );


        copyButton.addEventListener(
            "click",
            function () {

                copyText(content);

            }
        );

    }


    messageContent.appendChild(
        actions
    );


    messageWrapper.appendChild(
        avatar
    );


    messageWrapper.appendChild(
        messageContent
    );


    chatContainer.appendChild(
        messageWrapper
    );


    if (scroll) {

        scrollToBottom();

    }


    initializeCodeCopyButtons(
        messageWrapper
    );


    return messageWrapper;

}


/* =========================================================
   SECTION 17
   AI ANIMATED MESSAGE
   ========================================================= */

async function renderAIMessageAnimated(
    text,
    messageId
) {

    if (!chatContainer) return;


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message-wrapper assistant";


    wrapper.dataset.messageId =
        messageId;


    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar";


    avatar.textContent =
        "🤖";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const textElement =
        document.createElement("div");


    textElement.className =
        "message-text";


    content.appendChild(
        textElement
    );


    wrapper.appendChild(
        avatar
    );


    wrapper.appendChild(
        content
    );


    chatContainer.appendChild(
        wrapper
    );


    let displayedText = "";


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        if (stopGenerationRequested) {

            break;

        }


        displayedText +=
            text[i];


        textElement.innerHTML =
            formatAIText(
                displayedText
            );


        scrollToBottom();


        if (
            i % 5 === 0
        ) {

            await sleep(
                typingSpeed
            );

        }

    }


    addAIMessageActions(
        content,
        text
    );


    initializeCodeCopyButtons(
        wrapper
    );


    scrollToBottom();

}


/* =========================================================
   SECTION 18
   ADD AI ACTION BUTTONS
   ========================================================= */

function addAIMessageActions(
    parent,
    content
) {

    const actions =
        document.createElement("div");


    actions.className =
        "message-actions";


    actions.innerHTML = `

        <button
            class="message-action copy-btn"
            title="Copy"
        >
            📋
        </button>

        <button
            class="message-action speak-btn"
            title="Read aloud"
        >
            🔊
        </button>

        <button
            class="message-action regenerate-btn"
            title="Regenerate"
        >
            🔄
        </button>

    `;


    const copyButton =
        actions.querySelector(
            ".copy-btn"
        );


    copyButton.addEventListener(
        "click",
        function () {

            copyText(content);

        }
    );


    const speakButton =
        actions.querySelector(
            ".speak-btn"
        );


    speakButton.addEventListener(
        "click",
        function () {

            speakText(
                stripMarkdown(content)
            );

        }
    );


    const regenerateButton =
        actions.querySelector(
            ".regenerate-btn"
        );


    regenerateButton.addEventListener(
        "click",
        function () {

            regenerateMessage();

        }
    );


    parent.appendChild(
        actions
    );

}


/* =========================================================
   SECTION 19
   LOADING MESSAGE
   ========================================================= */

function createLoadingMessage() {

    if (!chatContainer) return null;


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message-wrapper assistant loading-message";


    wrapper.innerHTML = `

        <div class="message-avatar">
            🤖
        </div>

        <div class="message-content">

            <div class="typing-dots">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;


    chatContainer.appendChild(
        wrapper
    );


    scrollToBottom();


    return wrapper;

}


function removeLoadingMessage(
    element
) {

    if (
        element &&
        element.parentNode
    ) {

        element.remove();

    }

}


/* =========================================================
   SECTION 20
   ERROR MESSAGE
   ========================================================= */

function addErrorMessage(
    message
) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message-wrapper assistant error";


    wrapper.innerHTML = `

        <div class="message-avatar">
            ⚠️
        </div>

        <div class="message-content">

            <div class="message-text">
                ${escapeHTML(message)}
            </div>

        </div>

    `;


    if (chatContainer) {

        chatContainer.appendChild(
            wrapper
        );

    }


    scrollToBottom();

}


/* =========================================================
   SECTION 21
   FORMAT AI TEXT
   ========================================================= */

function formatAIText(text) {

    if (!text) {

        return "";

    }


    let safeText =
        escapeHTML(text);


    safeText =
        convertCodeBlocks(
            safeText
        );


    safeText =
        convertInlineCode(
            safeText
        );


    safeText =
        convertBold(
            safeText
        );


    safeText =
        convertItalic(
            safeText
        );


    safeText =
        convertHeadings(
            safeText
        );


    safeText =
        convertLists(
            safeText
        );


    safeText =
        convertLinks(
            safeText
        );


    safeText =
        convertLineBreaks(
            safeText
        );


    return safeText;

}


/* =========================================================
   SECTION 22
   CODE BLOCKS
   ========================================================= */

function convertCodeBlocks(text) {

    return text.replace(
        /```(\w+)?\n?([\s\S]*?)```/g,
        function (
            match,
            language,
            code
        ) {

            const lang =
                language ||
                "code";


            const escapedCode =
                code
                    .replace(
                        /</g,
                        "&lt;"
                    )
                    .replace(
                        />/g,
                        "&gt;"
                    );


            return `

                <div class="code-block">

                    <div class="code-header">

                        <span>
                            ${escapeHTML(lang)}
                        </span>

                        <button
                            class="copy-code-btn"
                            onclick="copyCodeFromButton(this)"
                        >
                            Copy
                        </button>

                    </div>

                    <pre><code>${escapedCode}</code></pre>

                </div>

            `;

        }
    );

}


/* =========================================================
   SECTION 23
   INLINE CODE
   ========================================================= */

function convertInlineCode(text) {

    return text.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
    );

}


/* =========================================================
   SECTION 24
   BOLD
   ========================================================= */

function convertBold(text) {

    return text.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

}


/* =========================================================
   SECTION 25
   ITALIC
   ========================================================= */

function convertItalic(text) {

    return text.replace(
        /(^|[^*])\*([^*]+)\*(?!\*)/g,
        "$1<em>$2</em>"
    );

}


/* =========================================================
   SECTION 26
   HEADINGS
   ========================================================= */

function convertHeadings(text) {

    return text.replace(
        /^### (.*)$/gm,
        "<h3>$1</h3>"
    ).replace(
        /^## (.*)$/gm,
        "<h2>$1</h2>"
    ).replace(
        /^# (.*)$/gm,
        "<h1>$1</h1>"
    );

}


/* =========================================================
   SECTION 27
   LISTS
   ========================================================= */

function convertLists(text) {

    return text.replace(
        /^[\-\*] (.*)$/gm,
        "<li>$1</li>"
    );

}


/* =========================================================
   SECTION 28
   LINKS
   ========================================================= */

function convertLinks(text) {

    return text.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

}


/* =========================================================
   SECTION 29
   LINE BREAKS
   ========================================================= */

function convertLineBreaks(text) {

    return text.replace(
        /\n/g,
        "<br>"
    );

}


/* =========================================================
   SECTION 30
   ESCAPE HTML
   ========================================================= */

function escapeHTML(text) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   SECTION 31
   STRIP MARKDOWN
   ========================================================= */

function stripMarkdown(text) {

    return String(text)
        .replace(
            /```[\s\S]*?```/g,
            ""
        )
        .replace(
            /`([^`]+)`/g,
            "$1"
        )
        .replace(
            /\*\*(.*?)\*\*/g,
            "$1"
        )
        .replace(
            /\*(.*?)\*/g,
            "$1"
        )
        .replace(
            /#{1,6}\s/g,
            ""
        )
        .replace(
            /\[([^\]]+)\]\([^)]+\)/g,
            "$1"
        );

}


/* =========================================================
   SECTION 32
   CODE COPY
   ========================================================= */

function initializeCodeCopyButtons(
    container
) {

    if (!container) return;


    const buttons =
        container.querySelectorAll(
            ".copy-code-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    copyCodeFromButton(
                        button
                    );

                }
            );

        }
    );

}


function copyCodeFromButton(
    button
) {

    const codeBlock =
        button.closest(
            ".code-block"
        );


    if (!codeBlock) return;


    const code =
        codeBlock.querySelector(
            "code"
        );


    if (!code) return;


    copyText(
        code.innerText
    );


    const oldText =
        button.textContent;


    button.textContent =
        "Copied!";


    setTimeout(
        function () {

            button.textContent =
                oldText;

        },
        1500
    );

}


/* =========================================================
   SECTION 33
   COPY TEXT
   ========================================================= */

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );


        showToast(
            "Copied!"
        );

    } catch (error) {

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        document.body.appendChild(
            textarea
        );


        textarea.select();


        try {

            document.execCommand(
                "copy"
            );

            showToast(
                "Copied!"
            );

        } catch (copyError) {

            showToast(
                "Copy failed"
            );

        }


        textarea.remove();

    }

}


/* =========================================================
   SECTION 34
   REGENERATE
   ========================================================= */

async function regenerateMessage() {

    if (isGenerating) return;


    const conversation =
        getCurrentConversation();


    if (!conversation) return;


    const lastUserIndex =
        findLastUserMessageIndex(
            conversation.messages
        );


    if (
        lastUserIndex === -1
    ) {

        showToast(
            "No user message found."
        );

        return;

    }


    conversation.messages =
        conversation.messages.slice(
            0,
            lastUserIndex + 1
        );


    saveConversations();

    renderCurrentConversation();


    const lastUser =
        conversation.messages[
            lastUserIndex
        ];


    if (!lastUser) return;


    const message =
        lastUser.content;


    const loading =
        createLoadingMessage();


    isGenerating = true;

    updateSendButton();


    try {

        const response =
            await callAIAPI(
                message,
                lastUser.image,
                conversation.messages
            );


        removeLoadingMessage(
            loading
        );


        if (
            response &&
            response.success
        ) {

            const aiText =
                response.text;


            const aiMessage = {

                id:
                    createMessageId(),

                role:
                    "assistant",

                content:
                    aiText,

                timestamp:
                    new Date().toISOString()

            };


            conversation.messages.push(
                aiMessage
            );


            saveConversations();


            await renderAIMessageAnimated(
                aiText,
                aiMessage.id
            );

        } else {

            addErrorMessage(
                response?.error ||
                "Regeneration failed."
            );

        }

    } catch (error) {

        removeLoadingMessage(
            loading
        );


        addErrorMessage(
            getReadableError(error)
        );

    } finally {

        isGenerating = false;

        updateSendButton();

    }

}


/* =========================================================
   SECTION 35
   FIND LAST USER MESSAGE
   ========================================================= */

function findLastUserMessageIndex(
    messages
) {

    for (
        let i =
            messages.length - 1;
        i >= 0;
        i--
    ) {

        if (
            messages[i].role ===
            "user"
        ) {

            return i;

        }

    }


    return -1;

}


/* =========================================================
   SECTION 36
   CLEAR CHAT
   ========================================================= */

function clearCurrentChat() {

    const conversation =
        getCurrentConversation();


    if (!conversation) return;


    const confirmed =
        confirm(
            "Are you sure you want to clear this chat?"
        );


    if (!confirmed) return;


    conversation.messages = [];

    conversation.title =
        "New Chat";

    conversation.updatedAt =
        new Date().toISOString();


    saveConversations();


    renderCurrentConversation();

    clearInput();

    removeSelectedImage();

    showToast(
        "Chat cleared"
    );

}


/* =========================================================
   SECTION 37
   DELETE CHAT
   ========================================================= */

function deleteConversation(
    conversationId
) {

    const index =
        conversations.findIndex(
            chat =>
                chat.id ===
                conversationId
        );


    if (index === -1) return;


    const confirmed =
        confirm(
            "Delete this chat?"
        );


    if (!confirmed) return;


    conversations.splice(
        index,
        1
    );


    if (
        currentConversationId ===
        conversationId
    ) {

        if (conversations.length > 0) {

            currentConversationId =
                conversations[0].id;

        } else {

            createNewChat();

            return;

        }

    }


    saveConversations();

    saveCurrentConversationId();

    renderCurrentConversation();

    renderChatHistory();

}


/* =========================================================
   SECTION 38
   CHAT HISTORY
   ========================================================= */

function renderChatHistory() {

    const historyContainer =
        document.getElementById(
            "chatHistory"
        ) ||
        document.querySelector(
            ".chat-history"
        );


    if (!historyContainer) return;


    historyContainer.innerHTML = "";


    conversations.forEach(
        function (conversation) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "history-item";


            if (
                conversation.id ===
                currentConversationId
            ) {

                item.classList.add(
                    "active"
                );

            }


            item.innerHTML = `

                <div
                    class="history-title"
                >
                    ${escapeHTML(
                        conversation.title ||
                        "New Chat"
                    )}
                </div>

                <button
                    class="history-delete"
                    title="Delete chat"
                >
                    🗑️
                </button>

            `;


            const title =
                item.querySelector(
                    ".history-title"
                );


            title.addEventListener(
                "click",
                function () {

                    switchConversation(
                        conversation.id
                    );

                }
            );


            const deleteButton =
                item.querySelector(
                    ".history-delete"
                );


            deleteButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    deleteConversation(
                        conversation.id
                    );

                }
            );


            historyContainer.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   SECTION 39
   SWITCH CONVERSATION
   ========================================================= */

function switchConversation(
    conversationId
) {

    const exists =
        conversations.some(
            chat =>
                chat.id ===
                conversationId
        );


    if (!exists) return;


    currentConversationId =
        conversationId;


    saveCurrentConversationId();

    renderCurrentConversation();

    closeSidebar();

}


/* =========================================================
   SECTION 40
   IMAGE SELECTION
   ========================================================= */

function handleImageSelection(
    event
) {

    const file =
        event.target.files?.[0];


    if (!file) return;


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        showToast(
            "Please select an image."
        );

        return;

    }


    const maxSize =
        10 * 1024 * 1024;


    if (
        file.size > maxSize
    ) {

        showToast(
            "Image must be smaller than 10MB."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (loadEvent) {

            selectedImage =
                loadEvent.target.result;

            selectedImageName =
                file.name;

            selectedImageType =
                file.type;


            showImagePreview(
                selectedImage,
                file.name
            );

        };


    reader.onerror =
        function () {

            showToast(
                "Could not read image."
            );

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   SECTION 41
   SHOW IMAGE PREVIEW
   ========================================================= */

function showImagePreview(
    imageData,
    fileName
) {

    if (!imagePreview) {

        createDynamicImagePreview();

        return;

    }


    imagePreview.innerHTML = `

        <div class="selected-image-container">

            <img
                src="${imageData}"
                alt="Selected image"
            >

            <div class="selected-image-name">
                ${escapeHTML(fileName)}
            </div>

            <button
                id="dynamicRemoveImage"
                type="button"
            >
                ✕
            </button>

        </div>

    `;


    imagePreview.style.display =
        "block";


    const remove =
        document.getElementById(
            "dynamicRemoveImage"
        );


    if (remove) {

        remove.addEventListener(
            "click",
            function () {

                removeSelectedImage();

            }
        );

    }

}


/* =========================================================
   SECTION 42
   DYNAMIC IMAGE PREVIEW
   ========================================================= */

function createDynamicImagePreview() {

    if (!userInput) return;


    let container =
        document.getElementById(
            "dynamicImagePreview"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );


        container.id =
            "dynamicImagePreview";


        container.className =
            "image-preview";


        userInput.parentElement?.insertBefore(
            container,
            userInput
        );

    }


    imagePreview =
        container;


    showImagePreview(
        selectedImage,
        selectedImageName
    );

}


/* =========================================================
   SECTION 43
   REMOVE IMAGE
   ========================================================= */

function removeSelectedImage() {

    selectedImage =
        null;

    selectedImageName =
        "";

    selectedImageType =
        "";


    if (imagePreview) {

        imagePreview.innerHTML =
            "";

        imagePreview.style.display =
            "none";

    }


    if (imageInput) {

        imageInput.value =
            "";

    }

}


/* =========================================================
   SECTION 44
   IMAGE VIEWER
   ========================================================= */

function openImageViewer(
    imageSrc
) {

    const overlay =
        document.createElement(
            "div"
        );


    overlay.className =
        "image-viewer-overlay";


    overlay.innerHTML = `

        <div class="image-viewer-content">

            <button
                class="close-image-viewer"
            >
                ✕
            </button>

            <img
                src="${imageSrc}"
                alt="Image"
            >

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                overlay
            ) {

                overlay.remove();

            }

        }
    );


    const close =
        overlay.querySelector(
            ".close-image-viewer"
        );


    close.addEventListener(
        "click",
        function () {

            overlay.remove();

        }
    );

}


/* =========================================================
   SECTION 45
   DRAG AND DROP
   ========================================================= */

function setupDragAndDrop() {

    if (!chatContainer) return;


    chatContainer.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            chatContainer.classList.add(
                "drag-over"
            );

        }
    );


    chatContainer.addEventListener(
        "dragleave",
        function () {

            chatContainer.classList.remove(
                "drag-over"
            );

        }
    );


    chatContainer.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            chatContainer.classList.remove(
                "drag-over"
            );


            const files =
                event.dataTransfer.files;


            if (
                files &&
                files.length > 0
            ) {

                handleImageFile(
                    files[0]
                );

            }

        }
    );

}


/* =========================================================
   SECTION 46
   HANDLE IMAGE FILE
   ========================================================= */

function handleImageFile(
    file
) {

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        showToast(
            "Only images are supported."
        );

        return;

    }


    const fakeEvent = {

        target: {

            files: [file]

        }

    };


    handleImageSelection(
        fakeEvent
    );

}


/* =========================================================
   SECTION 47
   PASTE IMAGE
   ========================================================= */

function setupPasteImage() {

    document.addEventListener(
        "paste",
        function (event) {

            const items =
                event.clipboardData?.items;


            if (!items) return;


            for (
                let i = 0;
                i < items.length;
                i++
            ) {

                const item =
                    items[i];


                if (
                    item.type.startsWith(
                        "image/"
                    )
                ) {

                    const file =
                        item.getAsFile();


                    if (file) {

                        handleImageFile(
                            file
                        );

                    }


                    break;

                }

            }

        }
    );

}


/* =========================================================
   SECTION 48
   VOICE RECOGNITION
   ========================================================= */

function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        if (voiceButton) {

            voiceButton.style.display =
                "none";

        }

        console.warn(
            "Speech recognition is not supported."
        );

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        true;


    recognition.lang =
        "en-IN";


    recognition.onstart =
        function () {

            isListening =
                true;

            updateVoiceButton();

            showToast(
                "Listening..."
            );

        };


    recognition.onresult =
        function (event) {

            let transcript =
                "";


            for (
                let i =
                    event.resultIndex;
                i <
                    event.results.length;
                i++
            ) {

                transcript +=
                    event.results[i][0]
                        .transcript;

            }


            if (userInput) {

                userInput.value =
                    transcript;

                autoResizeInput();

                updateCharacterCounter();

            }

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );


            showToast(
                "Voice input error: " +
                event.error
            );

        };


    recognition.onend =
        function () {

            isListening =
                false;

            updateVoiceButton();

        };

}


/* =========================================================
   SECTION 49
   TOGGLE VOICE
   ========================================================= */

function toggleVoiceRecognition() {

    if (!recognition) {

        showToast(
            "Voice input is not supported in this browser."
        );

        return;

    }


    if (isListening) {

        recognition.stop();

        return;

    }


    try {

        recognition.start();

    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   SECTION 50
   UPDATE VOICE BUTTON
   ========================================================= */

function updateVoiceButton() {

    if (!voiceButton) return;


    if (isListening) {

        voiceButton.classList.add(
            "listening"
        );

        voiceButton.textContent =
            "⏹️";

        voiceButton.title =
            "Stop listening";

    } else {

        voiceButton.classList.remove(
            "listening"
        );

        voiceButton.textContent =
            "🎤";

        voiceButton.title =
            "Voice input";

    }

}


/* =========================================================
   SECTION 51
   TEXT TO SPEECH
   ========================================================= */

function speakText(
    text
) {

    if (
        !("speechSynthesis" in window)
    ) {

        showToast(
            "Text-to-speech is not supported."
        );

        return;

    }


    stopSpeaking();


    speechUtterance =
        new SpeechSynthesisUtterance(
            text
        );


    speechUtterance.rate =
        1;


    speechUtterance.pitch =
        1;


    speechUtterance.volume =
        1;


    speechUtterance.lang =
        detectLanguage(text);


    speechUtterance.onstart =
        function () {

            isSpeaking =
                true;

        };


    speechUtterance.onend =
        function () {

            isSpeaking =
                false;

            speechUtterance =
                null;

        };


    speechUtterance.onerror =
        function () {

            isSpeaking =
                false;

        };


    speechSynthesis.speak(
        speechUtterance
    );

}


/* =========================================================
   SECTION 52
   STOP SPEAKING
   ========================================================= */

function stopSpeaking() {

    if (
        "speechSynthesis" in window
    ) {

        speechSynthesis.cancel();

    }


    isSpeaking =
        false;

    speechUtterance =
        null;

}


/* =========================================================
   SECTION 53
   LANGUAGE DETECTION
   ========================================================= */

function detectLanguage(
    text
) {

    if (!text) {

        return "en-IN";

    }


    const hindiCharacters =
        text.match(
            /[\u0900-\u097F]/g
        );


    if (
        hindiCharacters &&
        hindiCharacters.length > 2
    ) {

        return "hi-IN";

    }


    const hinglishWords =
        [
            "hai",
            "hain",
            "kya",
            "kaise",
            "ka",
            "ke",
            "ki",
            "mujhe",
            "tum",
            "aap",
            "batao",
            "karna",
            "karo",
            "nahi",
            "nahin",
            "haan"
        ];


    const lower =
        text.toLowerCase();


    const found =
        hinglishWords.filter(
            word =>
                lower.includes(
                    word
                )
        ).length;


    if (found >= 2) {

        return "hi-IN";

    }


    return "en-IN";

}


/* =========================================================
   SECTION 54
   AUTO RESIZE INPUT
   ========================================================= */

function autoResizeInput() {

    if (!userInput) return;


    userInput.style.height =
        "auto";


    const maxHeight =
        180;


    userInput.style.height =
        Math.min(
            userInput.scrollHeight,
            maxHeight
        ) + "px";

}


/* =========================================================
   SECTION 55
   CHARACTER COUNTER
   ========================================================= */

function updateCharacterCounter() {

    if (
        !userInput ||
        !characterCounter
    ) {

        return;

    }


    const length =
        userInput.value.length;


    characterCounter.textContent =
        `${length}`;

}


/* =========================================================
   SECTION 56
   CLEAR INPUT
   ========================================================= */

function clearInput() {

    if (!userInput) return;


    userInput.value =
        "";


    autoResizeInput();

    updateCharacterCounter();

    userInput.focus();

}


/* =========================================================
   SECTION 57
   SCROLL TO BOTTOM
   ========================================================= */

function scrollToBottom() {

    if (!chatContainer) return;


    requestAnimationFrame(
        function () {

            chatContainer.scrollTo({

                top:
                    chatContainer.scrollHeight,

                behavior:
                    "smooth"

            });

        }
    );

}


/* =========================================================
   SECTION 58
   SIDEBAR
   ========================================================= */

function toggleSidebar() {

    if (!sidebar) return;


    sidebar.classList.toggle(
        "open"
    );


    if (sidebarOverlay) {

        sidebarOverlay.classList.toggle(
            "active"
        );

    }

}


function closeSidebar() {

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   SECTION 59
   SEND BUTTON STATE
   ========================================================= */

function updateSendButton() {

    if (!sendButton) return;


    if (isGenerating) {

        sendButton.disabled =
            false;

        sendButton.dataset.originalText =
            sendButton.textContent;

        sendButton.textContent =
            "⏹";


        sendButton.title =
            "Stop generation";


        sendButton.onclick =
            function () {

                stopGeneration();

            };

    } else {

        sendButton.disabled =
            false;


        sendButton.textContent =
            "➤";


        sendButton.title =
            "Send";


        sendButton.onclick =
            function () {

                sendMessage();

            };

    }

}


/* =========================================================
   SECTION 60
   STOP GENERATION
   ========================================================= */

function stopGeneration() {

    stopGenerationRequested =
        true;

    isGenerating =
        false;


    updateSendButton();


    showToast(
        "Generation stopped"
    );

}


/* =========================================================
   SECTION 61
   READABLE ERROR
   ========================================================= */

function getReadableError(
    error
) {

    if (!error) {

        return "Unknown error.";

    }


    if (
        error.name ===
        "AbortError"
    ) {

        return "Request timed out.";

    }


    if (
        error instanceof
        TypeError
    ) {

        return "Network error. Check your internet connection and make sure ANSH AI server is running.";

    }


    return (
        error.message ||
        "Something went wrong."
    );

}


/* =========================================================
   SECTION 62
   TOAST
   ========================================================= */

function showToast(
    message
) {

    let toast =
        document.getElementById(
            "anshToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "anshToast";


        toast.className =
            "ansh-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2000
        );

}


/* =========================================================
   SECTION 63
   SLEEP
   ========================================================= */

function sleep(
    milliseconds
) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


/* =========================================================
   SECTION 64
   SEARCH CHAT HISTORY
   ========================================================= */

function searchChats(
    searchTerm
) {

    const term =
        searchTerm
            .toLowerCase()
            .trim();


    if (!term) {

        renderChatHistory();

        return;

    }


    const historyContainer =
        document.getElementById(
            "chatHistory"
        );


    if (!historyContainer) return;


    historyContainer.innerHTML =
        "";


    conversations
        .filter(
            conversation =>
                conversation.title
                    .toLowerCase()
                    .includes(term)
        )
        .forEach(
            function (conversation) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "history-item";


                item.innerHTML = `

                    <div
                        class="history-title"
                    >
                        ${escapeHTML(
                            conversation.title
                        )}
                    </div>

                `;


                item.addEventListener(
                    "click",
                    function () {

                        switchConversation(
                            conversation.id
                        );

                    }
                );


                historyContainer.appendChild(
                    item
                );

            }
        );

}


/* =========================================================
   SECTION 65
   EXPORT CHAT
   ========================================================= */

function exportCurrentChat() {

    const conversation =
        getCurrentConversation();


    if (!conversation) {

        showToast(
            "No chat found."
        );

        return;

    }


    let text =
        `ANSH AI\n`;

    text +=
        `Chat: ${conversation.title}\n`;

    text +=
        `================================\n\n`;


    conversation.messages.forEach(
        function (message) {

            const role =
                message.role ===
                "user"
                    ? "You"
                    : "ANSH AI";


            text +=
                `${role}:\n`;

            text +=
                `${message.content || ""}\n\n`;

        }
    );


    const blob =
        new Blob(
            [text],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const anchor =
        document.createElement(
            "a"
        );


    anchor.href =
        url;


    anchor.download =
        sanitizeFilename(
            conversation.title
        ) +
        ".txt";


    document.body.appendChild(
        anchor
    );


    anchor.click();


    anchor.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Chat exported"
    );

}


/* =========================================================
   SECTION 66
   SANITIZE FILENAME
   ========================================================= */

function sanitizeFilename(
    name
) {

    return String(name)
        .replace(
            /[<>:"/\\|?*]+/g,
            "_"
        )
        .substring(
            0,
            100
        );

}


/* =========================================================
   SECTION 67
   DOWNLOAD IMAGE
   ========================================================= */

function downloadImage(
    imageSrc,
    filename = "ansh-ai-image.png"
) {

    const anchor =
        document.createElement(
            "a"
        );


    anchor.href =
        imageSrc;


    anchor.download =
        filename;


    document.body.appendChild(
        anchor
    );


    anchor.click();


    anchor.remove();

}


/* =========================================================
   SECTION 68
   DETECT MOBILE
   ========================================================= */

function isMobileDevice() {

    return (
        window.innerWidth <=
        768
    );

}


/* =========================================================
   SECTION 69
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    function () {

        if (
            window.innerWidth >
            768
        ) {

            closeSidebar();

        }

    }
);


/* =========================================================
   SECTION 70
   BEFORE UNLOAD
   ========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        saveConversations();

        stopSpeaking();

    }
);


/* =========================================================
   SECTION 71
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() ===
            "k"
        ) {

            event.preventDefault();


            if (userInput) {

                userInput.focus();

            }

        }


        if (
            event.ctrlKey &&
            event.shiftKey &&
            event.key.toLowerCase() ===
            "n"
        ) {

            event.preventDefault();

            createNewChat();

        }


        if (
            event.key ===
            "Escape"
        ) {

            closeSidebar();

            stopSpeaking();

        }

    }
);


/* =========================================================
   SECTION 72
   GLOBAL FUNCTIONS
   ========================================================= */

window.sendMessage =
    sendMessage;

window.createNewChat =
    createNewChat;

window.clearCurrentChat =
    clearCurrentChat;

window.deleteConversation =
    deleteConversation;

window.copyText =
    copyText;

window.copyCodeFromButton =
    copyCodeFromButton;

window.speakText =
    speakText;

window.stopSpeaking =
    stopSpeaking;

window.toggleVoiceRecognition =
    toggleVoiceRecognition;

window.removeSelectedImage =
    removeSelectedImage;

window.exportCurrentChat =
    exportCurrentChat;


/* =========================================================
   SECTION 73
   API RESPONSE NORMALIZER
   ========================================================= */

function normalizeAIResponse(
    data
) {

    if (!data) {

        return "";

    }


    if (
        typeof data ===
        "string"
    ) {

        return data;

    }


    if (
        data.text
    ) {

        return data.text;

    }


    if (
        data.response
    ) {

        return data.response;

    }


    if (
        data.answer
    ) {

        return data.answer;

    }


    if (
        data.message &&
        typeof data.message ===
        "string"
    ) {

        return data.message;

    }


    if (
        data.content
    ) {

        return data.content;

    }


    if (
        data.candidates &&
        data.candidates[0]
    ) {

        const candidate =
            data.candidates[0];


        if (
            candidate.content &&
            candidate.content.parts
        ) {

            return candidate.content.parts
                .map(
                    part =>
                        part.text || ""
                )
                .join("");

        }

    }


    return "";

}


/* =========================================================
   SECTION 74
   DATE FORMATTER
   ========================================================= */

function formatTime(
    timestamp
) {

    if (!timestamp) {

        return "";

    }


    const date =
        new Date(timestamp);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleTimeString(
        [],
        {
            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


/* =========================================================
   SECTION 75
   CHAT DATE
   ========================================================= */

function formatChatDate(
    timestamp
) {

    if (!timestamp) {

        return "";

    }


    const date =
        new Date(timestamp);


    return date.toLocaleDateString(
        [],
        {
            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"
        }
    );

}


/* =========================================================
   SECTION 76
   MESSAGE COUNT
   ========================================================= */

function getMessageCount() {

    const conversation =
        getCurrentConversation();


    if (!conversation) {

        return 0;

    }


    return conversation.messages.length;

}


/* =========================================================
   SECTION 77
   CHAT COUNT
   ========================================================= */

function getConversationCount() {

    return conversations.length;

}


/* =========================================================
   SECTION 78
   MEMORY CLEANUP
   ========================================================= */

function cleanupOldConversations(
    maximum = 100
) {

    if (
        conversations.length <=
        maximum
    ) {

        return;

    }


    conversations.sort(
        function (a, b) {

            return (
                new Date(
                    b.updatedAt
                ) -
                new Date(
                    a.updatedAt
                )
            );

        }
    );


    conversations =
        conversations.slice(
            0,
            maximum
        );


    saveConversations();

}


/* =========================================================
   SECTION 79
   IMPORT CHAT
   ========================================================= */

function importChatFile(
    file
) {

    if (!file) return;


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            try {

                const imported =
                    JSON.parse(
                        event.target.result
                    );


                if (
                    !imported ||
                    !Array.isArray(
                        imported.messages
                    )
                ) {

                    throw new Error(
                        "Invalid chat file."
                    );

                }


                const conversation = {

                    id:
                        createMessageId(),

                    title:
                        imported.title ||
                        "Imported Chat",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString(),

                    messages:
                        imported.messages

                };


                conversations.unshift(
                    conversation
                );


                currentConversationId =
                    conversation.id;


                saveConversations();

                saveCurrentConversationId();

                renderCurrentConversation();


                showToast(
                    "Chat imported"
                );

            } catch (error) {

                console.error(
                    error
                );


                showToast(
                    "Invalid chat file."
                );

            }

        };


    reader.readAsText(
        file
    );

}


/* =========================================================
   SECTION 80
   EXPORT JSON
   ========================================================= */

function exportCurrentChatJSON() {

    const conversation =
        getCurrentConversation();


    if (!conversation) return;


    const blob =
        new Blob(
            [
                JSON.stringify(
                    conversation,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const anchor =
        document.createElement(
            "a"
        );


    anchor.href =
        url;


    anchor.download =
        sanitizeFilename(
            conversation.title
        ) +
        ".json";


    document.body.appendChild(
        anchor
    );


    anchor.click();


    anchor.remove();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   SECTION 81
   CLEAR ALL HISTORY
   ========================================================= */

function clearAllHistory() {

    const confirmed =
        confirm(
            "Delete all ANSH AI chat history?"
        );


    if (!confirmed) return;


    conversations = [];

    currentConversationId =
        null;


    localStorage.removeItem(
        STORAGE_KEY
    );


    localStorage.removeItem(
        CURRENT_CHAT_KEY
    );


    createNewChat();


    showToast(
        "All chat history deleted."
    );

}


/* =========================================================
   SECTION 82
   THEME HELPERS
   ========================================================= */

function setTheme(
    theme
) {

    if (
        theme !==
        "light" &&
        theme !==
        "dark"
    ) {

        return;

    }


    document.documentElement
        .setAttribute(
            "data-theme",
            theme
        );


    localStorage.setItem(
        "ANSH_AI_THEME",
        theme
    );

}


function loadTheme() {

    const saved =
        localStorage.getItem(
            "ANSH_AI_THEME"
        );


    if (saved) {

        setTheme(
            saved
        );

    }

}


/* =========================================================
   SECTION 83
   INITIAL THEME
   ========================================================= */

loadTheme();


/* =========================================================
   SECTION 84
   FOCUS INPUT
   ========================================================= */

function focusInput() {

    if (!userInput) return;


    setTimeout(
        function () {

            userInput.focus();

        },
        50
    );

}


/* =========================================================
   SECTION 85
   CHECK SERVER
   ========================================================= */

async function checkServerStatus() {

    try {

        const response =
            await fetch(
                "/api/health",
                {
                    method:
                        "GET"
                }
            );


        if (response.ok) {

            return true;

        }

    } catch (error) {

        console.warn(
            "Server health check failed."
        );

    }


    return false;

}


/* =========================================================
   SECTION 86
   WAIT FOR SERVER
   ========================================================= */

async function waitForServer(
    attempts = 3
) {

    for (
        let i = 0;
        i < attempts;
        i++
    ) {

        const online =
            await checkServerStatus();


        if (online) {

            return true;

        }


        await sleep(
            1000
        );

    }


    return false;

}


/* =========================================================
   SECTION 87
   NETWORK STATUS
   ========================================================= */

window.addEventListener(
    "online",
    function () {

        showToast(
            "Internet connected."
        );

    }
);


window.addEventListener(
    "offline",
    function () {

        showToast(
            "Internet disconnected."
        );

    }
);


/* =========================================================
   SECTION 88
   AUTO SAVE
   ========================================================= */

setInterval(
    function () {

        saveConversations();

    },
    5000
);


/* =========================================================
   SECTION 89
   LIMIT MESSAGE SIZE
   ========================================================= */

const MAX_MESSAGE_LENGTH =
    20000;


function validateMessage(
    message
) {

    if (
        message.length >
        MAX_MESSAGE_LENGTH
    ) {

        showToast(
            "Message is too long."
        );

        return false;

    }


    return true;

}


/* =========================================================
   SECTION 90
   VALIDATED SEND
   ========================================================= */

const originalSendMessage =
    sendMessage;


/* =========================================================
   SECTION 91
   IMAGE TYPE VALIDATION
   ========================================================= */

function isSupportedImage(
    file
) {

    if (!file) {

        return false;

    }


    const supportedTypes =
        [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];


    return supportedTypes.includes(
        file.type
    );

}


/* =========================================================
   SECTION 92
   IMAGE SIZE FORMAT
   ========================================================= */

function formatFileSize(
    bytes
) {

    if (
        bytes === 0
    ) {

        return "0 Bytes";

    }


    const units =
        [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        parseFloat(
            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(2)
        ) +
        " " +
        units[index]
    );

}


/* =========================================================
   SECTION 93
   CHAT TITLE UPDATE
   ========================================================= */

function updateChatTitle(
    title
) {

    const conversation =
        getCurrentConversation();


    if (!conversation) return;


    conversation.title =
        generateChatTitle(
            title
        );


    conversation.updatedAt =
        new Date().toISOString();


    saveConversations();

    renderChatHistory();

}


/* =========================================================
   SECTION 94
   MESSAGE SEARCH
   ========================================================= */

function searchMessages(
    term
) {

    const conversation =
        getCurrentConversation();


    if (!conversation) return [];


    const query =
        term
            .toLowerCase()
            .trim();


    if (!query) {

        return conversation.messages;

    }


    return conversation.messages.filter(
        message =>
            String(
                message.content ||
                ""
            )
                .toLowerCase()
                .includes(query)
    );

}


/* =========================================================
   SECTION 95
   RESET APP
   ========================================================= */

function resetANSHAI() {

    const confirmed =
        confirm(
            "Reset ANSH AI completely?"
        );


    if (!confirmed) return;


    localStorage.removeItem(
        STORAGE_KEY
    );


    localStorage.removeItem(
        CURRENT_CHAT_KEY
    );


    conversations = [];

    currentConversationId =
        null;


    stopSpeaking();

    removeSelectedImage();

    createNewChat();


    showToast(
        "ANSH AI reset successfully."
    );

}


/* =========================================================
   SECTION 96
   DEBUG INFORMATION
   ========================================================= */

function getDebugInfo() {

    return {

        conversations:
            conversations.length,

        currentConversation:
            currentConversationId,

        messages:
            getMessageCount(),

        isGenerating:
            isGenerating,

        isListening:
            isListening,

        isSpeaking:
            isSpeaking,

        imageSelected:
            Boolean(
                selectedImage
            ),

        online:
            navigator.onLine,

        mobile:
            isMobileDevice(),

        userAgent:
            navigator.userAgent

    };

}


/* =========================================================
   SECTION 97
   CONSOLE MESSAGE
   ========================================================= */

console.log(
    "%cANSH AI",
    "font-size:24px;font-weight:bold;"
);


console.log(
    "ANSH AI frontend loaded."
);


console.log(
    "Type getANSHDebug() for debug information."
);


/* =========================================================
   SECTION 98
   DEBUG GLOBAL
   ========================================================= */

window.getANSHDebug =
    getDebugInfo;


/* =========================================================
   SECTION 99
   FINAL INITIALIZATION
   ========================================================= */

setTimeout(
    function () {

        if (!chatContainer) {

            console.warn(
                "ANSH AI: Chat container not found."
            );

        }


        if (!userInput) {

            console.warn(
                "ANSH AI: User input not found."
            );

        }


        if (!sendButton) {

            console.warn(
                "ANSH AI: Send button not found."
            );

        }


        renderChatHistory();

        focusInput();

    },
    100
);


/* =========================================================
   END OF ANSH AI SCRIPT
   ========================================================= */