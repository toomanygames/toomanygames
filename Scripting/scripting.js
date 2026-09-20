const SUPABASE_URL =
    "https://agsqdqcsmsppcdqxlppj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Oq1WvEHgoHcjmCBGbEnoYQ_BqYA1p52";


const codeEditor =
    document.getElementById("codeEditor");

const lineNumbers =
    document.getElementById("lineNumbers");

const runButton =
    document.getElementById("runButton");

const clearButton =
    document.getElementById("clearButton");

const placeholder =
    document.getElementById("placeholder");

const previewStatus =
    document.getElementById("previewStatus");

const characterCount =
    document.getElementById("characterCount");

const gameTitle =
    document.getElementById("gameTitle");

const gameDescription =
    document.getElementById("gameDescription");

const gameAuthor =
    document.getElementById("gameAuthor");

const gameCategory =
    document.getElementById("gameCategory");

const publishButton =
    document.getElementById("publishButton");

const publishMessage =
    document.getElementById("publishMessage");

const published =
    document.getElementById("published");

const resultTitle =
    document.getElementById("resultTitle");

const resultDescription =
    document.getElementById("resultDescription");

const resultAuthor =
    document.getElementById("resultAuthor");

const resultCategory =
    document.getElementById("resultCategory");


let previewVersion = 0;


/* =========================
   EDITOR
========================= */

function updateEditor() {

    if (!codeEditor) {
        return;
    }

    const code =
        codeEditor.value;

    const lines =
        code.split("\n");

    if (lineNumbers) {

        lineNumbers.innerHTML = "";

        for (
            let i = 1;
            i <= lines.length;
            i++
        ) {

            const line =
                document.createElement("div");

            line.textContent = i;

            lineNumbers.appendChild(line);
        }
    }

    if (characterCount) {

        characterCount.textContent =
            `${code.length.toLocaleString()} characters`;
    }
}


/* =========================
   RUN GAME
========================= */

function runGame() {

    if (!codeEditor) {
        return;
    }

    const code =
        codeEditor.value;

    if (!code.trim()) {

        if (previewStatus) {
            previewStatus.textContent =
                "No code";
        }

        if (placeholder) {
            placeholder.style.display =
                "flex";
        }

        const frame =
            document.getElementById("gamePreview");

        if (frame) {
            frame.srcdoc = "";
            frame.style.display = "none";
        }

        return;
    }

    previewVersion++;

    const currentVersion =
        previewVersion;

    if (previewStatus) {
        previewStatus.textContent =
            "Loading...";
    }

    if (placeholder) {
        placeholder.style.display =
            "none";
    }

    const oldFrame =
        document.getElementById("gamePreview");

    const newFrame =
        document.createElement("iframe");

    newFrame.id =
        "gamePreview";

    newFrame.title =
        "Game Preview";

    newFrame.setAttribute(
        "sandbox",
        "allow-scripts"
    );

    newFrame.scrolling =
        "no";

    newFrame.style.position =
        "absolute";

    newFrame.style.width =
        "1280px";

    newFrame.style.height =
        "720px";

    newFrame.style.border =
        "none";

    newFrame.style.background =
        "white";

    newFrame.style.left =
        "0";

    newFrame.style.top =
        "0";

    newFrame.style.transformOrigin =
        "top left";

    if (oldFrame) {
        oldFrame.replaceWith(newFrame);
    }

    const viewportCSS = `
<style id="dougHubPreviewViewport">

html {
    width: 1280px !important;
    height: 720px !important;
    min-width: 1280px !important;
    min-height: 720px !important;
    max-width: 1280px !important;
    max-height: 720px !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
}

body {
    width: 1280px !important;
    height: 720px !important;
    min-width: 1280px !important;
    min-height: 720px !important;
    max-width: 1280px !important;
    max-height: 720px !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
}

</style>
`;

    let finalCode =
        code;

    if (/<head[\s>]/i.test(code)) {

        finalCode =
            code.replace(
                /<head([^>]*)>/i,
                function(match) {
                    return match + viewportCSS;
                }
            );

    } else {

        finalCode =
            viewportCSS + code;
    }

    requestAnimationFrame(function() {

        if (
            currentVersion !==
            previewVersion
        ) {
            return;
        }

        newFrame.srcdoc =
            finalCode;

    });

    newFrame.onload =
        function() {

            if (
                currentVersion ===
                previewVersion
            ) {

                if (previewStatus) {
                    previewStatus.textContent =
                        "Running";
                }
            }
        };
}


/* =========================
   CLEAR
========================= */

function clearCode() {

    if (
        !confirm(
            "Clear all game code?"
        )
    ) {
        return;
    }

    previewVersion++;

    codeEditor.value =
        "";

    const frame =
        document.getElementById(
            "gamePreview"
        );

    if (frame) {
        frame.srcdoc =
            "";

        frame.style.display =
            "none";
    }

    if (placeholder) {
        placeholder.style.display =
            "flex";
    }

    if (previewStatus) {
        previewStatus.textContent =
            "Waiting";
    }

    updateEditor();

    codeEditor.focus();
}


/* =========================
   PUBLISH
========================= */

async function publishGame() {

    const title =
        gameTitle.value.trim();

    const description =
        gameDescription.value.trim();

    const author =
        gameAuthor.value.trim() ||
        "Anonymous";

    const category =
        gameCategory.value;

    const code =
        codeEditor.value.trim();

    publishMessage.textContent =
        "";

    publishMessage.style.color =
        "";


    if (!title) {

        publishMessage.textContent =
            "Please enter a game title.";

        return;
    }


    if (!code) {

        publishMessage.textContent =
            "Please add some game code first.";

        return;
    }


    if (code.length > 500000) {

        publishMessage.textContent =
            "Your game code is too large.";

        return;
    }


    publishButton.disabled =
        true;

    publishButton.textContent =
        "Publishing...";


    try {

        const {
            data: {
                session
            }
        } =
            await window.supabase
                .createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                )
                .auth.getSession()
                .then(result =>
                    result.data
                );


        if (
            !session ||
            !session.user
        ) {

            throw new Error(
                "You must be logged in to publish a game."
            );
        }


        const supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );


        const {
            data,
            error
        } =
            await supabaseClient
                .from("community_games")
                .insert({
                    title: title,
                    description: description,
                    author: author,
                    category: category,
                    code: code,
                    creator_id:
                        session.user.id
                })
                .select()
                .single();


        if (error) {

            console.error(
                "Supabase error:",
                error
            );

            throw new Error(
                error.message ||
                "Could not publish the game."
            );
        }


        resultTitle.textContent =
            data.title;

        resultDescription.textContent =
            data.description ||
            "No description.";

        resultAuthor.textContent =
            data.author ||
            "Anonymous";

        resultCategory.textContent =
            data.category ||
            "Other";


        published.style.display =
            "block";


        publishMessage.textContent =
            "Game published successfully!";

        publishMessage.style.color =
            "#22c55e";


        published.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    } catch (error) {

        console.error(error);

        publishMessage.textContent =
            error.message ||
            "Could not publish the game.";

        publishMessage.style.color =
            "#ef4444";

    } finally {

        publishButton.disabled =
            false;

        publishButton.textContent =
            "Publish Game";
    }
}


/* =========================
   EVENTS
========================= */

if (codeEditor) {

    codeEditor.addEventListener(
        "input",
        updateEditor
    );


    codeEditor.addEventListener(
        "scroll",
        function() {

            if (lineNumbers) {

                lineNumbers.scrollTop =
                    codeEditor.scrollTop;
            }
        }
    );


    codeEditor.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Tab"
            ) {

                event.preventDefault();

                const start =
                    codeEditor.selectionStart;

                const end =
                    codeEditor.selectionEnd;


                codeEditor.value =
                    codeEditor.value.substring(
                        0,
                        start
                    ) +
                    "    " +
                    codeEditor.value.substring(
                        end
                    );


                codeEditor.selectionStart =
                    start + 4;

                codeEditor.selectionEnd =
                    start + 4;


                updateEditor();
            }


            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                    "enter"
            ) {

                event.preventDefault();

                runGame();
            }
        }
    );
}


if (runButton) {

    runButton.addEventListener(
        "click",
        runGame
    );
}


if (clearButton) {

    clearButton.addEventListener(
        "click",
        clearCode
    );
}


if (publishButton) {

    publishButton.addEventListener(
        "click",
        publishGame
    );
}


/* =========================
   START EDITOR
========================= */

updateEditor();