// API endpoints
const generateMemeEndpoint = "/.netlify/functions/generate-meme";
const fetchMemesEndpoint = "/.netlify/functions/fetch-memes";
const chatGPTEndpoint = "/.netlify/functions/chatgpt";

// Modal and gallery setup
const memeCollection = document.getElementById("memeCollection");
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");

// Generate Meme
async function generateMemeWithImgflip() {
  const templateId = document.getElementById("templateId").value || "181913649";
  const topText = document.getElementById("topText").value;
  const bottomText = document.getElementById("bottomText").value;

  try {
    const response = await fetch(generateMemeEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: templateId, text0: topText, text1: bottomText }),
    });

    const data = await response.json();

    if (data.success) {
      showMemeModal(data.url);
    } else {
      alert(`Error generating meme: ${data.error}`);
    }
  } catch (error) {
    console.error("Error generating meme:", error);
  }
}

// Populate Gallery
async function fetchDynamicMemes() {
  try {
    const response = await fetch(fetchMemesEndpoint);
    const { memes } = await response.json();

    memes.forEach((meme) => {
      const memeDiv = document.createElement("div");
      memeDiv.className = "gallery-item";
      memeDiv.innerHTML = `<img src="${meme.url}" alt="Dynamic Meme">`;
      memeCollection.appendChild(memeDiv);
    });
  } catch (error) {
    console.error("Error fetching memes:", error);
  }
}

// Show Modal
function showMemeModal(imageUrl) {
  modalImage.src = imageUrl;
  modal.style.display = "flex";
}

// Close Modal
function closeModal() {
  modal.style.display = "none";
}

// ChatGPT Integration
async function askChatGPT() {
  const prompt = document.getElementById("chatgptPrompt").value;

  try {
    const response = await fetch(chatGPTEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    document.getElementById("chatgptResponse").innerText = data.response || "No response received.";
  } catch (error) {
    console.error("Error communicating with ChatGPT:", error);
  }
}

// Event Listeners
document.querySelector(".custom-btn")?.addEventListener("click", generateMemeWithImgflip);
document.querySelector(".chatgpt-btn")?.addEventListener("click", askChatGPT);
document.querySelector(".modal-close")?.addEventListener("click", closeModal);

// Fetch memes on gallery page
if (window.location.pathname.includes("gallery")) fetchDynamicMemes();
