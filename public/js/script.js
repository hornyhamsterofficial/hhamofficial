// API endpoints for Netlify functions
const generateMemeEndpoint = "/.netlify/functions/generate-meme";
const fetchMemesEndpoint = "/.netlify/functions/fetch-memes";
const downloadImageEndpoint = "/.netlify/functions/download";

// Select elements for interaction
const navbar = document.querySelector('.navbar');
const toggleButton = document.querySelector('.navbar-toggle');
const navbarContainer = document.querySelector('.navbar-container');
let lastScrollY = window.scrollY;

// Scroll Event Listener: Shows or hides the navbar based on scroll direction
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.style.transform = (window.scrollY > lastScrollY) ? 'translateY(-100%)' : 'translateY(0)';
        lastScrollY = window.scrollY;
    });
}

// Toggle Navbar Links for Mobile: Toggles active class on click
if (toggleButton && navbarContainer) {
    toggleButton.addEventListener('click', () => {
        navbarContainer.classList.toggle('active');
    });
}

// Dynamic Gallery Population
const memeCollection = document.getElementById("memeCollection");
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");

// Attach click event listeners to gallery images
function attachClickEventListeners() {
    const galleryImages = document.querySelectorAll(".gallery-item img");
    galleryImages.forEach(image => {
        image.addEventListener("click", () => {
            openModal(image.src);
        });
    });
}

// Generate Meme with Imgflip API (via Netlify function)
async function generateMemeWithImgflip() {
    const templateId = document.getElementById("templateId").value || "181913649"; // Default template
    const topText = document.getElementById("topText").value;
    const bottomText = document.getElementById("bottomText").value;

    const payload = { template_id: templateId, text0: topText, text1: bottomText };

    try {
        const response = await fetch(generateMemeEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await response.json();

        if (data.success) {
            console.log("Meme generated:", data.url);
            showMemeModal(data.url);
        } else {
            alert("Error generating meme: " + data.error);
        }
    } catch (error) {
        console.error("Error generating meme:", error);
    }
}

// Modal to Display Generated Meme
function showMemeModal(imageUrl) {
    if (!modal || !modalImage) return;

    modalImage.src = imageUrl;
    modal.style.display = "flex";

    const downloadBtn = document.createElement("button");
    downloadBtn.className = "download-btn";
    downloadBtn.textContent = "Download Meme";
    downloadBtn.onclick = () => downloadMeme(imageUrl);
    modal.appendChild(downloadBtn);
}

// Close Modal
function closeModal() {
    if (modal) {
        modal.style.display = "none";
        const downloadBtn = modal.querySelector(".download-btn");
        if (downloadBtn) modal.removeChild(downloadBtn);
    }
}

// Download Meme
async function downloadMeme(imageUrl) {
    try {
        const response = await fetch(`${downloadImageEndpoint}?url=${encodeURIComponent(imageUrl)}`);
        if (!response.ok) throw new Error("Failed to download image.");

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "meme.jpg"; // Default file name
        link.click();
    } catch (error) {
        console.error("Error downloading meme:", error);
    }
}

// Fetch and Display Static Memes in Gallery
function populateStaticMemes() {
    const staticMemes = [
        "/images/queen1.jpg",
        "/images/hamsterkeikus.jpg",
        "/images/hamster1.jpg",
        "/images/hamster2.jpg",
        "/images/queen2.jpg"
    ];

    staticMemes.forEach(meme => {
        const memeDiv = document.createElement("div");
        memeDiv.className = "gallery-item";
        memeDiv.innerHTML = `<img src="${meme}" alt="Static Meme">`;
        memeCollection.appendChild(memeDiv);
    });

    console.log("Static memes added to the gallery.");
    attachClickEventListeners();
}

// Fetch and Populate Dynamic Memes from Database
async function fetchDynamicMemes() {
    try {
        const response = await fetch(fetchMemesEndpoint);
        if (!response.ok) throw new Error("Failed to fetch memes.");

        const { memes } = await response.json();
        memes.forEach(meme => {
            if (!meme.url) {
                console.error("Missing URL for a dynamic meme:", meme);
                return;
            }

            const memeDiv = document.createElement("div");
            memeDiv.className = "gallery-item";
            memeDiv.innerHTML = `<img src="${meme.url}" alt="Dynamic Meme">`;
            memeCollection.appendChild(memeDiv);
        });

        console.log("Dynamic memes fetched and displayed.");
        attachClickEventListeners();
    } catch (error) {
        console.error("Error fetching dynamic memes:", error);
    }
}

// ChatGPT Interaction
async function askChatGPT() {
    const userPrompt = document.getElementById("chatgptPrompt").value;
    const responseElement = document.getElementById("chatgptResponse");

    if (!userPrompt.trim()) {
        responseElement.innerHTML = "Please enter a valid question.";
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
        responseElement.innerHTML = "Error communicating with ChatGPT.";
    }
}

// Initialize Gallery if on Gallery Page
if (window.location.pathname === "/html/gallery.html" && memeCollection) {
    populateStaticMemes();
    fetchDynamicMemes();
}

// Event Listeners
document.querySelector(".custom-btn")?.addEventListener("click", generateMemeWithImgflip);
document.querySelector(".modal-close")?.addEventListener("click", closeModal);
document.addEventListener("keypress", (event) => {
    if (event.key === "Enter") askChatGPT();
});
