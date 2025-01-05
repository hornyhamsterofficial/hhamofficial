const fetch = require("node-fetch");

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!prompt) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Prompt is required." }),
        };
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
            return {
                statusCode: 200,
                body: JSON.stringify({ response: data.choices[0].message.content.trim() }),
            };
        } else {
            console.error("Unexpected API response:", data);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Invalid response from ChatGPT API.", details: data }),
            };
        }
    } catch (error) {
        console.error("Error with ChatGPT API:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to connect to ChatGPT API." }),
        };
    }
};
