// Toggle the navbar visibility
function toggleNav() {
    const topnav = document.getElementById("topnav");
    topnav.classList.toggle("show-nav");
}

// Close navbar if user clicks outside
document.addEventListener("click", function (event) {
    const topnav = document.getElementById("topnav");
    const toggleBtn = document.getElementById("toggleBtn");

    if (!topnav.contains(event.target) && event.target !== toggleBtn) {
        topnav.classList.remove("show-nav");
    }
});

// Get music player elements
const playPauseBtn = document.getElementById("play-pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const songTitle = document.getElementById("song-title");
const songLength = document.getElementById("song-length");
const progressBar = document.getElementById("progress");
const volumeSlider = document.getElementById("volume-slider");

const audio = new Audio();
let isPlaying = false;
let playlist = [];
let currentSongIndex = 0;

// Load Playlist with CORS Proxy
async function loadPlaylist() {
    const proxyUrl = "https://corsproxy.io/?";
    const songsJsonUrl = "https://drive.google.com/uc?export=download&id=1sTEXw3H2j1avAxXuUvPWsJSbfi9IvWhq";
    
    fetch(proxyUrl + songsJsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            playlist = data;
            loadSong(currentSongIndex);
        })
        .catch(error => console.error("Error loading playlist:", error));
    
    try {
        const response = await fetch(corsProxy + jsonUrl);
        const data = await response.json();
        playlist = data;
        loadSong(0);
        console.log("Playlist loaded successfully!");
    } catch (error) {
        console.error("Error loading playlist:", error);
        alert("Failed to load the playlist.");
    }
}

// Load the current song
function loadSong(index) {
    if (playlist.length === 0) {
        console.error("Playlist is empty.");
        return;
    }

    const song = playlist[index];
    audio.src = song.url;
    songTitle.textContent = song.name;
}

// Play the current song
function playCurrentSong() {
    if (!audio.src) {
        console.error("No valid song source found.");
        alert("No valid song source found.");
        return;
    }

    audio
        .play()
        .then(() => {
            console.log(`Playing: ${playlist[currentSongIndex].name}`);
            isPlaying = true;
            playPauseBtn.textContent = "ll"; // Pause icon
        })
        .catch((error) => {
            console.error("Error playing audio:", error);
            alert("Unable to play the song.");
        });
}

// Pause or resume playback
function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playPauseBtn.textContent = "▶"; // Play icon
    } else {
        playCurrentSong();
    }
}

// Play the next song
function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    playCurrentSong();
}

// Play the previous song
function playPrevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
    playCurrentSong();
}

// Auto-play next song when current song ends
audio.addEventListener("ended", playNextSong);

// Update time and progress bar
audio.addEventListener("timeupdate", () => {
    if (!isNaN(audio.duration)) {
        const currentTime = formatTime(audio.currentTime);
        const durationTime = formatTime(audio.duration);
        songLength.textContent = `${currentTime} / ${durationTime}`;
        updateProgressBar();
    }
});

// Format time (mm:ss)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
}

// Update progress bar
function updateProgressBar() {
    if (audio.duration) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
    }
}

// Seek through song
progressBar.addEventListener("input", function (event) {
    const newTime = (event.target.value / 100) * audio.duration;
    audio.currentTime = newTime;
});

// Adjust volume
volumeSlider.addEventListener("input", function (event) {
    audio.volume = event.target.value / 100;
});

// Event Listeners for player buttons
playPauseBtn.addEventListener("click", togglePlayPause);
prevBtn.addEventListener("click", playPrevSong);
nextBtn.addEventListener("click", playNextSong);

// Event Listener for Navbar Toggle
document.getElementById("toggleBtn").addEventListener("click", toggleNav);

// Get theme dropdown element
const themeDropdown = document.getElementById("theme-dropdown");
const body = document.body;

// Load the saved theme from localStorage (if available)
const savedTheme = localStorage.getItem("selectedTheme");
if (savedTheme) {
    body.classList.add(`theme-${savedTheme}`);
    themeDropdown.value = savedTheme;
}

// Function to update the theme
function updateTheme(theme) {
    // Remove existing theme classes
    body.classList.forEach(className => {
        if (className.startsWith("theme-")) {
            body.classList.remove(className);
        }
    });

    // Apply the new theme
    if (theme !== "default") {
        body.classList.add(`theme-${theme}`);
    }

    // Save the theme to localStorage
    localStorage.setItem("selectedTheme", theme);
}

// Event listener for theme selection
themeDropdown.addEventListener("change", function () {
    updateTheme(this.value);
});

// Load saved theme and playlist on page load
document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem("selectedTheme") || "default";
    console.log("Loaded saved theme:", savedTheme);
    themeDropdown.value = savedTheme;
    updateTheme(savedTheme);
    loadPlaylist();
});
