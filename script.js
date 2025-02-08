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

// Fetch JSON data
async function loadPlaylist() {
    try {
        const response = await fetch('songs.json');
        const data = await response.json();

        console.log('Fetched Playlist:', data);

        playlist = data.songs || data; // Handle both {songs: [...]} or [...] JSON structures

        if (playlist.length > 0) {
            loadSong(0);

            // Show popup after playlist loads
            promptUserToPlay();
        } else {
            console.warn('Playlist is empty.');
        }
    } catch (error) {
        console.error('Error loading playlist:', error);
        alert('Failed to load playlist.');
    }
}

// Load the song details
function loadSong(index) {
    if (index >= 0 && index < playlist.length) {
        currentSongIndex = index;
        const song = playlist[currentSongIndex];

        console.log(`Loading song: ${song.title} from ${song.url}`);

        songTitle.textContent = song.title;
        songTitle.classList.add("scroll-title");

        try {
            audio.src = encodeURI(song.url);
            audio.load();
        } catch (err) {
            console.error(`Error loading audio: ${err.message}`);
            alert("Unable to load the song.");
        }
    } else {
        console.error('Invalid song index');
    }
}

// Prompt user to start the music
function promptUserToPlay() {
    const userConfirmed = window.confirm("Click OK to start the music!");

    if (userConfirmed) {
        attemptAutoPlay();
    } else {
        console.log("User declined to start the music.");
    }
}

// Attempt to autoplay the song
function attemptAutoPlay() {
    audio
        .play()
        .then(() => {
            console.log(`Autoplaying: ${playlist[currentSongIndex].title}`);
            isPlaying = true;
            playPauseBtn.textContent = "⏸"; // Pause icon
        })
        .catch((error) => {
            console.warn("Autoplay blocked:", error.message);
            alert("Autoplay failed. Please click the play button manually.");
        });
}

// Pause or resume playback
function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playPauseBtn.textContent = "▶"; // Play icon
    } else {
        attemptAutoPlay();
    }
}

// Play the next song
function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    attemptAutoPlay(); // Automatically play the next song
}

// Play the previous song
function playPrevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
    attemptAutoPlay(); // Automatically play the previous song
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
    body.classList.forEach(className => {
        if (className.startsWith("theme-")) {
            body.classList.remove(className);
        }
    });

    if (theme !== "default") {
        body.classList.add(`theme-${theme}`);
    }

    localStorage.setItem("selectedTheme", theme);
}

// Event listener for theme selection
themeDropdown.addEventListener("change", function () {
    updateTheme(this.value);
});

// Load playlist on page load
document.addEventListener("DOMContentLoaded", loadPlaylist);
