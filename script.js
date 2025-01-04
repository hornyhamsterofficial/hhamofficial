// Track the last scroll position
let lastScrollY = window.scrollY;

// Select elements for interaction
const navbar = document.querySelector('.navbar'); // Navbar must exist
const title = document.querySelector('#animated-title'); // Optional, for fade effect
const toggleButton = document.querySelector('.navbar-toggle'); // For collapsible menu
const navbarContainer = document.querySelector('.navbar-container'); // Container for links



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

// Check if gallery element exists
if (memeCollection) {
    // Placeholder memes array
    const memes = [
        "queen1.jpg",
        "hamsterkeikus.jpg",
        "hamster1.jpg",
        "hamster2.jpg",
        "queen2.jpg",
        "meme6.jpg",
        "meme7.jpg",
        "meme8.jpg"
    ];

    // Populate the gallery dynamically
    memes.forEach(meme => {
        const memeDiv = document.createElement("div");
        memeDiv.className = "gallery-item";
        memeDiv.innerHTML = `<img src="${meme}" alt="Meme">`;
        memeCollection.appendChild(memeDiv);
    });
}
