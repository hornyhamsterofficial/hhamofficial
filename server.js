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
    apiKey: "AIzaSyDH1xf4EomoEN1MS9qrDVa9Y9ld03hg85Q",
    authDomain: "memegallery-38238.firebaseapp.com",
    projectId: "memegallery-38238",
    storageBucket: "985961553540",
    messagingSenderId: "985961553540",
    appId: "985961553540:web:d974213033ccdc62366cd1",
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
    const apiKey = "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"; // Replace with your OpenAI API key

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
                username: "hornyhamsterofficial",
                password: "abc123ABC123!",
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
        apiKey: "AIzaSyDH1xf4EomoEN1MS9qrDVa9Y9ld03hg85Q",
        authDomain: "memegallery-38238.firebaseapp.com",
        projectId: "memegallery-38238",
        storageBucket: "985961553540",
        messagingSenderId: "985961553540",
        appId: "985961553540:web:d974213033ccdc62366cd1",
        measurementId: "G-78B4V070RK",
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
