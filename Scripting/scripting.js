const SUPABASE_URL = "https://agsqdqcsmsppcdqxlppj.supabase.co";
const SUPABASE_KEY = "sb_publishable_Oq1WvEHgoHcjmCBGbEnoYQ_BqYA1p52";

const codeEditor = document.getElementById("codeEditor");
const lineNumbers = document.getElementById("lineNumbers");
const runButton = document.getElementById("runButton");
const clearButton = document.getElementById("clearButton");
const gamePreview = document.getElementById("gamePreview");
const placeholder = document.getElementById("placeholder");
const previewStatus = document.getElementById("previewStatus");
const characterCount = document.getElementById("characterCount");

const gameTitle = document.getElementById("gameTitle");
const gameDescription = document.getElementById("gameDescription");
const gameAuthor = document.getElementById("gameAuthor");
const gameCategory = document.getElementById("gameCategory");

const publishButton = document.getElementById("publishButton");
const publishMessage = document.getElementById("publishMessage");

const published = document.getElementById("published");
const resultTitle = document.getElementById("resultTitle");
const resultDescription = document.getElementById("resultDescription");
const resultAuthor = document.getElementById("resultAuthor");
const resultCategory = document.getElementById("resultCategory");

let previewVersion = 0;

function updateEditor() {
    const code = codeEditor.value;
    const lines = code.split("\n");

    lineNumbers.innerHTML = "";

    for (let i = 1; i <= lines.length; i++) {
        const line = document.createElement("div");
        line.textContent = i;
        lineNumbers.appendChild(line);
    }

    characterCount.textContent =
        `${code.length.toLocaleString()} characters`;
}

function runGame() {
    const code = codeEditor.value;

    if (!code.trim()) {
        previewStatus.textContent = "No code";
        placeholder.style.display = "flex";
        gamePreview.style.display = "none";
        gamePreview.srcdoc = "";
        return;
    }

    previewVersion++;

    const currentVersion = previewVersion;

    previewStatus.textContent = "Loading...";

    placeholder.style.display = "none";
    gamePreview.style.display = "block";

    // Completely remove the old iframe.
    const oldFrame = gamePreview;

    const newFrame = document.createElement("iframe");

    newFrame.id = "gamePreview";
    newFrame.title = "Game Preview";
    newFrame.setAttribute("sandbox", "allow-scripts");
    newFrame.style.width = "100%";
    newFrame.style.height = "100%";
    newFrame.style.border = "none";
    newFrame.style.background = "white";

    oldFrame.replaceWith(newFrame);

    // Update our reference to the new iframe.
    window.gamePreview = newFrame;

    // Wait one frame so the browser has completely created
    // the new iframe before loading the game.
    requestAnimationFrame(() => {
        if (currentVersion !== previewVersion) {
            return;
        }

        newFrame.srcdoc = code;

        newFrame.onload = () => {
            if (currentVersion === previewVersion) {
                previewStatus.textContent = "Running";
            }
        };
    });
}

function clearCode() {
    if (!confirm("Clear all game code?")) {
        return;
    }

    previewVersion++;

    codeEditor.value = "";

    const oldFrame = document.getElementById("gamePreview");

    const newFrame = document.createElement("iframe");

    newFrame.id = "gamePreview";
    newFrame.title = "Game Preview";
    newFrame.setAttribute("sandbox", "allow-scripts");
    newFrame.style.width = "100%";
    newFrame.style.height = "100%";
    newFrame.style.border = "none";
    newFrame.style.background = "white";
    newFrame.style.display = "none";

    oldFrame.replaceWith(newFrame);

    window.gamePreview = newFrame;

    placeholder.style.display = "flex";
    previewStatus.textContent = "Waiting";

    updateEditor();
}

async function publishGame() {
    const title = gameTitle.value.trim();
    const description = gameDescription.value.trim();
    const author = gameAuthor.value.trim() || "Anonymous";
    const category = gameCategory.value;
    const code = codeEditor.value.trim();

    publishMessage.textContent = "";
    publishMessage.style.color = "";

    if (!title) {
        publishMessage.textContent = "Please enter a game title.";
        return;
    }

    if (!code) {
        publishMessage.textContent = "Please add some game code first.";
        return;
    }

    if (code.length > 500000) {
        publishMessage.textContent = "Your game code is too large.";
        return;
    }

    publishButton.disabled = true;
    publishButton.textContent = "Publishing...";

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/community_games`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    author: author,
                    category: category,
                    code: code
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            console.error("Supabase error:", result);
            throw new Error(
                result.message ||
                result.hint ||
                "Could not publish game."
            );
        }

        const game = Array.isArray(result) ? result[0] : result;

        resultTitle.textContent = game.title;
        resultDescription.textContent =
            game.description || "No description.";
        resultAuthor.textContent =
            game.author || "Anonymous";
        resultCategory.textContent =
            game.category || "Other";

        published.style.display = "block";

        publishMessage.textContent =
            "Game published successfully!";
        publishMessage.style.color = "#22c55e";

        published.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (error) {
        console.error(error);

        publishMessage.textContent =
            "Could not publish the game. Check your Supabase table and policies.";

        publishMessage.style.color = "#ef4444";
    } finally {
        publishButton.disabled = false;
        publishButton.textContent = "Publish Game";
    }
}

codeEditor.addEventListener("input", updateEditor);

codeEditor.addEventListener("scroll", () => {
    const frame = document.getElementById("gamePreview");

    if (frame) {
        lineNumbers.scrollTop = codeEditor.scrollTop;
    }
});

codeEditor.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        event.preventDefault();

        const start = codeEditor.selectionStart;
        const end = codeEditor.selectionEnd;

        codeEditor.value =
            codeEditor.value.substring(0, start) +
            "    " +
            codeEditor.value.substring(end);

        codeEditor.selectionStart = start + 4;
        codeEditor.selectionEnd = start + 4;

        updateEditor();
    }

    if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "Enter"
    ) {
        event.preventDefault();
        runGame();
    }
});

runButton.addEventListener("click", runGame);
clearButton.addEventListener("click", clearCode);
publishButton.addEventListener("click", publishGame);

updateEditor();