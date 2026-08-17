// =====================================================
// ANSH AI - FRONTEND
// =====================================================

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const historyList = document.getElementById("historyList");
let selectedImage = null;

let chats =
    JSON.parse(localStorage.getItem("anshAIChats")) || [];

let currentChat = [];


// =====================================================
// START
// =====================================================

window.onload = function () {

    loadHistory();

    userInput.focus();

};


// =====================================================
// SEND MESSAGE
// =====================================================

async function sendMessage() {

    const text = userInput.value.trim();

    if (text === "") return;


    const welcome =
        document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }


    addMessage(text, "user");


    currentChat.push({
        role: "user",
        text: text
    });


    userInput.value = "";

    autoResize();

    showTyping();


    try {

        const response =
           await fetch("/.netlify/functions/chat", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    messages:
                        currentChat.map(message => ({

                            role:
                                message.role === "ai"
                                    ? "assistant"
                                    : "user",

                            content:
                                message.text

                        })),
                        image: selectedImage

                })

            });


        const data =
            await response.json();


        removeTyping();


        if (!response.ok) {

            console.error(data);

            throw new Error(
                data.error ||
                "AI request failed"
            );

        }


        const answer =
            data.answer;


        addMessage(
            answer,
            "ai"
        );


        currentChat.push({

            role: "ai",

            text: answer

        });


        saveCurrentChat();


    }

    catch (error) {

        console.error(
            "ANSH AI ERROR:",
            error
        );


        removeTyping();


        addMessage(

            "❌ AI Error:<br><br>" +
            escapeHTML(error.message),

            "ai"

        );

    }

}


// =====================================================
// KEYBOARD
// =====================================================

function handleKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();

    }

}


// =====================================================
// ADD MESSAGE
// =====================================================

function addMessage(text, type) {

    const message =
        document.createElement("div");

    message.className =
        "message " +
        (
            type === "user"
                ? "user-message"
                : "ai-message"
        );


    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar";

    avatar.textContent =
        type === "user"
            ? "👤"
            : "🤖";


    const wrapper =
        document.createElement("div");


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    content.innerHTML =
        formatText(text);


    wrapper.appendChild(
        content
    );


    if (type === "ai") {

        const actions =
            document.createElement("div");

        actions.className =
            "message-actions";


        const copy =
            document.createElement("button");

        copy.textContent =
            "📋 Copy";

        copy.onclick =
            function () {

                copyText(text);

            };


        const speakButton =
            document.createElement("button");

        speakButton.textContent =
            "🔊 Speak";

        speakButton.onclick =
            function () {

                speak(text);

            };


        actions.appendChild(copy);

        actions.appendChild(
            speakButton
        );


        wrapper.appendChild(
            actions
        );

    }


    message.appendChild(
        avatar
    );

    message.appendChild(
        wrapper
    );


    chatBox.appendChild(
        message
    );


    scrollToBottom();

}


// =====================================================
// FORMAT TEXT
// =====================================================

function formatText(text) {

    let safe =
        escapeHTML(text);


    // Code blocks

    safe = safe.replace(

        /```(?:\w+)?\s*([\s\S]*?)```/g,

        "<pre><code>$1</code></pre>"

    );


    // Bold

    safe = safe.replace(

        /\*\*(.*?)\*\*/g,

        "<strong>$1</strong>"

    );


    // Italic

    safe = safe.replace(

        /\*(.*?)\*/g,

        "<em>$1</em>"

    );


    // New lines

    safe =
        safe.replace(
            /\n/g,
            "<br>"
        );


    return safe;

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;

}


// =====================================================
// TYPING
// =====================================================

function showTyping() {

    const typing =
        document.createElement("div");

    typing.id =
        "typing";

    typing.className =
        "message ai-message";


    typing.innerHTML = `

        <div class="avatar">
            🤖
        </div>

        <div class="message-content">

            <div class="typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;


    chatBox.appendChild(
        typing
    );


    scrollToBottom();

}


function removeTyping() {

    const typing =
        document.getElementById(
            "typing"
        );

    if (typing) {

        typing.remove();

    }

}


// =====================================================
// COPY
// =====================================================

function copyText(text) {

    const clean =
        String(text)
            .replace(
                /<[^>]*>/g,
                ""
            );


    navigator.clipboard
        .writeText(clean);

}


// =====================================================
// SPEAK
// =====================================================

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        alert(
            "Your browser does not support voice."
        );

        return;

    }


    speechSynthesis.cancel();


    const clean =
        String(text)
            .replace(
                /<[^>]*>/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    const speech =
        new SpeechSynthesisUtterance(
            clean
        );


    if (
        /[\u0900-\u097F]/.test(
            clean
        )
    ) {

        speech.lang =
            "hi-IN";

    }

    else {

        speech.lang =
            "en-US";

    }


    speech.rate =
        0.95;


    speechSynthesis.speak(
        speech
    );

}


// =====================================================
// VOICE INPUT
// =====================================================

function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice input के लिए Chrome इस्तेमाल करें."
        );

        return;

    }


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "hi-IN";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.onstart =
        function () {

            document
                .getElementById(
                    "micButton"
                )
                .textContent =
                "🔴";

        };


    recognition.onresult =
        function (event) {

            userInput.value =
                event
                    .results[0][0]
                    .transcript;


            autoResize();

        };


    recognition.onend =
        function () {

            document
                .getElementById(
                    "micButton"
                )
                .textContent =
                "🎤";

        };


    recognition.start();

}


// =====================================================
// NEW CHAT
// =====================================================

function newChat() {

    currentChat = [];


    chatBox.innerHTML = `

        <div id="welcome"
             class="welcome">

            <div class="welcome-logo">
                🤖
            </div>

            <h1>
                Hello, I'm
                <span>ANSH AI</span>
            </h1>

            <p>
                आपका Personal AI Assistant
            </p>

            <div class="languages">
                🇮🇳 Hindi • 🇬🇧 English • Hinglish
            </div>

        </div>

    `;


    userInput.focus();

}


// =====================================================
// SUGGESTION
// =====================================================

function useSuggestion(text) {

    userInput.value =
        text;

    sendMessage();

}


// =====================================================
// SAVE CHAT
// =====================================================

function saveCurrentChat() {

    if (
        currentChat.length === 0
    ) {

        return;

    }


    const first =
        currentChat.find(
            item =>
                item.role === "user"
        );


    const title =
        first
            ? first.text.substring(
                0,
                35
            )
            : "New Chat";


    const chat = {

        id: Date.now(),

        title: title,

        messages: [
            ...currentChat
        ]

    };


    chats.unshift(
        chat
    );


    chats =
        chats.slice(
            0,
            30
        );


    localStorage.setItem(

        "anshAIChats",

        JSON.stringify(chats)

    );


    loadHistory();

}


// =====================================================
// LOAD HISTORY
// =====================================================

function loadHistory() {

    historyList.innerHTML =
        "";


    chats.forEach(
        chat => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "history-item";


            item.textContent =
                "💬 " +
                chat.title;


            item.onclick =
                function () {

                    loadChat(
                        chat.id
                    );

                };


            historyList.appendChild(
                item
            );

        }
    );

}


// =====================================================
// LOAD CHAT
// =====================================================

function loadChat(id) {

    const chat =
        chats.find(
            c =>
                c.id === id
        );


    if (!chat) return;


    currentChat =
        [
            ...chat.messages
        ];


    chatBox.innerHTML =
        "";


    currentChat.forEach(
        message => {

            addMessage(
                message.text,
                message.role
            );

        }
    );

}


// =====================================================
// CLEAR CHATS
// =====================================================

function clearAllChats() {

    if (
        !confirm(
            "क्या आप सभी chats delete करना चाहते हैं?"
        )
    ) {

        return;

    }


    chats = [];

    currentChat = [];


    localStorage.removeItem(
        "anshAIChats"
    );


    loadHistory();

    newChat();

}


// =====================================================
// THEME
// =====================================================

function toggleTheme() {

    document.body
        .classList
        .toggle("light");


    const theme =
        document.body
            .classList
            .contains("light")
            ? "light"
            : "dark";


    localStorage.setItem(
        "anshTheme",
        theme
    );

}


if (
    localStorage.getItem(
        "anshTheme"
    ) === "light"
) {

    document.body
        .classList
        .add("light");

}


// =====================================================
// SIDEBAR
// =====================================================

function toggleSidebar() {

    document
        .getElementById(
            "sidebar"
        )
        .classList
        .toggle("open");

}


// =====================================================
// AUTO RESIZE
// =====================================================

userInput.addEventListener(
    "input",
    autoResize
);


function autoResize() {

    userInput.style.height =
        "auto";


    userInput.style.height =
        Math.min(
            userInput.scrollHeight,
            150
        ) + "px";

}


// =====================================================
// SCROLL
// =====================================================

function scrollToBottom() {

    setTimeout(
        () => {

            chatBox.scrollTop =
                chatBox.scrollHeight;

        },
        50
    );

}
document.getElementById("imageInput")
.addEventListener("change", function(e){

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(event){

        selectedImage = event.target.result;

        document.getElementById("imagePreview").innerHTML =
        `<img src="${selectedImage}">`;

    };

    reader.readAsDataURL(file);

});

// =====================================
// AI IMAGE GENERATOR
// =====================================

async function generateImage() {

    const promptInput =
        document.getElementById("imagePrompt");

    const status =
        document.getElementById("imageStatus");

    const image =
        document.getElementById("generatedImage");

    // Prompt lena
    const prompt = promptInput.value.trim();

    // Agar prompt empty hai
    if (prompt === "") {

        status.innerText =
            "⚠️ Pehle image ka description likho.";

        return;
    }

    // Loading message
    status.innerText =
        "🎨 AI image bana raha hai...";

    image.style.display = "none";

    try {

        // Netlify backend ko request
        const response = await fetch(
            "/.netlify/functions/generate-image",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    prompt: prompt
                })
            }
        );

        const data = await response.json();

        // Error check
        if (!response.ok) {

            throw new Error(
                data.error ||
                "Image generation failed"
            );
        }

        // Generated image show karo
        image.src = data.image;

        image.style.display = "block";

        status.innerText =
            "✅ Image ready!";

    } catch (error) {

        console.error(error);

        status.innerText =
            "❌ " + error.message;
    }
}