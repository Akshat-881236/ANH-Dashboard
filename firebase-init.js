import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import { 
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import { 
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { 
  getAnalytics
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdlZ6GuhAcHSTZHVZJjoPx1V1zKg5tV3I",
  authDomain: "anh-dashboard-881238.firebaseapp.com",
  projectId: "anh-dashboard-881238",
  storageBucket: "anh-dashboard-881238.firebasestorage.app",
  messagingSenderId: "384383636180",
  appId: "1:384383636180:web:326d7dcb3d4fafd3b5e141",
  measurementId: "G-829D05T06E"
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

const db = getFirestore(app);

export {
  app,
  analytics,
  auth,
  provider,
  db
};