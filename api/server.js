import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { writeFileSync } from "fs";
import fetch from "node-fetch";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";


dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public"))); // Serve files from "public"



// Firebase initialization
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
    res.sendFile(path.join(__dirname, "../public/html/index.html"));
});

// Serve other HTML pages
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/about.html"));
});
app.get("/meme", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/meme.html"));
});
app.get("/gallery", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/gallery.html"));
});

// Firebase configuration endpoint
app.get("/firebase-config", (req, res) => {
    res.json(firebaseConfig);
});

// ChatGPT API route
app.post("/chatgpt", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

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
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 150,
            }),
        });

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            res.json({ response: data.choices[0].message.content.trim() || "No response." });
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

// Imgflip meme generation route
app.post("/generate-meme", async (req, res) => {
    const { template_id, text0, text1 } = req.body;

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

            res.json({ success: true, url: memeUrl, docId: docRef.id });
        } else {
            res.status(400).json({ success: false, error: data.error_message });
        }
    } catch (error) {
        console.error("Error generating meme:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Add this to your server.js
app.get("/api/memes", async (req, res) => {
    try {
        const memesRef = collection(db, "memes");
        const querySnapshot = await getDocs(memesRef);
        const memes = [];

        querySnapshot.forEach(doc => {
            memes.push(doc.data());
        });

        res.json({ success: true, memes });
    } catch (error) {
        console.error("Error fetching memes from Firestore:", error);
        res.status(500).json({ success: false, error: "Failed to fetch memes." });
    }
});

// Download images (proxy for database or external images)
app.get("/download", async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send("Image URL is required.");
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch image.");
        }

        const buffer = await response.arrayBuffer();
        const filename = path.basename(url);

        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", "application/octet-stream");
        res.send(buffer);
    } catch (error) {
        console.error("Error downloading image:", error);
        res.status(500).send("Failed to download image.");
    }
});

// Start server
// Define PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
