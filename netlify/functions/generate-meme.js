import fetch from "node-fetch";

export const handler = async (event) => {
    try {
        const { template_id, text0, text1 } = JSON.parse(event.body || "{}");

        // Validate required parameters
        if (!template_id || !text0 || !text1) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required parameters: template_id, text0, or text1." }),
            };
        }

        // Make a request to the Imgflip API
        const response = await fetch("https://api.imgflip.com/caption_image", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                template_id,
                username: "hornyhamsterofficial",
                password: "Cirrus0324!",
                text0,
                text1,
            }),
        });

        const data = await response.json();

        // Handle API errors
        if (!data.success) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: data.error_message || "Failed to generate meme." }),
            };
        }

        // Return the generated meme URL
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, url: data.data.url }),
        };
    } catch (error) {
        console.error("Error in generate-meme function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error." }),
        };
    }
};
