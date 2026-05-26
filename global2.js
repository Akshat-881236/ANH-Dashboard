/* =========================================================
   ANH GLOBAL INFRASTRUCTURE ENGINE
   FILE : global.js
   ROLE :
   - Auth Detection
   - Auth Injection
   - Google Sign In
   - Redirect Controller
   - Visit History Engine
   - Diagnostics Engine
   - Previous / Next Page Mapping
   - Session Synchronization
   - Cross Site Intelligence
========================================================= */

/* =========================================================
   FIREBASE IMPORTS
========================================================= */

import { initializeApp }

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {

    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {

    getFirestore,
    doc,
    setDoc,
    updateDoc

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyAdlZ6GuhAcHSTZHVZJjoPx1V1zKg5tV3I",

    authDomain: "anh-dashboard-881238.firebaseapp.com",

    projectId: "anh-dashboard-881238",

    storageBucket: "anh-dashboard-881238.firebasestorage.app",

    messagingSenderId: "384383636180",

    appId: "1:384383636180:web:326d7dcb3d4fafd3b5e141"

};

/* =========================================================
   FIREBASE INIT
========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

const db = getFirestore(app);

/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentUser = null;

let currentLogID = null;

let nextLogID = null;

const currentPageURL =
window.location.href;

const currentPageTitle =
document.title;

const currentPageDescription =

document
.querySelector(
    'meta[name="description"]'
)
?.content || "No Description";

/* =========================================================
   AUTH STATE LISTENER
========================================================= */

onAuthStateChanged(auth, async(user)=>{

    /* =========================================
       USER LOGGED IN
    ========================================= */

    if(user){

        currentUser = user;

        /* =====================================
           SAVE VISIT LOG
        ===================================== */

        await saveVisitLog();

        /* =====================================
           RETURN VISIT POPUP
        ===================================== */

        injectReturningPopup();

        /* =====================================
           MONITOR NAVIGATION
        ===================================== */

        monitorAnchorClicks();

    }

    /* =========================================
       USER NOT LOGGED IN
    ========================================= */

    else{

        setTimeout(()=>{

            injectAuthCard();

        },25000);

    }

});

/* =========================================================
   AUTH INJECTION CARD
========================================================= */

function injectAuthCard(){

    /* =========================================
       PREVENT MULTIPLE POPUP
    ========================================= */

    if(

        document.getElementById(
            "anhAuthOverlay"
        )

    ) return;

    /* =========================================
       CREATE OVERLAY
    ========================================= */

    const overlay =
    document.createElement("div");

    overlay.id =
    "anhAuthOverlay";

    overlay.innerHTML = `

        <div id="anhAuthCard">

            <h2>

                ANH Authentication

            </h2>

            <p>

                Continue with Google
                to enable:

            </p>

            <ul>

                <li>Visit History</li>

                <li>Diagnostics</li>

                <li>Feedback Logs</li>

                <li>Cross Site Sync</li>

            </ul>

            <button id="anhGoogleBtn">

                Continue with Google

            </button>

            <button id="anhGuestBtn">

                Continue as Guest

            </button>

        </div>

    `;

    document.body.appendChild(
        overlay
    );

    /* =========================================
       STYLES
    ========================================= */

    const style =
    document.createElement("style");

    style.innerHTML = `

        #anhAuthOverlay{

            position:fixed;
            inset:0;
            background:rgba(0,0,0,0.7);
            z-index:999999;
            display:flex;
            justify-content:center;
            align-items:center;
            padding:20px;

        }

        #anhAuthCard{

            width:100%;
            max-width:420px;
            background:white;
            color:black;
            padding:25px;
            border-radius:14px;

        }

        #anhAuthCard h2{

            margin-bottom:15px;

        }

        #anhAuthCard ul{

            margin:15px 0;
            padding-left:20px;

        }

        #anhAuthCard button{

            width:100%;
            padding:14px;
            margin-top:10px;
            border:none;
            border-radius:8px;
            cursor:pointer;
            font-weight:bold;

        }

        #anhGoogleBtn{

            background:#2563eb;
            color:white;

        }

        #anhGuestBtn{

            background:#e5e7eb;

        }

    `;

    document.head.appendChild(
        style
    );

    /* =========================================
       GOOGLE SIGN IN
    ========================================= */

    document
    .getElementById("anhGoogleBtn")
    .addEventListener("click",async()=>{

        try{

            /* =====================================
               GOOGLE POPUP
            ===================================== */

            await signInWithPopup(
                auth,
                provider
            );

            /* =====================================
               REDIRECT URL
            ===================================== */

            const dashboardURL =

            "https://anh-dashboard-881238.web.app";

            /* =====================================
               SAVE RETURN URL
            ===================================== */

            sessionStorage.setItem(

                "anh_return_url",

                currentPageURL

            );

            /* =====================================
               REDIRECT LOCK
            ===================================== */

            sessionStorage.setItem(

                "anh_redirect_processing",

                "true"

            );

            /* =====================================
               FINAL REDIRECT
            ===================================== */

            window.location.replace(

                dashboardURL +

                "?mode=injector" +

                "&redirect=" +

                encodeURIComponent(
                    currentPageURL
                )

            );

        }
        catch(error){

            alert(error.message);

        }

    });

    /* =========================================
       CONTINUE AS GUEST
    ========================================= */

    document
    .getElementById("anhGuestBtn")
    .addEventListener("click",()=>{

        overlay.remove();

    });

}

/* =========================================================
   SAVE VISIT LOG
========================================================= */

async function saveVisitLog(){

    if(!currentUser) return;

    /* =========================================
       GENERATE LOG ID
    ========================================= */

    currentLogID =
    generateLogID();

    /* =========================================
       PREVIOUS LOG
    ========================================= */

    const previousLogID =

    sessionStorage.getItem(
        "anh_previous_log_id"
    );

    const previousPageURL =

    sessionStorage.getItem(
        "anh_previous_page_url"
    );

    /* =========================================
       NEXT LOG
    ========================================= */

    nextLogID =

    sessionStorage.getItem(
        "anh_next_log_id"
    );

    /* =========================================
       VISIT DATA
    ========================================= */

    const visitData = {

        uid:
            currentUser.uid,

        email:
            currentUser.email,

        log_id:
            currentLogID,

        url:
            currentPageURL,

        title:
            currentPageTitle,

        description:
            currentPageDescription,

        previous_page_url:
            previousPageURL || null,

        previous_log_id:
            previousLogID || null,

        next_page_url:
            null,

        next_log_id:
            nextLogID || null,

        device:
            detectDevice(),

        user_agent:
            navigator.userAgent,

        viewport:
            `${window.innerWidth}x${window.innerHeight}`,

        online:
            navigator.onLine,

        language:
            navigator.language,

        timestamp:
            new Date().toISOString(),

        console_errors:
            []

    };

    /* =========================================
       SAVE FIRESTORE
    ========================================= */

    await setDoc(

        doc(
            db,
            "visit_logs",
            currentLogID
        ),

        visitData

    );

    /* =========================================
       SESSION STORAGE UPDATE
    ========================================= */

    sessionStorage.setItem(

        "anh_previous_log_id",

        currentLogID

    );

    sessionStorage.setItem(

        "anh_previous_page_url",

        currentPageURL

    );

}

/* =========================================================
   ANCHOR CLICK TRACKER
========================================================= */

function monitorAnchorClicks(){

    const anchors =
    document.querySelectorAll("a");

    anchors.forEach(anchor=>{

        anchor.addEventListener(

            "click",

            async()=>{

                const nextURL =
                anchor.href;

                if(!nextURL) return;

                const generatedNextLogID =
                generateLogID();

                sessionStorage.setItem(

                    "anh_next_log_id",

                    generatedNextLogID

                );

                try{

                    await updateDoc(

                        doc(
                            db,
                            "visit_logs",
                            currentLogID
                        ),

                        {

                            next_page_url:
                                nextURL,

                            next_log_id:
                                generatedNextLogID

                        }

                    );

                }
                catch(error){

                    console.log(error);

                }

            }

        );

    });

}

/* =========================================================
   RETURN VISIT POPUP
========================================================= */

function injectReturningPopup(){

    const previousURL =
    localStorage.getItem(
        "anh_last_url"
    );

    const previousTitle =
    localStorage.getItem(
        "anh_last_title"
    );

    if(!previousURL) return;

    const popup =
    document.createElement("div");

    popup.innerHTML = `

        <div id="anhReturnPopup">

            <h3>

                Previous Visit Detected

            </h3>

            <p>

                You previously visited:

            </p>

            <a href="${previousURL}">

                ${previousTitle}

            </a>

            <button id="anhClosePopup">

                Close

            </button>

        </div>

    `;

    document.body.appendChild(
        popup
    );

    const style =
    document.createElement("style");

    style.innerHTML = `

        #anhReturnPopup{

            position:fixed;
            right:20px;
            bottom:20px;
            width:320px;
            background:white;
            color:black;
            padding:20px;
            border-radius:12px;
            z-index:999999;

        }

        #anhReturnPopup a{

            display:block;
            margin:10px 0;
            color:#2563eb;
            word-break:break-word;

        }

        #anhReturnPopup button{

            width:100%;
            padding:12px;
            border:none;
            border-radius:8px;
            background:#2563eb;
            color:white;
            cursor:pointer;

        }

    `;

    document.head.appendChild(
        style
    );

    document
    .getElementById("anhClosePopup")
    .addEventListener("click",()=>{

        popup.remove();

    });

    /* =========================================
       SAVE CURRENT PAGE
    ========================================= */

    localStorage.setItem(

        "anh_last_url",

        currentPageURL

    );

    localStorage.setItem(

        "anh_last_title",

        currentPageTitle

    );

}

/* =========================================================
   DEVICE DETECTOR
========================================================= */

function detectDevice(){

    const width =
    window.innerWidth;

    if(width <= 600){

        return "Mobile";

    }

    else if(width <= 992){

        return "Tablet";

    }

    else{

        return "Desktop";

    }

}

/* =========================================================
   GENERATE LOG ID
========================================================= */

function generateLogID(){

    return "LOG_" +

    Math.floor(

        100000 +
        Math.random() * 900000

    );

}

/* =========================================================
   GLOBAL CONSOLE ERROR TRACKER
========================================================= */

window.addEventListener(

    "error",

    async(event)=>{

        try{

            if(!currentLogID) return;

            await updateDoc(

                doc(
                    db,
                    "visit_logs",
                    currentLogID
                ),

                {

                    console_errors:[
                        event.message
                    ]

                }

            );

        }
        catch(error){

            console.log(error);

        }

    }

);

/* =========================================================
   REDIRECT LOOP PROTECTION
========================================================= */

const redirectLock =

sessionStorage.getItem(
    "anh_redirect_processing"
);

if(redirectLock === "true"){

    sessionStorage.removeItem(
        "anh_redirect_processing"
    );

}

/* =========================================================
   BEFORE UNLOAD
========================================================= */

window.addEventListener(

    "beforeunload",

    ()=>{

        sessionStorage.setItem(

            "anh_previous_log_id",

            currentLogID

        );

        sessionStorage.setItem(

            "anh_previous_page_url",

            currentPageURL

        );

    }

);