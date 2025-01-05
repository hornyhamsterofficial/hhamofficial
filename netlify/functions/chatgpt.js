import fetch from "node-fetch";

export const handler = async (event) => {
  const { prompt } = JSON.parse(event.body);

  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Prompt is required." }),
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ response: data.choices[0].message.content }),
    };
  } catch (error) {
    console.error("Error with ChatGPT API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Failed to connect to ChatGPT API." }),
    };
  }
};
