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
    const topText = document.getElementById("topText").value.trim();
    const bottomText = document.getElementById("bottomText").value.trim();

    if (!topText || !bottomText) {
        alert("Please enter both top and bottom text.");
        return;
    }

    try {
        const response = await fetch("/.netlify/functions/generate-meme", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ template_id: templateId, text0: topText, text1: bottomText }),
        });

        const data = await response.json();
        if (data.success) {
            alert(`Meme created! URL: ${data.url}`);
        } else {
            alert(`Error creating meme: ${data.error}`);
        }
    } catch (error) {
        console.error("Error creating meme:", error);
        alert("An error occurred while creating the meme.");
    }
}


// Static Memes Array
const staticMemes = [
    "/images/queen1.jpg",
    "/images/hamsterkeikus.jpg",
    "/images/hamster1.jpg",
    "/images/hamster2.jpg",
    "/images/queen2.jpg"
];

// Add Static Memes to Gallery
function addStaticMemesToGallery() {
    if (memeCollection) {
        staticMemes.forEach((meme) => {
            const memeDiv = document.createElement("div");
            memeDiv.className = "gallery-item";
            memeDiv.innerHTML = `<img src="${meme}" alt="Static Meme">`;
            memeCollection.appendChild(memeDiv);
        });
        console.log("Static memes added to gallery.");
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
    const userPrompt = document.getElementById("chatgptPrompt").value.trim();
    const responseElement = document.getElementById("chatgptResponse");

    if (!userPrompt) {
        responseElement.innerHTML = "Please enter a valid question.";
        responseElement.style.display = "block";
        return;
    }

    try {
        const response = await fetch("/.netlify/functions/chatgpt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: userPrompt }),
        });
        const data = await response.json();
        responseElement.innerHTML = data.response || "No response received.";
    } catch (error) {
        responseElement.innerHTML = "An error occurred. Please try again later.";
        console.error("ChatGPT error:", error);
    }

    setTimeout(() => {
        responseElement.style.display = "none";
    }, 5000);
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        askChatGPT();
    }
}


// Event Listeners
document.querySelector(".custom-btn")?.addEventListener("click", generateMemeWithImgflip);
document.querySelector(".chatgpt-btn")?.addEventListener("click", askChatGPT);
document.querySelector(".modal-close")?.addEventListener("click", closeModal);

// Fetch memes on gallery page
if (window.location.pathname.includes("gallery")) fetchDynamicMemes();
if (memeCollection) {
    addStaticMemesToGallery();
    fetchDynamicMemes();
}
