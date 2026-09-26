(function () {
    if (window.__DOUGHUB_DISPLAY_LOADED) return;
    window.__DOUGHUB_DISPLAY_LOADED = true;

    const SUPABASE_URL =
        "https://agsqdqcsmsppcdqxlppj.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Oq1WvEHgoHcjmCBGbEnoYQ_BqYA1p52";


    let supabaseClient = null;
    let currentUser = null;

    let warningQueue = [];
    let showingWarning = false;

    let banned = false;

    let checkTimer = null;
    let presenceTimer = null;


    /* =========================================
       LOAD SUPABASE
    ========================================= */

    function loadSupabase() {

        return new Promise((resolve, reject) => {

            if (window.supabase) {
                resolve();
                return;
            }


            const script =
                document.createElement("script");

            script.src =
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

            script.onload =
                resolve;

            script.onerror =
                reject;

            document.head.appendChild(
                script
            );

        });

    }


    /* =========================================
       CREATE DISPLAY STYLES
    ========================================= */

    function createStyles() {

        if (
            document.getElementById(
                "dougHubDisplayStyles"
            )
        ) {
            return;
        }


        const style =
            document.createElement("style");

        style.id =
            "dougHubDisplayStyles";


        style.textContent = `
            #dougHubDisplayOverlay {
                position: fixed;
                inset: 0;
                z-index: 2147483647;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(2, 4, 10, 0.82);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                padding: 20px;
                box-sizing: border-box;
            }

            #dougHubDisplayBox {
                width: min(520px, 100%);
                background: linear-gradient(
                    145deg,
                    rgba(20, 24, 52, 0.98),
                    rgba(10, 13, 30, 0.98)
                );
                border: 1px solid rgba(139, 92, 246, 0.35);
                border-radius: 22px;
                padding: 30px;
                box-sizing: border-box;
                box-shadow: 0 30px 100px rgba(0, 0, 0, 0.65);
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
            }

            #dougHubDisplayIcon {
                font-size: 48px;
                margin-bottom: 12px;
            }

            #dougHubDisplayTitle {
                margin: 0 0 15px;
                font-size: 26px;
                font-weight: 800;
            }

            #dougHubDisplayMessage {
                color: #d8dbea;
                font-size: 15px;
                line-height: 1.6;
                white-space: pre-wrap;
                overflow-wrap: anywhere;
                margin-bottom: 18px;
            }

            #dougHubDisplayDate {
                color: #858ca1;
                font-size: 12px;
                margin-bottom: 22px;
            }

            #dougHubDisplayButton {
                width: 100%;
                border: 0;
                border-radius: 13px;
                padding: 14px 18px;
                background: linear-gradient(
                    135deg,
                    #6366f1,
                    #a855f7
                );
                color: white;
                font-size: 15px;
                font-weight: 800;
                cursor: pointer;
            }

            #dougHubDisplayButton:hover {
                filter: brightness(1.1);
            }

            #dougHubDisplayReason {
                background: rgba(255,255,255,0.05);
                border-radius: 13px;
                padding: 15px;
                margin: 18px 0;
                color: #d8dbea;
                line-height: 1.6;
                text-align: left;
                overflow-wrap: anywhere;
            }
        `;


        document.head.appendChild(
            style
        ); 

    }


    /* =========================================
       PAGE LOCKING
    ========================================= */

    function lockPage() {

        document.documentElement.style.overflow =
            "hidden";

        document.body.style.overflow =
            "hidden";

    }


    function unlockPage() {

        document.documentElement.style.overflow =
            "";

        document.body.style.overflow =
            "";

    }


    function removeOverlay() {

        const overlay =
            document.getElementById(
                "dougHubDisplayOverlay"
            );


        if (overlay) {
            overlay.remove();
        }


        unlockPage();

    }


    function createOverlay() {

        removeOverlay();


        const overlay =
            document.createElement("div");

        overlay.id =
            "dougHubDisplayOverlay";


        const box =
            document.createElement("div");

        box.id =
            "dougHubDisplayBox";


        overlay.appendChild(
            box
        );

        document.body.appendChild(
            overlay
        );


        lockPage();


        return box;

    }


    /* =========================================
       WARNING DISPLAY
    ========================================= */

    function showWarning(warning) {

        if (
            showingWarning ||
            banned
        ) {
            return;
        }


        showingWarning =
            true;


        const box =
            createOverlay();


        const icon =
            document.createElement("div");

        icon.id =
            "dougHubDisplayIcon";

        icon.textContent =
            "⚠️";


        const title =
            document.createElement("h2");

        title.id =
            "dougHubDisplayTitle";

        title.textContent =
            "DougHub Warning";


        const message =
            document.createElement("div");

        message.id =
            "dougHubDisplayMessage";

        message.textContent =
            warning.message ||
            "You have received a warning.";


        const date =
            document.createElement("div");

        date.id =
            "dougHubDisplayDate";


        if (warning.created_at) {

            date.textContent =
                "Issued " +
                new Date(
                    warning.created_at
                ).toLocaleString();

        }


        const button =
            document.createElement("button");

        button.id =
            "dougHubDisplayButton";

        button.textContent =
            "I Understand";


        button.addEventListener(
            "click",
            async function () {

                button.disabled =
                    true;

                button.textContent =
                    "Saving...";


                try {

                    await supabaseClient
                        .from("user_warnings")
                        .update({
                            read_at:
                                new Date()
                                    .toISOString()
                        })
                        .eq(
                            "id",
                            warning.id
                        )
                        .eq(
                            "user_id",
                            currentUser.id
                        );


                    warningQueue.shift();

                } catch (error) {

                    console.error(
                        "DougHub warning error:",
                        error
                    );

                }


                showingWarning =
                    false;


                removeOverlay();


                setTimeout(
                    showNextWarning,
                    100
                );

            }
        );


        box.appendChild(
            icon
        );

        box.appendChild(
            title
        );

        box.appendChild(
            message
        );

        box.appendChild(
            date
        );

        box.appendChild(
            button
        );

    }


    function showNextWarning() {

        if (
            banned ||
            showingWarning
        ) {
            return;
        }


        if (
            warningQueue.length === 0
        ) {

            removeOverlay();

            return;
        }


        showWarning(
            warningQueue[0]
        );

    }


    /* =========================================
       BAN DISPLAY
    ========================================= */

    function showBan(reason) {

        if (banned) {
            return;
        }


        banned =
            true;

        showingWarning =
            false;

        warningQueue =
            [];


        const box =
            createOverlay();


        const icon =
            document.createElement("div");

        icon.id =
            "dougHubDisplayIcon";

        icon.textContent =
            "🚫";


        const title =
            document.createElement("h2");

        title.id =
            "dougHubDisplayTitle";

        title.textContent =
            "DougHub Ban";


        const message =
            document.createElement("div");

        message.id =
            "dougHubDisplayMessage";

        message.textContent =
            "Your DougHub account has been banned.";


        const reasonBox =
            document.createElement("div");

        reasonBox.id =
            "dougHubDisplayReason";


        reasonBox.textContent =
            reason &&
            reason.trim()
                ? "Reason: " + reason
                : "No reason was provided.";


        const date =
            document.createElement("div");

        date.id =
            "dougHubDisplayDate";

        date.textContent =
            "If you believe this is a mistake, contact a DougHub administrator.";


        box.appendChild(
            icon
        );

        box.appendChild(
            title
        );

        box.appendChild(
            message
        );

        box.appendChild(
            reasonBox
        );

        box.appendChild(
            date
        );

    }


    /* =========================================
       USER PRESENCE
    ========================================= */

    async function updatePresence() {

        if (
            !supabaseClient ||
            !currentUser ||
            banned
        ) {
            return;
        }


        const {
            error
        } =
            await supabaseClient
                .from("user_presence")
                .upsert(
                    {
                        user_id:
                            currentUser.id,

                        last_seen_at:
                            new Date()
                                .toISOString()
                    },
                    {
                        onConflict:
                            "user_id"
                    }
                );


        if (error) {

            console.error(
                "DougHub presence error:",
                error
            );

        }

    }


    function stopPresenceTracking() {

        if (presenceTimer) {

            clearInterval(
                presenceTimer
            );

            presenceTimer =
                null;

        }

    }


    function startPresenceTracking() {

        stopPresenceTracking();


        if (
            !currentUser ||
            banned
        ) {
            return;
        }


        updatePresence();


        /*
            Update every 30 seconds.

            The admin panel considers someone online
            when their last_seen_at is within 2 minutes.
        */

        presenceTimer =
            setInterval(
                updatePresence,
                30000
            );

    }


    /* =========================================
       ACCOUNT CHECK
    ========================================= */

    async function checkAccount() {

        if (!supabaseClient) {
            return;
        }


        const result =
            await supabaseClient
                .auth
                .getSession();


        if (result.error) {
            return;
        }


        const session =
            result.data.session;


        if (
            !session ||
            !session.user
        ) {

            currentUser =
                null;

            banned =
                false;

            warningQueue =
                [];

            showingWarning =
                false;


            stopPresenceTracking();


            removeOverlay();


            return;
        }


        currentUser =
            session.user;


        const profileResult =
            await supabaseClient
                .from("profiles")
                .select(
                    "is_banned, ban_reason"
                )
                .eq(
                    "id",
                    currentUser.id
                )
                .maybeSingle();


        if (profileResult.error) {

            console.error(
                "DougHub profile check error:",
                profileResult.error
            );

            return;
        }


        const profile =
            profileResult.data;


        if (
            profile &&
            profile.is_banned === true
        ) {

            stopPresenceTracking();

            showBan(
                profile.ban_reason
            );

            return;
        }


        if (banned) {

            banned =
                false;

            removeOverlay();

        }


        startPresenceTracking();


        await loadWarnings();

    }


    /* =========================================
       LOAD WARNINGS
    ========================================= */

    async function loadWarnings() {

        if (
            !currentUser ||
            banned
        ) {
            return;
        }


        const result =
            await supabaseClient
                .from("user_warnings")
                .select(
                    "id,message,created_at"
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .is(
                    "read_at",
                    null
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (result.error) {

            console.error(
                "DougHub warning check error:",
                result.error
            );

            return;
        }


        warningQueue =
            result.data ||
            [];


        if (
            !showingWarning &&
            warningQueue.length > 0
        ) {

            showNextWarning();

        }

    }



    /* =========================================
       SIDE SLIDER
    ========================================= */

    async function createSideSlider() {
        if (document.getElementById("dougHubSideSlider")) return;

        const slider=document.createElement("aside");
        slider.id="dougHubSideSlider";
        slider.innerHTML=[
            '<button id="dougHubSideTab" type="button" aria-label="Open DougHub side panel" aria-expanded="false">☰</button>',
            '<div id="dougHubSidePanel">',
            '<div class="dh-side-head"><div><div class="dh-side-title">DougHub Pulse</div><div class="dh-side-sub">Quick stats and recent activity</div></div><button class="dh-side-close" id="dougHubSideClose" type="button">×</button></div>',
            '<div class="dh-side-grid">',
            '<a class="dh-side-card" href="/chat.html"><div class="dh-side-icon">💬</div><div class="dh-side-label">Chat Messages</div><div class="dh-side-value" id="dhChatCount">—</div></a>',
            '<a class="dh-side-card" href="/index.html#users"><div class="dh-side-icon">👥</div><div class="dh-side-label">Users</div><div class="dh-side-value" id="dhUserCount">—</div></a>',
            '<a class="dh-side-card" href="/douggames.html"><div class="dh-side-icon">🎮</div><div class="dh-side-label">Games</div><div class="dh-side-value" id="dhGameCount">—</div></a>',
            '<a class="dh-side-card" href="/DougTube.html"><div class="dh-side-icon">▶️</div><div class="dh-side-label">DougTube Videos</div><div class="dh-side-value" id="dhVideoCount">—</div></a>',
            '</div>',
            '<div class="dh-side-latest"><div class="dh-side-latest-title">Latest Chat</div><div id="dhLatestChat"><div class="dh-side-item"><div class="dh-side-item-text">Loading…</div></div></div></div>',
            '<div class="dh-side-latest"><div class="dh-side-latest-title">Latest DougTube</div><div id="dhLatestVideos"><div class="dh-side-item"><div class="dh-side-item-text">Loading…</div></div></div></div>',
            '</div>'
        ].join("");
        document.body.appendChild(slider);

        const tab=document.getElementById("dougHubSideTab"), close=document.getElementById("dougHubSideClose");
        function setOpen(open){slider.classList.toggle("open",open);tab.setAttribute("aria-expanded",String(open));tab.textContent=open?"›":"☰";}
        tab.addEventListener("click",()=>setOpen(!slider.classList.contains("open")));
        close.addEventListener("click",()=>setOpen(false));

        const builtInGames=6;
        try{const r=await supabaseClient.from("profiles").select("id",{count:"exact",head:true});if(!r.error)document.getElementById("dhUserCount").textContent=Number(r.count||0).toLocaleString();}catch(e){}
        try{const r=await supabaseClient.from("community_games").select("id",{count:"exact",head:true});if(!r.error)document.getElementById("dhGameCount").textContent=(builtInGames+Number(r.count||0)).toLocaleString();}catch(e){}
        try{const r=await supabaseClient.from("chat_messages").select("id",{count:"exact",head:true});if(!r.error)document.getElementById("dhChatCount").textContent=Number(r.count||0).toLocaleString();}catch(e){}
        try{const r=await supabaseClient.from("dougtube_videos").select("id",{count:"exact",head:true});if(!r.error)document.getElementById("dhVideoCount").textContent=Number(r.count||0).toLocaleString();}catch(e){}

        const esc=s=>String(s||"").replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
        try{
            const r=await supabaseClient.from("chat_messages").select("message,username,created_at").order("created_at",{ascending:false}).limit(5);
            const box=document.getElementById("dhLatestChat");
            if(r.error||!r.data?.length) box.innerHTML='<div class="dh-side-item"><div class="dh-side-item-text">No recent messages.</div></div>';
            else box.innerHTML=r.data.map(x=>'<div class="dh-side-item"><div class="dh-side-item-icon">💬</div><div class="dh-side-item-text">'+esc(String(x.message||"").slice(0,120))+'<div class="dh-side-item-meta">by '+esc(String(x.username||"User").slice(0,40))+'</div></div></div>').join("");
        }catch(e){}
        try{
            const r=await supabaseClient.from("dougtube_videos").select("title,created_at").order("created_at",{ascending:false}).limit(5);
            const box=document.getElementById("dhLatestVideos");
            if(r.error||!r.data?.length) box.innerHTML='<div class="dh-side-item"><div class="dh-side-item-text">No videos yet.</div></div>';
            else box.innerHTML=r.data.map(x=>'<div class="dh-side-item"><div class="dh-side-item-icon">▶️</div><div class="dh-side-item-text">'+esc(String(x.title||"Untitled Video").slice(0,80))+'</div></div>').join("");
        }catch(e){}
    }

    /* =========================================
       PAGE VISIBILITY
    ========================================= */

    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState ===
                "visible"
            ) {

                updatePresence();

            }

        }
    );


    window.addEventListener(
        "focus",
        function () {

            updatePresence();

        }
    );


    /* =========================================
       INITIALIZE
    ========================================= */

    async function initialize() {

        try {

            await loadSupabase();


            supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                );


            createStyles();

            await createSideSlider();

            await checkAccount();


            supabaseClient.auth.onAuthStateChange(
                function () {

                    setTimeout(
                        checkAccount,
                        0
                    );

                }
            );


            checkTimer =
                setInterval(
                    checkAccount,
                    5000
                );

        } catch (error) {

            console.error(
                "DougHub display system failed to initialize:",
                error
            );

        }

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }


    window.DougHubDisplay = {

        refresh:
            checkAccount

    };

})();