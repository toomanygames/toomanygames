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

        style.textContent += "\n            #dougHubSideSlider{position:fixed;top:88px;right:0;width:min(350px,calc(100vw - 18px));max-height:calc(100vh - 108px);z-index:2147483000;transform:translateX(calc(100% - 54px));transition:transform .32s cubic-bezier(.2,.8,.2,1);pointer-events:auto}\n            #dougHubSideSlider.open{transform:translateX(0)}\n            #dougHubSideTab{position:absolute;left:0;top:18px;width:54px;min-height:72px;border:1px solid rgba(255,255,255,.12);border-right:0;border-radius:18px 0 0 18px;background:rgba(13,17,39,.94);color:white;cursor:pointer;box-shadow:-10px 14px 35px rgba(0,0,0,.28);backdrop-filter:blur(20px);font-size:20px}\n            #dougHubSidePanel{margin-left:54px;max-height:calc(100vh - 108px);overflow-y:auto;padding:16px;border:1px solid rgba(255,255,255,.10);border-radius:22px 0 0 22px;background:radial-gradient(circle at 100% 0%,rgba(168,85,247,.18),transparent 35%),linear-gradient(145deg,rgba(14,18,42,.97),rgba(7,9,22,.97));box-shadow:-24px 24px 70px rgba(0,0,0,.38);backdrop-filter:blur(24px);color:white;font-family:Arial,Helvetica,sans-serif}\n            .dh-side-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}\n            .dh-side-title{font-size:18px;font-weight:900}.dh-side-sub{margin-top:3px;color:#888ba0;font-size:11px}\n            .dh-side-close{width:30px;height:30px;border:1px solid rgba(255,255,255,.09);border-radius:10px;background:rgba(255,255,255,.05);color:#c9c9d8;cursor:pointer;font-size:18px}\n            .dh-side-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}\n            .dh-side-card{display:block;min-height:94px;padding:13px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.035);transition:.2s ease;color:inherit;text-decoration:none}\n            .dh-side-card:hover{transform:translateY(-2px);border-color:rgba(129,140,248,.34);background:rgba(99,102,241,.09)}\n            .dh-side-icon{font-size:20px}.dh-side-label{margin-top:8px;color:#a8a9bb;font-size:11px;font-weight:700}.dh-side-value{margin-top:3px;font-size:20px;font-weight:900}\n            .dh-side-latest{margin-top:12px;padding:13px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.028)}\n            .dh-side-latest-title{margin-bottom:9px;font-size:12px;font-weight:900;color:#b9b9ca;text-transform:uppercase;letter-spacing:.07em}\n            .dh-side-item{display:flex;gap:9px;padding:8px 0;border-top:1px solid rgba(255,255,255,.055)}.dh-side-item:first-child{border-top:0}\n            .dh-side-item-icon{width:28px;height:28px;flex:0 0 28px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:rgba(99,102,241,.12)}\n            .dh-side-item-text{min-width:0;color:#bfc0cf;font-size:12px;line-height:1.35;overflow-wrap:anywhere}.dh-side-item-meta{margin-top:2px;color:#727486;font-size:10px}\n            @media(max-width:600px){#dougHubSideSlider{top:78px;max-height:calc(100vh - 88px)}#dougHubSidePanel{max-height:calc(100vh - 88px)}}\n";

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