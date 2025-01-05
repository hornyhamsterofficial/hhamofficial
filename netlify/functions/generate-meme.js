const fetch = require("node-fetch");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");

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
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    const { template_id, text0, text1 } = JSON.parse(event.body);

    try {
        const response = await fetch("https://api.imgflip.com/caption_image", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                template_id,
                username: process.env.IMGFLIP_USERNAME,
                password: process.env.IMGFLIP_PASSWORD,
                text0,
                text1,
                no_watermark: "true",
            }),
        });

        const data = await response.json();
        if (data.success) {
            const memeUrl = data.data.url;

            // Save meme URL to Firestore
            const memeCollection = collection(db, "memes");
            const docRef = await addDoc(memeCollection, { url: memeUrl });

            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, url: memeUrl, docId: docRef.id }),
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, error: data.error_message }),
            };
        }
    } catch (error) {
        console.error("Error generating meme or saving to Firebase:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: "Internal Server Error" }),
        };
    }
};
