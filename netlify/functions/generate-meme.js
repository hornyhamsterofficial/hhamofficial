import fetch from "node-fetch";

export const handler = async (event) => {
    try {
        const { template_id, text0, text1, no_watermark = true } = JSON.parse(event.body || "{}");

        // Validate required parameters
        if (!template_id || !text0 || !text1) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required parameters: template_id, text0, or text1." }),
            };
        }

         // Debug the inputs being sent to Imgflip API
         console.log("Sending to Imgflip:", { template_id, text0, text1 });

        //debug code
         const username = process.env.IMGFLIP_USERNAME;
        const password = process.env.IMGFLIP_PASSWORD;

        // Log environment variables to confirm they are set
        console.log("Imgflip credentials:", { username, password });

        if (!username || !password) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Imgflip credentials are not set in environment variables." }),
            };
        }



        // Make a request to the Imgflip API
        const response = await fetch("https://api.imgflip.com/caption_image", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                template_id,
                username: process.env.IMGFLIP_USERNAME,
                password: process.env.IMGFLIP_PASSWORD,
                text0,
                text1,
                boxes: JSON.stringify([
                  { text: text0 },
                  { text: text1 }
              ]),
              no_watermark: true,
            }),
        });

        // Debug the response from Imgflip
        console.log("Imgflip API Response:", data);

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
