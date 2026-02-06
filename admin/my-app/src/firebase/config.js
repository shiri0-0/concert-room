// Install: npm install firebase

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBVzIkSbYBkZ3XyO1wk8SFvFtu1tM0ZftA",
  authDomain: "concert-e5ec5.firebaseapp.com",
  databaseURL: "https://concert-e5ec5-default-rtdb.firebaseio.com",
  projectId: "concert-e5ec5",
  storageBucket: "concert-e5ec5.firebasestorage.app",
  messagingSenderId: "536245746124",
  appId: "1:536245746124:web:58e8fbda7c68bc988f0569",
  measurementId: "G-RG4KVCZ13K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// HOW TO SETUP FIREBASE:
// 1. Go to https://console.firebase.google.com/
// 2. Create new project: "concert-booking"
// 3. Enable Realtime Database (not Firestore)
// 4. Set Database Rules to:
/*
{
  "rules": {
    "concerts": {
      "$concertId": {
        "bookedSeats": {
          ".read": true,
          ".write": true
        }
      }
    }
  }
}
*/
// 5. Copy config from Project Settings > General > Your apps
// 6. Replace values above