import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    const { template_id, text0, text1 } = JSON.parse(event.body);

    if (!template_id || !text0 || !text1) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required parameters: template_id, text0, or text1." }),
      };
    }

    const response = await fetch("https://api.imgflip.com/caption_image", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        template_id,
        username: process.env.IMGFLIP_USERNAME,
        password: process.env.IMGFLIP_PASSWORD,
        text0,
        text1,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.error_message || "Failed to generate meme." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, url: data.data.url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error." }),
    };
  }
};
