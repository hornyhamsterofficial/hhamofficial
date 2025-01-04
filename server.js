const path = require("path");
const cors = require("cors");
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Define PORT
const PORT = process.env.PORT || 3000;


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

// Serve index.html as the default
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ChatGPT API route
app.post("/chatgpt", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.OPENAI_API_KEY; // Replace with your OpenAI API key

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // Updated model
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 150,
            }),
        });

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            res.json({ response: data.choices[0].message.content.trim() });
        } else {
            console.error("Unexpected API response:", data);
            res.status(500).json({
                error: "Invalid response from ChatGPT API.",
                details: data,
            });
        }
    } catch (error) {
        console.error("Error with ChatGPT API:", error);
        res.status(500).json({ error: "Failed to connect to ChatGPT API." });
    }
});

// memelogic


// Endpoint for generating a meme
app.post('/generate-meme', async (req, res) => {
    const { template_id, text0, text1 } = req.body;

    try {
        // Imgflip API call
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

            res.json({ success: true, url: memeUrl, docId: docRef.id });
        } else {
            res.status(400).json({ success: false, error: data.error_message });
        }
    } catch (error) {
        console.error("Error generating meme or saving to Firebase:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

app.get('/firebase-config', (req, res) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
