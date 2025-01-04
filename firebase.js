import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let db = null; // Declare Firestore database instance

// Function to load Firebase config from the server
async function fetchConfig() {
    try {
        if (!db) {
            // Fetch Firebase configuration
            const response = await fetch('/firebase-config');
            const firebaseConfig = await response.json();

            // Initialize Firebase App
            const app = initializeApp(firebaseConfig);

            // Initialize Firestore
            db = getFirestore(app);
        }
        return db;
    } catch (error) {
        console.error("Error fetching Firebase config or initializing Firestore:", error);
        throw error;
    }
}

export default fetchConfig;
