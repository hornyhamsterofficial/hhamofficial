import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

async function fetchConfig() {
    try {
        const response = await fetch("/firebase-config"); // Fetch Firebase config from server
        console.log("Response Status:", response.status);
        
        if (!response.ok) {
            throw new Error("Failed to fetch Firebase config.");
        }

        const firebaseConfig = await response.json();
        console.log("Firebase Config:", firebaseConfig); // Debugging log
        
        const app = initializeApp(firebaseConfig); // Initialize Firebase
        
        return getFirestore(app); // Return Firestore instance
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        throw error;
    }
}

export default fetchConfig;
