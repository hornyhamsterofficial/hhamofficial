// API endpoints for Netlify functions
const generateMemeEndpoint = "/.netlify/functions/generate-meme";
const fetchMemesEndpoint = "/.netlify/functions/fetch-memes";
const downloadImageEndpoint = "/.netlify/functions/download";

// Select elements for interaction
const navbar = document.querySelector('.navbar'); // Navbar must exist
const title = document.querySelector('#animated-title'); // Optional, for fade effect
const toggleButton = document.querySelector('.navbar-toggle'); // For collapsible menu
const navbarContainer = document.querySelector('.navbar-container'); // Container for links
// Track the last scroll position
let lastScrollY = window.scrollY;

// Scroll Event Listener
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY) {
            // Scrolling down - hide navbar
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up - show navbar
            navbar.style.transform = 'translateY(0)';
        }

        // Update the last scroll position
        lastScrollY = window.scrollY;
    });
}

// Toggle Navbar Links for Mobile
if (toggleButton && navbarContainer) {
    toggleButton.addEventListener('click', () => {
        navbarContainer.classList.toggle('active'); // Toggle the active class
    });
}

// Debugging Messages
if (!navbar) {
    console.log('Navbar not found in the document.');
}

if (!toggleButton) {
    console.log('Navbar toggle button not found in the document.');
}

// Dynamic Gallery Population
const memeCollection = document.getElementById("memeCollection");
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");

// Add Modal Listeners
function attachClickEventListeners() {
    const galleryImages = document.querySelectorAll(".gallery-item img");
    galleryImages.forEach(image => {
        image.addEventListener("click", () => {
            openModal(image.src);
        });
    });
}





async function generateMemeWithImgflip() {
    const templateId = document.getElementById("templateId").value || "181913649";
    const topText = document.getElementById("topText").value;
    const bottomText = document.getElementById("bottomText").value;

    const payload = {
        template_id: templateId,
        text0: topText,
        text1: bottomText,
    };

    console.log("Payload being sent:", payload);

    try {
        const response = await fetch(generateMemeEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Error in meme generation request.");
        const data = await response.json();

        if (data.success) {
            console.log("Meme generated successfully:", data.url);
            showMemeModal(data.url);
        } else {
            console.error("Error generating meme:", data.error);
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred while generating the meme.");
    }
}


// Add an event listener to your button
document.querySelector(".custom-btn").addEventListener("click", generateMemeWithImgflip);


// Modal Functions
function openModal(src) {
    if (modal && modalImage) {
        modal.style.display = "flex";
        modalImage.src = src;

        let downloadBtn = modal.querySelector(".download-btn");
        if (!downloadBtn) {
            downloadBtn = document.createElement("button");
            downloadBtn.className = "download-btn";
            downloadBtn.textContent = "Download Meme";
            modal.appendChild(downloadBtn);
        }

        // Update download button functionality
        downloadBtn.onclick = () => downloadMeme(src);
    }
}

function closeModal() {
    if (modal) {
        modal.style.display = "none";
        const downloadBtn = modal.querySelector(".download-btn");
        if (downloadBtn) {
            modal.removeChild(downloadBtn);
        }
    }
}

async function downloadMeme(imageUrl) {
    try {
        const response = await fetch(`${downloadImageEndpoint}?url=${encodeURIComponent(imageUrl)}`);
        if (!response.ok) throw new Error("Failed to download image.");

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = imageUrl.split("/").pop();
        link.click();
    } catch (error) {
        console.error("Error downloading meme:", error);
    }
}


// Attach modal close event
document.querySelector(".modal-close")?.addEventListener("click", closeModal);

// Check if gallery element exists
if (window.location.pathname === "/html/gallery.html" && memeCollection) {
    // Placeholder memes array
    const staticMemes = [
        "/images/queen1.jpg",
        "/images/hamsterkeikus.jpg",
        "/images/hamster1.jpg",
        "/images/hamster2.jpg",
        "/images/queen2.jpg"
    ];


    console.log("Static memes before:", staticMemes);
    // Populate the gallery dynamically
    staticMemes.forEach(meme => {
        const memeDiv = document.createElement("div");
        memeDiv.className = "gallery-item";
        memeDiv.innerHTML = `<img src="${meme}" alt="static Meme ">`;
        memeCollection.appendChild(memeDiv);
    });

    console.log("Static memes added to the gallery. after");
    attachClickEventListeners(); // Attach modal functionality for static memes
}

// Fetch and populate dynamic memes
async function fetchDynamicMemes() {
    if (!memeCollection) {
        console.error("memeCollection element not found. Aborting fetchDynamicMemes.");
        return;
    }

    try {
        const response = await fetch(fetchMemesEndpoint);
        if (!response.ok) throw new Error("Failed to fetch memes.");

        const { memes } = await response.json();
        memes.forEach((meme) => {
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
    } catch (error) {
        console.error("Error fetching dynamic memes:", error);
    }
}

// Execute fetchDynamicMemes only if the user is on gallery.html
if (window.location.pathname === "/html/gallery.html") {
    fetchDynamicMemes();
}

// ChatGPT interaction
async function askChatGPT() {
    const userPrompt = document.getElementById("chatgptPrompt").value;
    const responseElement = document.getElementById("chatgptResponse");

    if (!userPrompt.trim()) {
        responseElement.innerHTML = "Please enter a valid question.";
        responseElement.style.display = "block";
        return;
    }

    const prompt = `Pretend it is the year 2025. Generate plausible, creative, hilarious, and entertaining answers.\n\nUser: ${userPrompt}\nAI:`;

    responseElement.style.display = "block";
    responseElement.innerHTML = "Thinking...";

    try {
        const response = await fetch("/.netlify/functions/chatgpt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) throw new Error("Error in ChatGPT request.");

        const data = await response.json();
        responseElement.innerHTML = data.response || "No response. Try asking something else.";
    } catch (error) {
        console.error("Error with ChatGPT:", error);
        responseElement.innerHTML = "An unexpected error occurred.";
    }

    setTimeout(() => {
        responseElement.innerHTML = "";
        responseElement.style.display = "none";
    }, 8000);
}


function handleKeyPress(event) {
    if (event.key === "Enter") {
        askChatGPT();
    }
}
