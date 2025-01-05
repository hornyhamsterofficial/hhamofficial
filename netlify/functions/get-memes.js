const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

exports.handler = async (event, context) => {
    try {
        const memesRef = collection(db, "memes");
        const querySnapshot = await getDocs(memesRef);

        const memes = [];
        querySnapshot.forEach((doc) => {
            memes.push(doc.data());
        });

        return {
            statusCode: 200,
            body: JSON.stringify(memes),
        };
    } catch (error) {
        console.error("Error fetching memes from Firestore:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch memes." }),
        };
    }
};
