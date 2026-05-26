/* =========================================================
   ANH NAVIGATION INTELLIGENCE ENGINE
   FILE : global.js

   ROLE :
   - Passive Auth Detection
   - Delayed Auth Injection
   - User Visit History
   - Page Diagnostics
   - Previous / Next Page Linking
   - Navigation Session Engine
   - Cross Site Tracking
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
    updateDoc,
    getDoc

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyAdlZ6GuhAcHSTZHVZJjoPx1V1zKg5tV3I",

    authDomain:
    "anh-dashboard-881238.firebaseapp.com",

    projectId:
    "anh-dashboard-881238",

    storageBucket:
    "anh-dashboard-881238.firebasestorage.app",

    messagingSenderId:
    "384383636180",

    appId:
    "1:384383636180:web:326d7dcb3d4fafd3b5e141",

    measurementId: "G-829D05T06E"

};

/* =========================================================
   FIREBASE INIT
========================================================= */

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

const provider =
new GoogleAuthProvider();

const db =
getFirestore(app);

/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentUser = null;

let currentLogID = null;

/* =========================================================
   PAGE INFO
========================================================= */

const pageInfo = {

    url:
    window.location.href,

    path:
    window.location.pathname,

    title:
    document.title,

    description:

        document
        .querySelector(
            'meta[name="description"]'
        )
        ?.content || "No Description",

    referrer:
    document.referrer,

    viewport:
    `${window.innerWidth}x${window.innerHeight}`,

    language:
    navigator.language,

    platform:
    navigator.platform,

    online:
    navigator.onLine,

    userAgent:
    navigator.userAgent,

    device:
    detectDevice(),

    timestamp:
    new Date().toISOString()

};

/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(auth, async(user)=>{

    /* =========================================
       USER LOGGED IN
    ========================================= */

    if(user){

        currentUser = user;

        await initializeVisitSession();

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
   INITIALIZE SESSION
========================================================= */

async function initializeVisitSession(){

    /* =========================================
       GENERATE CURRENT LOG ID
    ========================================= */

    currentLogID =
    generateLogID();

    /* =========================================
       READ PREVIOUS SESSION
    ========================================= */

    const previousLogID =

    sessionStorage.getItem(
        "anh_current_log_id"
    );

    const previousPageURL =

    sessionStorage.getItem(
        "anh_current_page_url"
    );

    const previousPageTitle =

    sessionStorage.getItem(
        "anh_current_page_title"
    );

    /* =========================================
       CURRENT VISIT OBJECT
    ========================================= */

    const visitObject = {

        uid:
        currentUser.uid,

        email:
        currentUser.email,

        current:{

            log_id:
            currentLogID,

            url:
            pageInfo.url,

            path:
            pageInfo.path,

            title:
            pageInfo.title,

            description:
            pageInfo.description

        },

        previous:{

            log_id:
            previousLogID || null,

            url:
            previousPageURL || null,

            title:
            previousPageTitle || null

        },

        next:{

            log_id:null,
            url:null,
            title:null

        },

        diagnostics:{

            device:
            pageInfo.device,

            viewport:
            pageInfo.viewport,

            language:
            pageInfo.language,

            platform:
            pageInfo.platform,

            online:
            pageInfo.online,

            referrer:
            pageInfo.referrer,

            user_agent:
            pageInfo.userAgent,

            load_time:
            performance.now(),

            console_errors:[],

            warnings:[]

        },

        timestamp:
        pageInfo.timestamp

    };

    /* =========================================
       SAVE CURRENT VISIT
    ========================================= */

    await setDoc(

        doc(
            db,
            "visit_logs",
            currentLogID
        ),

        visitObject

    );

    /* =========================================
       UPDATE PREVIOUS PAGE
    ========================================= */

    if(previousLogID){

        try{

            await updateDoc(

                doc(
                    db,
                    "visit_logs",
                    previousLogID
                ),

                {

                    "next.log_id":
                    currentLogID,

                    "next.url":
                    pageInfo.url,

                    "next.title":
                    pageInfo.title

                }

            );

        }
        catch(error){

            console.log(error);

        }

    }

    /* =========================================
       SAVE CURRENT SESSION
    ========================================= */

    sessionStorage.setItem(

        "anh_current_log_id",

        currentLogID

    );

    sessionStorage.setItem(

        "anh_current_page_url",

        pageInfo.url

    );

    sessionStorage.setItem(

        "anh_current_page_title",

        pageInfo.title

    );

    /* =========================================
       LOCAL HISTORY MEMORY
    ========================================= */

    localStorage.setItem(

        "anh_last_url",

        pageInfo.url

    );

    localStorage.setItem(

        "anh_last_title",

        pageInfo.title

    );

    /* =========================================
       RETURN POPUP
    ========================================= */

    injectReturnPopup();

    /* =========================================
       CONSOLE TRACKING
    ========================================= */

    initializeConsoleTracking();

}

/* =========================================================
   AUTH CARD
========================================================= */

function injectAuthCard(){

    if(

        document.getElementById(
            "anhAuthOverlay"
        )

    ) return;

    const overlay =
    document.createElement("div");

    overlay.id =
    "anhAuthOverlay";

    overlay.innerHTML = `

        <div id="anhAuthCard">

            <h2>

                Continue with ANH

            </h2>

            <p>

                Sign In / Sign Up
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
       STYLE
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
            border-radius:14px;
            padding:25px;

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

    document.head.appendChild(style);

    /* =========================================
       GOOGLE LOGIN
    ========================================= */

    document
    .getElementById("anhGoogleBtn")
    .addEventListener("click",async()=>{

        try{

            await signInWithPopup(
                auth,
                provider
            );

            const dashboardURL =

            "https://anh-dashboard-881238.web.app";

            window.location.href =

            dashboardURL +

            "?mode=injector" +

            "&redirect=" +

            encodeURIComponent(
                window.location.href
            );

        }
        catch(error){

            console.log(error);

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
   RETURN VISIT POPUP
========================================================= */

function injectReturnPopup(){

    const lastURL =

    localStorage.getItem(
        "anh_last_url"
    );

    const lastTitle =

    localStorage.getItem(
        "anh_last_title"
    );

    if(!lastURL) return;

    if(lastURL === pageInfo.url) return;

    const popup =
    document.createElement("div");

    popup.innerHTML = `

        <div id="anhReturnPopup">

            <h3>

                Previous Visit

            </h3>

            <p>

                You previously visited:

            </p>

            <a href="${lastURL}">

                ${lastTitle}

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

    document.head.appendChild(style);

    document
    .getElementById("anhClosePopup")
    .addEventListener("click",()=>{

        popup.remove();

    });

}

/* =========================================================
   CONSOLE TRACKER
========================================================= */

function initializeConsoleTracking(){

    window.addEventListener(

        "error",

        async(event)=>{

            try{

                await updateDoc(

                    doc(
                        db,
                        "visit_logs",
                        currentLogID
                    ),

                    {

                        "diagnostics.console_errors":[

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
   LOG ID GENERATOR
========================================================= */

function generateLogID(){

    return "LOG_" +

    Math.floor(

        100000 +
        Math.random() * 900000

    );

}