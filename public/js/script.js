// API endpoints
const generateMemeEndpoint = "/.netlify/functions/generate-meme";
const fetchMemesEndpoint = "/.netlify/functions/fetch-memes";
const chatGPTEndpoint = "/.netlify/functions/chatgpt";

// Modal and gallery setup
const memeCollection = document.getElementById("memeCollection");
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");



// Toggle Navbar Links for Mobile
const toggleButton = document.querySelector(".navbar-toggle");
const navbarContainer = document.querySelector(".navbar-container");

if (toggleButton && navbarContainer) {
    toggleButton.addEventListener("click", () => {
        navbarContainer.classList.toggle("active"); // Toggle the active class
    });
} else {
    console.error("Navbar toggle or container not found.");
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
            memeDiv.innerHTML = `
                <img src="${meme}" alt="Static Meme" onclick="showMemeModal('${meme}')">
            `;
            memeCollection.appendChild(memeDiv);
        });
        console.log("Static memes added to gallery.");
    }
}

// Generate Meme
async function generateMemeWithImgflip() {
    const templateId = document.getElementById("templateId").value || "181913649";
    const topText = document.getElementById("topText").value.trim();
    const bottomText = document.getElementById("bottomText").value.trim();

    console.log("trying to create meme before", templateId);
    


    if (!topText || !bottomText) {
        alert("Please enter both top and bottom text.");
        return;
    }
    console.log("Creating meme with:", { templateId, topText, bottomText });
    try {
        const response = await fetch(generateMemeEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ template_id: templateId, text0: topText, text1: bottomText, no_watermark: true }),
        });

        console.log("Template ID:", templateId);
        console.log("Top Text:", topText);
        console.log("Bottom Text:", bottomText);

        // if (!response.ok) {
        //     throw new Error(`Failed to create meme: ${response.statusText}`);
        // }

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

async function downloadMeme(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Failed to download meme.");

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "meme.jpg"; // Default filename
        link.click();

        console.log("Meme downloaded successfully.");
    } catch (error) {
        console.error("Error downloading meme:", error);
    }
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


        // JavaScript for Slideshow
        let currentSlideIndex = 0;
        const slides = document.querySelectorAll(".slide");

        function showSlide(index) {
            // Ensure the index wraps around using the modulo operator
            currentSlideIndex = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => {
                slide.style.display = i === currentSlideIndex ? "block" : "none";
            });
        }

        function changeSlide(direction) {
            // Adjust the index by direction and then show the appropriate slide
            currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
            showSlide(currentSlideIndex);
        }

        // Automatically show the first slide
        showSlide(currentSlideIndex);

        // Optional: Add autoplay functionality (e.g., every 5 seconds)
        setInterval(() => {
            changeSlide(1); // Move to the next slide
        }, 3400); // Adjust the interval as needed (5000ms = 5 seconds)




        function showMemeModal(imageUrl) {
            console.log("Displaying meme in modal:", imageUrl);


            // Select all existing modals and remove them
            const existingModals = document.querySelectorAll(".modal");
            existingModals.forEach((modal) => modal.remove());

            const modal = document.createElement("div");
            modal.className = "modal";
            modal.innerHTML = `
        <span class="modal-close" onclick="closeModal(this)">🐹</span>
        <img src="${imageUrl}" alt="Generated Meme">
        <button class="view-gallery-btn" onclick="redirectToGallery()">View in Gallery</button>
    `;
            document.body.appendChild(modal);
            modal.style.display = "flex";
        }
        function redirectToGallery() {
            window.location.href = "gallery.html"; // Ensure this is the correct path to your gallery page
        }


        function closeModal(modalCloseBtn) {
            const modal = modalCloseBtn.parentElement;
            modal.style.display = "none";
            document.body.removeChild(modal);
            console.log("modalclosed");

        }
        // function downloadMeme(imageUrl) {
        //     const link = document.createElement("a");
        //     link.href = imageUrl;
        //     link.download = "HHAMmeme.jpg"; // Default file name
        //     document.body.appendChild(link); // Append the link for triggering
        //     link.click(); // Simulate the click
        //     document.body.removeChild(link); // Clean up after download
        //     console.log("Download initiated for:", imageUrl);
        // }



        // Dropdown functionality
        document.querySelector(".dropdown-toggle").addEventListener("click", function () {
            const dropdown = document.querySelector(".dropdown");
            dropdown.classList.toggle("open");
        });

        function selectTemplateId(templateId) {
            const inputField = document.getElementById("templateId");
            inputField.value = templateId;

            // Close the dropdown after selection
            const dropdown = document.querySelector(".dropdown");
            dropdown.classList.remove("open");
        }

        // Close dropdown if user clicks outside
        document.addEventListener("click", function (event) {
            const dropdown = document.querySelector(".dropdown");
            const container = document.querySelector(".dropdown-container");
            if (!container.contains(event.target)) {
                dropdown.classList.remove("open");
            }
        });
    






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
