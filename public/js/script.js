// API endpoints
const generateMemeEndpoint = "/.netlify/functions/generate-meme";
const fetchMemesEndpoint = "/.netlify/functions/fetch-memes";
const chatGPTEndpoint = "/.netlify/functions/chatgpt";

// Modal and gallery setup
const memeCollection = document.getElementById("memeCollection");
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");


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
            memeDiv.innerHTML = `
                <img src="${meme}" alt="Static Meme" onclick="showMemeModal('${meme}')">
            `;
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
        memeDiv.innerHTML = `
                <img src="${meme.url}" alt="Dynamic Meme" onclick="showMemeModal('${meme.url}')">
            `;
        memeCollection.appendChild(memeDiv);
      });
      console.log("Dynamic memes fetched and added to gallery.");
    } catch (error) {
      console.error("Error fetching memes:", error);
    }
  }


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
        const response = await fetch(generateMemeEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ template_id: templateId, text0: topText, text1: bottomText }),
        });

        if (!response.ok) {
            throw new Error(`Failed to create meme: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
            alert(`Meme created! URL: ${data.url}`);
            showMemeModal(data.url); // Show the generated meme in a modal
        } else {
            alert(`Error creating meme: ${data.error}`);
        }
    } catch (error) {
        console.error("Error creating meme:", error);
        alert("An error occurred while creating the meme.");
    }
}



// Show Modal
function showMemeModal(imageUrl) {
    modalImage.src = imageUrl;
    modal.style.display = "flex";

    // Add download button logic
    const downloadBtn = document.createElement("button");
    downloadBtn.className = "download-btn";
    downloadBtn.textContent = "Download Meme";
    downloadBtn.onclick = () => downloadMeme(imageUrl);

    // Remove any previous button and add the new one
    modal.querySelector(".download-btn")?.remove();
    modal.appendChild(downloadBtn);
}

// Close Modal
function closeModal() {
    modal.style.display = "none";
    modal.querySelector(".download-btn")?.remove(); // Cleanup
}

function downloadMeme(imageUrl) {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "HHAM_Meme.jpg"; // Default file name
    link.click();
    console.log("Download initiated for:", imageUrl);
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
        const response = await fetch(chatGPTEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: userPrompt }),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch response: ${response.statusText}`);
        }
        const data = await response.json();
        responseElement.innerHTML = data.response || "No response received.";
    } catch (error) {
        responseElement.innerHTML = "An error occurred. Please try again later.";
        console.error("ChatGPT error:", error);
    }

    responseElement.style.display = "block";
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
document.getElementById("chatgptPrompt")?.addEventListener("keypress", handleKeyPress);

// Fetch memes on gallery page
// if (window.location.pathname.includes("gallery")) fetchDynamicMemes();
if (memeCollection) {
    addStaticMemesToGallery();
    fetchDynamicMemes();
}
