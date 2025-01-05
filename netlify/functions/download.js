import fetch from "node-fetch";

export const handler = async (event) => {
  const url = event.queryStringParameters.url;

  if (!url) {
    return {
      statusCode: 400,
      body: "Image URL is required.",
    };
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch image.");
    }

    const buffer = await response.arrayBuffer();
    const fileName = url.split("/").pop();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
      body: Buffer.from(buffer).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error("Error downloading image:", error);
    return {
      statusCode: 500,
      body: "Failed to download image.",
    };
  }
};
